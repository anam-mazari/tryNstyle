import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum PendingCheckoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('pending_checkouts')
export class PendingCheckout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  checkout_payload: {
    username: string;
    email: string;
    phone: string;
    address: string;
    address_line2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    shipping_address?: string;
    payment_method: string;
    items: { product_id: string; quantity: number }[];
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: string;

  @Column({ type: 'varchar', nullable: true })
  stripe_session_id: string | null;

  @Column({ type: 'varchar', default: PendingCheckoutStatus.PENDING })
  status: PendingCheckoutStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
