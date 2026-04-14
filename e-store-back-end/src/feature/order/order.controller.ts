import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrdersService } from 'src/core/services/order/order.service';
import { CreateOrderDto } from 'src/core/services/order/create-order.dto';
import { UpdateOrderStatusDto } from 'src/core/services/order/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) { // UUID string
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, body.status);
  }
}
