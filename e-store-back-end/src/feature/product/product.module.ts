import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductController } from './prodct.controller';
import { ProductService } from 'src/core/services/product/product.service';
import { product } from 'src/core/db/entities/product';
import { Category } from 'src/core/db/entities/category.entity';
import { Brand } from 'src/core/db/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([product, Category, Brand]),
    MulterModule.register({
      storage: memoryStorage(), // memory instead of disk
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
