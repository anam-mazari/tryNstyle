import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { FrameWidth } from 'src/core/enums/frame-width.enum';
import { ColorVariantImageDto } from 'src/core/services/product/color-variant-image.dto';

export class CreateProductDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  frameStyle?: string;

  @IsOptional()
  @IsString()
  frameColor?: string;

  @IsOptional()
  @IsString()
  shape?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsEnum(FrameWidth)
  frameWidth?: FrameWidth;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorVariantImageDto)
  colorVariantImages?: ColorVariantImageDto[];

  @IsOptional()
  @IsString()
  glbUrl?: string;

  /** Cloudinary URL of lens PNG overlay for contact lens try-on */
  @IsOptional()
  @IsString()
  lensImageUrl?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  frameStyle?: string;

  @IsOptional()
  @IsString()
  frameColor?: string;

  @IsOptional()
  @IsString()
  shape?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsEnum(FrameWidth)
  frameWidth?: FrameWidth;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorVariantImageDto)
  colorVariantImages?: ColorVariantImageDto[];

  @IsOptional()
  @IsString()
  glbUrl?: string;

  /** Cloudinary URL of lens PNG overlay for contact lens try-on */
  @IsOptional()
  @IsString()
  lensImageUrl?: string;
}
