import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentBodyDto {
  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';

  @IsOptional()
  @IsString()
  transaction_id?: string;
}
