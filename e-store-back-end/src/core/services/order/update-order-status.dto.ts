import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/** Allowed lifecycle + payment state for admin updates */
export const ORDER_STATUS_VALUES = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ORDER_STATUS_VALUES)
  status: string;
}
