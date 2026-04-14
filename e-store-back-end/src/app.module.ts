import { Module } from '@nestjs/common';
import { ITypeOrmModule } from './core/config/pg.conf';
import { UserModule } from './feature/user/user.module';
import { AppController } from './app.controller';
import { ProductModule } from './feature/product/product.module';
import { AdminModule } from './feature/admin/admin.module';
import { OrdersModule } from './feature/order/order.module';
import { PaymentModule } from './feature/payment/payment.module';
import { CategoryModule } from './feature/category/category.module';
import { BrandModule } from './feature/brand/brand.module';

@Module({
  imports: [
    ITypeOrmModule,
    UserModule,
    ProductModule,
    AdminModule,
    OrdersModule,
    PaymentModule,
    CategoryModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
