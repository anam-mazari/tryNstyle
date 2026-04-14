import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from 'src/core/services/payment/payment.service';
import { CreateOrderDto } from 'src/core/services/order/create-order.dto';
import { CreateCodPaymentBodyDto } from 'src/core/services/payment/create-cod-payment.dto';
import { UpdatePaymentBodyDto } from 'src/core/services/payment/update-payment.dto';
import { SyncStripeSessionDto } from 'src/core/services/payment/sync-stripe-session.dto';

type StripeWebhookRequest = RawBodyRequest<import('express').Request>;

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Stripe Checkout (sandbox: sk_test_*). Order is created after successful payment via webhook.
   */
  @Post('stripe/checkout-session')
  createStripeCheckoutSession(@Body() body: CreateOrderDto) {
    return this.paymentService.createStripeCheckoutSession(body);
  }

  /**
   * Success page polls until webhook has created the order.
   */
  @Get('stripe/session/:sessionId/order')
  getOrderForStripeSession(@Param('sessionId') sessionId: string) {
    return this.paymentService.getOrderByStripeSessionId(sessionId);
  }

  /**
   * Retrieves the Checkout Session from Stripe and completes the order (same as webhook).
   * Use when STRIPE_WEBHOOK_SECRET is not set or Stripe cannot reach localhost.
   */
  @Post('stripe/sync-session')
  syncStripeSession(@Body() body: SyncStripeSessionDto) {
    return this.paymentService.syncCheckoutSessionFromStripe(body.sessionId);
  }

  /**
   * Cash on delivery: order must exist; persists a pending payment only (no Stripe).
   */
  @Post('create/:order_id')
  createPayment(
    @Param('order_id') order_id: string,
    @Body() body: CreateCodPaymentBodyDto,
  ) {
    return this.paymentService.createPaymentForOrder(
      order_id,
      body.method,
      body.amount,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Req() req: StripeWebhookRequest) {
    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      throw new BadRequestException('Raw body required for Stripe webhook');
    }
    return this.paymentService.handleStripeWebhook(
      rawBody,
      req.headers['stripe-signature'],
    );
  }

  @Post('update/:id')
  updatePayment(@Param('id') id: string, @Body() body: UpdatePaymentBodyDto) {
    return this.paymentService.updatePaymentStatus(
      id,
      body.status,
      body.transaction_id,
    );
  }
}
