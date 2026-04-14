import { IsNotEmpty, IsString } from 'class-validator';

export class SyncStripeSessionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
