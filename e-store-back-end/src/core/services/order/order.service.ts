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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(product) private productRepo: Repository<product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

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
      const productEntity = await this.productRepo.findOneBy({ id: i.product_id });
      if (!productEntity) {
        throw new NotFoundException(`Product not found: ${i.product_id}`);
      }
      if (productEntity.stockQuantity < i.quantity) {
        throw new BadRequestException(
          `Insufficient stock for this product. Available: ${productEntity.stockQuantity}, requested: ${i.quantity}.`,
        );
      }
      total_amount += Number(productEntity.price) * i.quantity;
    }
    return total_amount;
  }

  async create(dto: CreateOrderDto) {
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
        if (productEntity.stockQuantity < line.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${productEntity.stockQuantity}, requested: ${line.quantity}.`,
          );
        }

        productEntity.stockQuantity -= line.quantity;
        await productRepository.save(productEntity);

        const unitPrice = Number(productEntity.price);
        total_amount += unitPrice * line.quantity;

        lineItems.push(
          orderItemRepository.create({
            product: productEntity,
            quantity: line.quantity,
            price: unitPrice,
          }),
        );
      }

      const phoneRaw = (dto.phone ?? '').trim();
      let phoneStored: string | null = null;
      if (phoneRaw.length > 0) {
        phoneStored = phoneRaw.length > 30 ? phoneRaw.slice(0, 30) : phoneRaw;
      }

      const user = await userRepository.save({
        username: dto.username,
        email: dto.email,
        phone: phoneStored,
        address: (dto.address ?? '').trim() || null,
      });

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
    return this.orderRepo.find({ relations: ['items', 'items.product', 'user'] });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { order_id: id },
      relations: ['items', 'items.product', 'user'],
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
