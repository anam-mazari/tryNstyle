import type { Product } from '@/types/entities';
import { FrameWidth } from '@/types/frame-width';

export const mockProducts: Product[] = [
  {
    id: '1',
    price: 99.99,
    stockQuantity: 10,
    frameStyle: 'Classic',
    frameColor: 'Black',
    shape: 'Round',
    description: 'Lightweight acetate frame with classic styling.',
    material: 'Acetate',
    frameWidth: FrameWidth.MEDIUM,
    category: 'Eyewear',
    brand: 'Ray-Ban',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    price: 149.99,
    stockQuantity: 5,
    frameStyle: 'Modern',
    frameColor: 'Tortoise',
    shape: 'Wrap',
    description: 'Sport-inspired wrap frame with polarized lenses.',
    material: 'TR90',
    frameWidth: FrameWidth.WIDE,
    category: 'Eyewear',
    brand: 'Oakley',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];




