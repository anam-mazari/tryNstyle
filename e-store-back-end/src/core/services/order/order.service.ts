// src/core/services/order/order.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/core/db/entities/order.entity';
import { OrderItem } from 'src/core/db/entities/order-item.entity';
import { product } from 'src/core/db/entities/product';
import { User } from 'src/core/db/entities/user.entity';
import { CreateOrderDto } from './create-order.dto';
import { generateTrackingNumber } from 'src/core/utils/tracking-number.util';
import {
  SalesDashboardPeriod,
  type SalesDashboardResponse,
  type SalesDashboardSeriesPoint,
} from './sales-dashboard.types';

const ORDER_DETAIL_RELATIONS = [
  'items',
  'items.product',
  'items.product.category',
  'items.product.brand',
  'user',
] as const;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(product) private productRepo: Repository<product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  private normalizeEmail(value: string): string {
    return (value ?? '').trim().toLowerCase();
  }

  private buildShippingSummary(dto: CreateOrderDto): string {
    const line2 = dto.address_line2?.trim();
    const street = (dto.address ?? '').trim();
    const city = (dto.city ?? '').trim();
    const province = (dto.province ?? '').trim();
    const postal = (dto.postal_code ?? '').trim();
    const country = (dto.country ?? '').trim();
    const parts = [
      street,
      line2 ? line2 : null,
      [city, province, postal].filter(Boolean).join(', '),
      country,
    ].filter(Boolean);
    if (dto.shipping_address?.trim()) {
      return dto.shipping_address.trim();
    }
    return parts.length > 0 ? parts.join(', ') : '—';
  }

  async validateItemsAndComputeTotal(dto: CreateOrderDto): Promise<number> {
    let total_amount = 0;
    for (const i of dto.items) {
      const productEntity = await this.productRepo.findOneBy({
        id: i.product_id,
      });
      if (!productEntity) {
        throw new NotFoundException(`Product not found: ${i.product_id}`);
      }
      const variantColor = (i.variant_color ?? '').trim();
      const isPrimary = variantColor.length === 0;
      if (isPrimary) {
        if (productEntity.stockQuantity < i.quantity) {
          throw new BadRequestException(
            `Insufficient stock for this product. Available: ${productEntity.stockQuantity}, requested: ${i.quantity}.`,
          );
        }
      } else {
        const variants = Array.isArray(productEntity.colorVariantImages)
          ? productEntity.colorVariantImages
          : [];
        const match = variants.find(
          (v) => (v.color ?? '').trim().toLowerCase() === variantColor.toLowerCase(),
        );
        if (!match) {
          throw new BadRequestException(
            `Unknown color variant "${variantColor}" for product ${i.product_id}.`,
          );
        }
        const available = Math.max(0, Number(match.stockQuantity ?? 0));
        if (available < i.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variantColor}. Available: ${available}, requested: ${i.quantity}.`,
          );
        }
      }
      total_amount += Number(productEntity.price) * i.quantity;
    }
    return total_amount;
  }

  async create(dto: CreateOrderDto, customerUserId?: string): Promise<Order> {
    const shippingSummary = this.buildShippingSummary(dto);

    return this.orderRepo.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(product);
      const userRepository = manager.getRepository(User);
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);

      let total_amount = 0;
      const lineItems: OrderItem[] = [];

      for (const line of dto.items) {
        const productEntity = await productRepository.findOne({
          where: { id: line.product_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!productEntity) {
          throw new NotFoundException(`Product not found: ${line.product_id}`);
        }
        const variantColor = (line.variant_color ?? '').trim();
        const isPrimary = variantColor.length === 0;
        if (isPrimary) {
          if (productEntity.stockQuantity < line.quantity) {
            throw new BadRequestException(
              `Insufficient stock. Available: ${productEntity.stockQuantity}, requested: ${line.quantity}.`,
            );
          }
          productEntity.stockQuantity -= line.quantity;
        } else {
          const variants = Array.isArray(productEntity.colorVariantImages)
            ? productEntity.colorVariantImages
            : [];
          const variantIndex = variants.findIndex(
            (v) => (v.color ?? '').trim().toLowerCase() === variantColor.toLowerCase(),
          );
          if (variantIndex < 0) {
            throw new BadRequestException(
              `Unknown color variant "${variantColor}" for product ${line.product_id}.`,
            );
          }
          const current = Math.max(0, Number(variants[variantIndex]?.stockQuantity ?? 0));
          if (current < line.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${variantColor}. Available: ${current}, requested: ${line.quantity}.`,
            );
          }
          variants[variantIndex] = {
            ...variants[variantIndex],
            stockQuantity: current - line.quantity,
          };
          productEntity.colorVariantImages = variants;
        }

        await productRepository.save(productEntity);

        const unitPrice = Number(productEntity.price);
        total_amount += unitPrice * line.quantity;

        lineItems.push(
          orderItemRepository.create({
            product: productEntity,
            quantity: line.quantity,
            price: unitPrice,
            variantColor: variantColor.length > 0 ? variantColor : null,
          }),
        );
      }

      const phoneRaw = (dto.phone ?? '').trim();
      let phoneStored: string | null = null;
      if (phoneRaw.length > 0) {
        phoneStored = phoneRaw.length > 30 ? phoneRaw.slice(0, 30) : phoneRaw;
      }

      const checkoutEmail = this.normalizeEmail(dto.email);
      let user: User;

      if (customerUserId) {
        const existingUser = await userRepository.findOneBy({
          id: customerUserId,
        });
        if (!existingUser) {
          throw new BadRequestException('Customer not found');
        }
        const existingEmail = this.normalizeEmail(existingUser.email);
        if (existingEmail && checkoutEmail && existingEmail !== checkoutEmail) {
          throw new BadRequestException(
            'Checkout email does not match signed-in account',
          );
        }
        user = await userRepository.save({
          ...existingUser,
          username: dto.username?.trim() || existingUser.username,
          phone: phoneStored,
          address: (dto.address ?? '').trim() || null,
        });
      } else {
        user = await userRepository.save({
          username: dto.username,
          email: dto.email,
          phone: phoneStored,
          address: (dto.address ?? '').trim() || null,
        });
      }

      let trackingNumber = generateTrackingNumber();
      for (let attempt = 0; attempt < 12; attempt++) {
        const exists = await orderRepository.exists({
          where: { tracking_number: trackingNumber },
        });
        if (!exists) {
          break;
        }
        trackingNumber = generateTrackingNumber();
      }

      const order = orderRepository.create({
        tracking_number: trackingNumber,
        user,
        payment_method: dto.payment_method,
        shipping_address: shippingSummary,
        shipping_address_line2: dto.address_line2?.trim() ?? null,
        shipping_city: (dto.city ?? '').trim() || null,
        shipping_province: (dto.province ?? '').trim() || null,
        shipping_postal_code: (dto.postal_code ?? '').trim() || null,
        shipping_country: (dto.country ?? '').trim() || null,
        total_amount,
        items: lineItems,
      });

      return orderRepository.save(order);
    });
  }

  async findAll() {
    return this.orderRepo.find({
      relations: [...ORDER_DETAIL_RELATIONS],
    });
  }

  async findOrdersForCustomer(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: [...ORDER_DETAIL_RELATIONS],
      order: { created_at: 'DESC' },
    });
  }

  async findOrdersForGuestEmail(email: string): Promise<Order[]> {
    const normalized = this.normalizeEmail(email);
    if (!normalized) {
      throw new BadRequestException('Invalid email');
    }

    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('order.user', 'user')
      .where('LOWER(user.email) = :email', { email: normalized })
      .orderBy('order.created_at', 'DESC')
      .getMany();
  }

  /**
   * Customer order history: return all orders placed with the same email as the signed-in account.
   * This includes legacy "guest checkout" orders which created a separate user row with the same email.
   */
  async findOrdersForCustomerAccount(customerUserId: string): Promise<Order[]> {
    const customer = await this.userRepo.findOneBy({ id: customerUserId });
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    const email = this.normalizeEmail(customer.email);
    if (!email) {
      // Fallback: return id-based orders if email is missing for any reason.
      return this.findOrdersForCustomer(customerUserId);
    }

    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('order.user', 'user')
      .where('LOWER(user.email) = :email', { email })
      .orderBy('order.created_at', 'DESC')
      .getMany();
  }

  async getSalesDashboard(
    periodInput: string,
  ): Promise<SalesDashboardResponse> {
    const period = this.parseSalesDashboardPeriod(periodInput);
    const { startUtc, endUtc } = this.getSalesDashboardWindowUtc(period);

    const summaryRow = await this.orderRepo.query<
      Array<{
        total_revenue: string;
        orders_placed: string;
        pending_count: string;
        cancelled_count: string;
      }>
    >(
      `
      SELECT
        COALESCE(SUM(o.total_amount), 0)::text AS total_revenue,
        COUNT(*)::text AS orders_placed,
        COALESCE(SUM(CASE WHEN LOWER(TRIM(o.order_status)) = $3 THEN 1 ELSE 0 END), 0)::text AS pending_count,
        COALESCE(SUM(CASE WHEN LOWER(TRIM(o.order_status)) IN ($4, $5) THEN 1 ELSE 0 END), 0)::text AS cancelled_count
      FROM orders o
      WHERE o.created_at >= $1 AND o.created_at <= $2
      `,
      [startUtc, endUtc, 'pending', 'cancelled', 'canceled'],
    );

    const summary = summaryRow[0];
    const series = await this.buildSalesDashboardSeries(
      period,
      startUtc,
      endUtc,
    );

    return {
      period,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      summary: {
        totalRevenue: Number(summary?.total_revenue ?? 0),
        ordersPlaced: Number(summary?.orders_placed ?? 0),
        pendingCount: Number(summary?.pending_count ?? 0),
        cancelledCount: Number(summary?.cancelled_count ?? 0),
      },
      series,
    };
  }

  private parseSalesDashboardPeriod(
    periodInput: string,
  ): SalesDashboardPeriod {
    const normalized = (periodInput ?? '').trim().toLowerCase();
    if (normalized === SalesDashboardPeriod.TODAY) {
      return SalesDashboardPeriod.TODAY;
    }
    if (normalized === SalesDashboardPeriod.LAST_MONTH) {
      return SalesDashboardPeriod.LAST_MONTH;
    }
    return SalesDashboardPeriod.LAST_WEEK;
  }

  private getSalesDashboardWindowUtc(period: SalesDashboardPeriod): {
    startUtc: Date;
    endUtc: Date;
  } {
    const now = new Date();
    const endOfUtcDay = (offsetFromToday: number): Date =>
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + offsetFromToday,
          23,
          59,
          59,
          999,
        ),
      );

    const dayStart = (offsetFromToday: number): Date =>
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + offsetFromToday,
          0,
          0,
          0,
          0,
        ),
      );

    if (period === SalesDashboardPeriod.TODAY) {
      return { startUtc: dayStart(0), endUtc: endOfUtcDay(0) };
    }
    if (period === SalesDashboardPeriod.LAST_MONTH) {
      // Last 30 full days including today (UTC-aligned).
      return { startUtc: dayStart(-29), endUtc: endOfUtcDay(0) };
    }
    // Last week = previous 7 full days (excluding today), to match typical admin expectations.
    return { startUtc: dayStart(-7), endUtc: endOfUtcDay(-1) };
  }

  private async buildSalesDashboardSeries(
    period: SalesDashboardPeriod,
    startUtc: Date,
    endUtc: Date,
  ): Promise<SalesDashboardSeriesPoint[]> {
    if (period === SalesDashboardPeriod.TODAY) {
      return this.buildTodayHourlySeries(startUtc, endUtc);
    }
    return this.buildDailySeries(startUtc, endUtc);
  }

  private async buildTodayHourlySeries(
    startUtc: Date,
    endUtc: Date,
  ): Promise<SalesDashboardSeriesPoint[]> {
    const rows = await this.orderRepo.query<
      Array<{ hour: string; revenue: string; order_count: string }>
    >(
      `
      SELECT
        EXTRACT(HOUR FROM (o.created_at AT TIME ZONE 'UTC'))::int::text AS hour,
        COALESCE(SUM(o.total_amount), 0)::float::text AS revenue,
        COUNT(*)::int::text AS order_count
      FROM orders o
      WHERE o.created_at >= $1 AND o.created_at <= $2
      GROUP BY EXTRACT(HOUR FROM (o.created_at AT TIME ZONE 'UTC'))
      ORDER BY EXTRACT(HOUR FROM (o.created_at AT TIME ZONE 'UTC')) ASC
      `,
      [startUtc, endUtc],
    );

    const byHour = new Map<number, { revenue: number; orderCount: number }>();
    for (const row of rows) {
      const hourNum = Number(row.hour);
      byHour.set(hourNum, {
        revenue: Number(row.revenue),
        orderCount: Number(row.order_count),
      });
    }

    const series: SalesDashboardSeriesPoint[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const found = byHour.get(hour);
      series.push({
        label: `${hour.toString().padStart(2, '0')}:00`,
        revenue: found?.revenue ?? 0,
        orderCount: found?.orderCount ?? 0,
      });
    }
    return series;
  }

  private async buildDailySeries(
    startUtc: Date,
    endUtc: Date,
  ): Promise<SalesDashboardSeriesPoint[]> {
    const rows = await this.orderRepo.query<
      Array<{ day: string; revenue: string; order_count: string }>
    >(
      `
      SELECT
        to_char(date_trunc('day', o.created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
        COALESCE(SUM(o.total_amount), 0)::float::text AS revenue,
        COUNT(*)::int::text AS order_count
      FROM orders o
      WHERE o.created_at >= $1 AND o.created_at <= $2
      GROUP BY date_trunc('day', o.created_at AT TIME ZONE 'UTC')
      ORDER BY date_trunc('day', o.created_at AT TIME ZONE 'UTC') ASC
      `,
      [startUtc, endUtc],
    );

    const byDate = new Map<string, { revenue: number; orderCount: number }>();
    for (const row of rows) {
      const dayKey = this.normalizeSqlDayKey(row.day);
      if (dayKey.length === 0) {
        continue;
      }
      byDate.set(dayKey, {
        revenue: Number(row.revenue),
        orderCount: Number(row.order_count),
      });
    }

    const series: SalesDashboardSeriesPoint[] = [];
    const cursor = new Date(startUtc);
    cursor.setUTCHours(0, 0, 0, 0);
    const endDay = new Date(endUtc);
    endDay.setUTCHours(0, 0, 0, 0);

    while (cursor.getTime() <= endDay.getTime()) {
      const key = cursor.toISOString().slice(0, 10);
      const found = byDate.get(key);
      series.push({
        label: key,
        revenue: found?.revenue ?? 0,
        orderCount: found?.orderCount ?? 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return series;
  }

  /** Normalize `to_char` / driver output so Map keys match `toISOString().slice(0, 10)`. */
  private normalizeSqlDayKey(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value.trim().slice(0, 10);
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).trim().slice(0, 10);
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { order_id: id },
      relations: [...ORDER_DETAIL_RELATIONS],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderRepo.findOneBy({ order_id: id });
    if (!order) throw new NotFoundException('Order not found');

    order.order_status = status;
    return this.orderRepo.save(order);
  }
}
