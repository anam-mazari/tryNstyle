import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCodPaymentBodyDto {
  @IsString()
  method: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;
}
