import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cart-Item' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: false })
  userId!: string;

  @Column({ type: 'varchar' })
  price!: number;

  @Column({ type: 'int', default: 1 })
  stockQuantity!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frameStyle!: string | null;
  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand!: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;
}
