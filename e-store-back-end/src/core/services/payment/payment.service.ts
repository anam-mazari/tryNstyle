import Stripe from 'stripe';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/core/db/entities/payment.entity';
import { Order } from 'src/core/db/entities/order.entity';
import {
  PendingCheckout,
  PendingCheckoutStatus,
} from 'src/core/db/entities/pending-checkout.entity';
import { CreateOrderDto } from 'src/core/services/order/create-order.dto';
import { OrdersService } from 'src/core/services/order/order.service';
import {
  getStripeCurrency,
  getStripeFrontendBaseUrl,
  getStripeSecretKey,
  getStripeWebhookSecret,
} from 'src/core/config/stripe.config';

/** Methods that use Stripe Checkout (hosted payment page). */
const STRIPE_HOSTED_CHECKOUT_METHODS = new Set([
  'credit_card',
  'debit_card',
  'paypal',
]);

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(PendingCheckout)
    private readonly pendingCheckoutRepo: Repository<PendingCheckout>,
    private readonly ordersService: OrdersService,
  ) {
    const secretKey = getStripeSecretKey();
    this.stripe = new Stripe(secretKey);
  }

  /**
   * Stripe Checkout first: no order until payment succeeds (webhook creates order + payment).
   */
  async createStripeCheckoutSession(dto: CreateOrderDto): Promise<{ url: string }> {
    if (!getStripeSecretKey()) {
      throw new BadRequestException('Stripe is not configured (STRIPE_SECRET_KEY)');
    }
    if (!STRIPE_HOSTED_CHECKOUT_METHODS.has(dto.payment_method)) {
      throw new BadRequestException(
        'Use cash on delivery for offline payment; Stripe Checkout is for card/PayPal options.',
      );
    }

    const total_amount = await this.ordersService.validateItemsAndComputeTotal(dto);
    const totalStr = total_amount.toFixed(2);

    const checkout_payload: PendingCheckout['checkout_payload'] = {
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      address_line2: dto.address_line2,
      city: dto.city,
      province: dto.province,
      postal_code: dto.postal_code,
      country: dto.country,
      shipping_address: dto.shipping_address,
      payment_method: 'stripe',
      items: dto.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    };

    const pending = this.pendingCheckoutRepo.create({
      checkout_payload,
      total_amount: totalStr,
      status: PendingCheckoutStatus.PENDING,
      stripe_session_id: null,
    });
    const savedPending = await this.pendingCheckoutRepo.save(pending);

    const baseUrl = getStripeFrontendBaseUrl();
    const currency = getStripeCurrency();

    const trimmedEmail = dto.email.trim();
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Order checkout ${savedPending.id}`,
            },
            unit_amount: Math.round(Number(totalStr) * 100),
          },
          quantity: 1,
        },
      ],
      ...(trimmedEmail.length > 0 ? { customer_email: trimmedEmail } : {}),
      metadata: {
        pending_checkout_id: String(savedPending.id),
      },
      client_reference_id: String(savedPending.id),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }

    savedPending.stripe_session_id = session.id;
    await this.pendingCheckoutRepo.save(savedPending);

    return { url: session.url };
  }

  /**
   * COD / offline: order already exists; only persist a pending payment row (no Stripe call).
   */
  async createPaymentForOrder(
    order_id: string,
    method: string,
    amount: number,
  ): Promise<Payment> {
    const order = await this.orderRepo.findOneBy({ order_id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = this.paymentRepo.create({
      order,
      payment_method: method,
      amount,
      payment_status: 'pending',
    });
    const saved = await this.paymentRepo.save(payment);
    const withOrder = await this.paymentRepo.findOne({
      where: { id: saved.id },
      relations: ['order'],
    });
    if (!withOrder) {
      throw new NotFoundException('Payment not found after save');
    }
    return withOrder;
  }

  async handleStripeWebhook(
    rawBody: Buffer,
    signature: string | string[] | undefined,
  ): Promise<{ received: boolean }> {
    const webhookSecret = getStripeWebhookSecret();
    if (!webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not set; refusing webhook');
      throw new BadRequestException('Webhook not configured');
    }

    const sig = Array.isArray(signature) ? signature[0] : signature;
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException('Invalid Stripe signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillCheckoutSession(session);
    }

    return { received: true };
  }

  /**
   * Called from the success page when webhooks are unavailable (e.g. local dev without Stripe CLI).
   * Retrieves the session from Stripe and runs the same fulfillment as the webhook (idempotent).
   */
  async syncCheckoutSessionFromStripe(sessionId: string): Promise<{
    status: 'complete' | 'processing' | 'unpaid' | 'failed';
    order?: Order;
  }> {
    if (!getStripeSecretKey()) {
      throw new BadRequestException('Stripe is not configured (STRIPE_SECRET_KEY)');
    }

    const existingPayment = await this.paymentRepo.findOne({
      where: { transaction_id: sessionId },
      relations: ['order', 'order.items', 'order.items.product', 'order.user'],
    });
    if (existingPayment?.order) {
      return { status: 'complete', order: existingPayment.order };
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Stripe sessions.retrieve failed: ${message}`);
      throw new NotFoundException('Stripe session not found');
    }

    if (session.payment_status !== 'paid') {
      return {
        status: session.payment_status === 'unpaid' ? 'unpaid' : 'processing',
      };
    }

    try {
      await this.fulfillCheckoutSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Fulfillment threw for session ${sessionId}: ${message}`);
      return { status: 'failed' };
    }

    const pendingRow = await this.pendingCheckoutRepo.findOne({
      where: { stripe_session_id: sessionId },
    });
    if (pendingRow?.status === PendingCheckoutStatus.FAILED) {
      return { status: 'failed' };
    }

    const paymentAfter = await this.paymentRepo.findOne({
      where: { transaction_id: sessionId },
      relations: ['order', 'order.items', 'order.items.product', 'order.user'],
    });
    if (paymentAfter?.order) {
      return { status: 'complete', order: paymentAfter.order };
    }

    this.logger.warn(
      `Session ${sessionId} is paid but order not in DB yet; will retry on next sync`,
    );
    return { status: 'processing' };
  }

  private centsMatch(expectedCents: number, paid: number | null): boolean {
    if (paid === null || paid === undefined) {
      return false;
    }
    return Math.abs(paid - expectedCents) <= 1;
  }

  /** Tax / rounding / FX can differ slightly from our server total. */
  private centsMatchLoose(expectedCents: number, paid: number): boolean {
    if (paid <= 0 || expectedCents <= 0) {
      return false;
    }
    const diff = Math.abs(paid - expectedCents);
    const tolerance = Math.max(50, Math.round(expectedCents * 0.04));
    return diff <= tolerance;
  }

  private async findPendingCheckoutRow(
    session: Stripe.Checkout.Session,
  ): Promise<PendingCheckout | null> {
    const fromMeta =
      session.metadata?.pending_checkout_id ?? session.client_reference_id;
    if (fromMeta) {
      const row = await this.pendingCheckoutRepo.findOne({
        where: { id: String(fromMeta) },
      });
      if (row) {
        return row;
      }
    }
    return this.pendingCheckoutRepo.findOne({
      where: { stripe_session_id: session.id },
    });
  }

  private resolvePaidAmountCents(session: Stripe.Checkout.Session): number {
    const fromTotal = session.amount_total ?? session.amount_subtotal;
    if (fromTotal !== null && fromTotal !== undefined) {
      return fromTotal;
    }
    const pi = session.payment_intent;
    if (typeof pi === 'object' && pi !== null && 'amount' in pi && typeof pi.amount === 'number') {
      return pi.amount;
    }
    return 0;
  }

  private async resolvePaidAmountCentsWithFallback(
    session: Stripe.Checkout.Session,
  ): Promise<number> {
    let paid = this.resolvePaidAmountCents(session);
    if (paid > 0) {
      return paid;
    }
    const piRef = session.payment_intent;
    const piId =
      typeof piRef === 'string'
        ? piRef
        : piRef &&
            typeof piRef === 'object' &&
            'id' in piRef &&
            typeof (piRef as { id: unknown }).id === 'string'
          ? (piRef as { id: string }).id
          : null;
    if (!piId) {
      return 0;
    }
    try {
      const pi = await this.stripe.paymentIntents.retrieve(piId);
      return pi.amount;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Could not load PaymentIntent ${piId}: ${message}`);
      return 0;
    }
  }

  /**
   * Prefer shipping form values stored in pending_checkout (what the customer entered before Stripe).
   * Stripe/Link can show a different saved email; the order user should match our checkout form.
   */
  private resolveCustomerFromStripeSession(
    session: Stripe.Checkout.Session,
    payload: PendingCheckout['checkout_payload'],
  ): { username: string; email: string; phone: string } {
    const details = session.customer_details;
    const collected = session.collected_information;

    const formEmail = payload.email?.trim() || '';
    const stripeEmail =
      details?.email?.trim() ||
      session.customer_email?.trim() ||
      '';
    const email = formEmail || stripeEmail;

    const formUsername = payload.username?.trim() || '';
    const stripeUsername =
      details?.name?.trim() ||
      details?.individual_name?.trim() ||
      collected?.individual_name?.trim() ||
      collected?.shipping_details?.name?.trim() ||
      '';
    const username = formUsername || stripeUsername || 'Customer';

    const formPhone = payload.phone?.trim() || '';
    const stripePhone = details?.phone?.trim() || '';
    const phone = formPhone || stripePhone;

    const safeId = session.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    const emailResolved =
      email || `paid-${safeId || 'order'}@stripe-checkout.placeholder`;
    return { username, email: emailResolved, phone };
  }

  private async fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
    const existing = await this.paymentRepo.findOne({
      where: { transaction_id: session.id },
    });
    if (existing) {
      return;
    }

    const pending = await this.findPendingCheckoutRow(session);
    if (!pending) {
      this.logger.warn(
        `No pending checkout row for Stripe session ${session.id} (metadata / client_reference / stripe_session_id)`,
      );
      return;
    }
    if (pending.status !== PendingCheckoutStatus.PENDING) {
      this.logger.warn(
        `Pending checkout ${pending.id} status is ${pending.status}, skipping fulfillment`,
      );
      return;
    }

    const expectedCents = Math.round(Number(pending.total_amount) * 100);

    let resolvedSession: Stripe.Checkout.Session;
    try {
      resolvedSession = await this.stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent'],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to load Checkout Session ${session.id} for fulfillment: ${message}`,
      );
      throw err;
    }

    if (resolvedSession.payment_status !== 'paid') {
      this.logger.warn(
        `Session ${resolvedSession.id} payment_status=${resolvedSession.payment_status}, not creating order`,
      );
      return;
    }

    const paid = await this.resolvePaidAmountCentsWithFallback(resolvedSession);
    const exact = this.centsMatch(expectedCents, paid);
    const loose = this.centsMatchLoose(expectedCents, paid);
    if (!exact && !loose) {
      this.logger.warn(
        `Stripe amount differs from pending (paidCents=${paid} expected=${expectedCents} ` +
          `amount_total=${resolvedSession.amount_total}) — creating order because payment succeeded`,
      );
    }

    const payload = pending.checkout_payload;
    const fromStripe = this.resolveCustomerFromStripeSession(resolvedSession, payload);
    const createDto: CreateOrderDto = {
      username: fromStripe.username,
      email: fromStripe.email,
      phone: fromStripe.phone || '',
      address: payload.address ?? '',
      address_line2: payload.address_line2,
      city: payload.city ?? 'Unknown',
      province: payload.province ?? 'Unknown',
      postal_code: payload.postal_code ?? '00000',
      country: payload.country ?? 'Unknown',
      shipping_address: payload.shipping_address,
      payment_method: 'stripe',
      items: payload.items,
    };

    try {
      const order = await this.ordersService.create(createDto);
      order.order_status = 'paid';
      await this.orderRepo.save(order);

      const payment = this.paymentRepo.create({
        order,
        payment_method: 'stripe',
        amount: Number(pending.total_amount),
        payment_status: 'success',
        transaction_id: resolvedSession.id,
      });
      await this.paymentRepo.save(payment);

      pending.status = PendingCheckoutStatus.COMPLETED;
      pending.stripe_session_id = resolvedSession.id;
      await this.pendingCheckoutRepo.save(pending);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to create order after Stripe payment: ${message}`);
      pending.status = PendingCheckoutStatus.FAILED;
      await this.pendingCheckoutRepo.save(pending);
      throw err;
    }
  }

  async getOrderByStripeSessionId(sessionId: string): Promise<{
    status: 'complete' | 'processing' | 'unpaid' | 'failed';
    order?: Order;
  }> {
    const payment = await this.paymentRepo.findOne({
      where: { transaction_id: sessionId },
      relations: ['order', 'order.items', 'order.items.product', 'order.user'],
    });
    if (payment?.order) {
      return { status: 'complete', order: payment.order };
    }

    const pending = await this.pendingCheckoutRepo.findOne({
      where: { stripe_session_id: sessionId },
    });
    if (pending?.status === PendingCheckoutStatus.PENDING) {
      return { status: 'processing' };
    }
    if (pending?.status === PendingCheckoutStatus.FAILED) {
      return { status: 'failed' };
    }

    throw new NotFoundException('Checkout session not found or already expired');
  }

  async updatePaymentStatus(
    id: string,
    status: 'success' | 'failed',
    transaction_id?: string,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.payment_status = status;
    if (transaction_id) {
      payment.transaction_id = transaction_id;
    }

    await this.paymentRepo.save(payment);

    if (status === 'success' && payment.order) {
      payment.order.order_status = 'paid';
      await this.orderRepo.save(payment.order);
    }

    return payment;
  }

  async findPayment(id: string) {
    return this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
  }
}
