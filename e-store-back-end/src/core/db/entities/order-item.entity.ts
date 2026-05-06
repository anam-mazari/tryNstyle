// src/core/db/entities/order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { product } from './product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId', referencedColumnName: 'order_id' })
  order: Order;

  @ManyToOne(() => product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product: product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /**
   * Selected variant color label (matches `product.frameColor` for primary or an entry in `product.colorVariantImages`).
   * Null means the primary/default variant.
   */
  @Column({ name: 'variant_color', type: 'varchar', length: 255, nullable: true })
  variantColor: string | null;
}
