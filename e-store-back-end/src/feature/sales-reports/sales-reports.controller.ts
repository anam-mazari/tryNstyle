import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { OrdersService } from 'src/core/services/order/order.service';
import { SalesDashboardPeriod } from 'src/core/services/order/sales-dashboard.types';

/**
 * Lives outside {@link OrdersController} so `GET …/sales-dashboard` is never
 * mistaken for `GET /orders/:id` (which breaks when `:id` is registered first
 * or when static routes are missing from an older build).
 */
@Controller('reports')
export class SalesReportsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('sales-dashboard')
  getSalesDashboard(
    @Query(
      'period',
      new DefaultValuePipe(SalesDashboardPeriod.LAST_WEEK),
      new ParseEnumPipe(SalesDashboardPeriod),
    )
    period: SalesDashboardPeriod,
  ) {
    return this.ordersService.getSalesDashboard(period);
  }
}
