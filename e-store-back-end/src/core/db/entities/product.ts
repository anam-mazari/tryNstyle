import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';

@Entity({ name: 'product' })
export class product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 1 })
  stockQuantity!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frameStyle!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frameColor!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shape!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  material!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  frameWidth!: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brandId' })
  brand!: Brand | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  colorVariantImages!:
    | { color: string; imageUrl: string; stockQuantity?: number }[]
    | null;

  @Column({ type: 'text', nullable: true })
  glbUrl!: string | null;

  /**
   * Cloudinary URL of the lens PNG overlay image.
   * Used in contact lens try-on instead of solid color gradient.
   * PNG should be 512x512, transparent background, circular lens texture.
   * When set, the try-on renders this PNG scaled to the iris size on both eyes.
   * When null, falls back to solid color gradient using frameColor hex.
   */
  @Column({ type: 'text', nullable: true })
  lensImageUrl!: string | null;
}
