// Entity types matching back-end structure

import { FrameWidth } from '@/types/frame-width';

/** Nested shape returned by the product API for brand relation */
export interface ProductBrandRef {
  id: string;
  name: string;
}

/** Nested shape returned by the product API for category relation */
export interface ProductCategoryRef {
  id: string;
  name: string;
}

/** Extra color + image pairs (primary color uses `frameColor` + `imageUrl`). */
export interface ProductColorVariantImage {
  color: string;
  imageUrl: string;
  stockQuantity?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  price: number;
  stockQuantity: number;
  frameStyle: string | null;
  frameColor: string | null;
  shape: string | null;
  description: string | null;
  material: string | null;
  frameWidth: FrameWidth | null;
  category: ProductCategoryRef | string | null;
  brand: ProductBrandRef | string | null;
  imageUrl: string | null;
  colorVariantImages?: ProductColorVariantImage[] | null;
  glbUrl?: string | null;
  lensImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: string;
  user: User;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  order_status: string;
  items: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  order: Order;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

