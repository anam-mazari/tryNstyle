import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from 'src/core/services/payment/payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from 'src/core/db/entities/payment.entity';
import { Order } from 'src/core/db/entities/order.entity';
import { PendingCheckout } from 'src/core/db/entities/pending-checkout.entity';
import { OrdersModule } from 'src/feature/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, PendingCheckout]),
    OrdersModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
