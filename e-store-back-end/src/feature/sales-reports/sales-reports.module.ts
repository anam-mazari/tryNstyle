import { Module } from '@nestjs/common';
import { OrdersModule } from '../order/order.module';
import { SalesReportsController } from './sales-reports.controller';

@Module({
  imports: [OrdersModule],
  controllers: [SalesReportsController],
})
export class SalesReportsModule {}
