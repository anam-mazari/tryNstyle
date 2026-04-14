// src/core/db/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @Column({ type: 'varchar', unique: true })
  tracking_number: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column()
  payment_method: string;

  @Column()
  shipping_address: string;

  @Column({ type: 'varchar', nullable: true })
  shipping_address_line2: string | null;

  @Column({ type: 'varchar', nullable: true })
  shipping_city: string | null;

  @Column({ type: 'varchar', nullable: true })
  shipping_province: string | null;

  @Column({ type: 'varchar', nullable: true })
  shipping_postal_code: string | null;

  @Column({ type: 'varchar', nullable: true })
  shipping_country: string | null;

  @Column({ default: 'pending' })
  order_status: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
