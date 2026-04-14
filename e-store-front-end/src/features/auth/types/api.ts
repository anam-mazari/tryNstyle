// API request/response DTOs and types

import { FrameWidth } from '@/types/frame-width';
import type { Order, ProductColorVariantImage } from './entities';

// User DTOs
export interface CreateUserDto {
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateUserDto {
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

// Product DTOs
export interface CreateProductDto {
  price: number;
  stockQuantity?: number;
  frameStyle?: string;
  frameColor?: string;
  shape?: string;
  description?: string;
  material?: string;
  frameWidth?: FrameWidth;
  category?: string;
  brand?: string;
  imageUrl?: string;
  colorVariantImages?: ProductColorVariantImage[];
  glbUrl?: string;
  lensImageUrl?: string;
}

export interface UpdateProductDto {
  price?: number;
  stockQuantity?: number;
  frameStyle?: string;
  frameColor?: string;
  shape?: string;
  description?: string;
  material?: string;
  frameWidth?: FrameWidth;
  category?: string;
  brand?: string;
  imageUrl?: string;
  colorVariantImages?: ProductColorVariantImage[];
  glbUrl?: string;
  lensImageUrl?: string;
}

// Order DTOs
export interface OrderItemDto {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDto {
  username: string;
  email: string;
  phone: string;
  address: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  payment_method: string;
  shipping_address?: string;
  items: OrderItemDto[];
}

export interface UpdateOrderStatusDto {
  status: string;
}

// Payment DTOs
export interface CreatePaymentDto {
  method: string;
  amount: number;
}

export interface StripeCheckoutSessionResponse {
  url: string;
}

export interface StripeSessionOrderResponse {
  status: 'complete' | 'processing' | 'unpaid' | 'failed';
  order?: Order;
}

export interface UpdatePaymentDto {
  status: 'success' | 'failed';
  transaction_id?: string;
}

// Admin DTOs
export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
}

// API Response types
export type ApiResponse<T> = T;
export type ApiError = {
  message: string;
  statusCode: number;
  error?: string;
};

