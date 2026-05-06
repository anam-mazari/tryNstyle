import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/core/db/entities/order.entity';
import { CartItem } from 'src/core/db/entities/cart';
import { OrderItem } from 'src/core/db/entities/order-item.entity';
import { OrdersService } from 'src/core/services/order/order.service';
import { OrdersController } from './order.controller';
import { product } from 'src/core/db/entities/product';
import { User } from 'src/core/db/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, CartItem, product, User, OrderItem]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
