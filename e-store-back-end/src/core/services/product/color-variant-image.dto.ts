import { IsNotEmpty, IsString } from 'class-validator';

export class ColorVariantImageDto {
  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
