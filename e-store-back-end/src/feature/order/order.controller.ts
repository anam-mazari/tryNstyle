import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from 'src/core/services/order/order.service';
import { CreateOrderDto } from 'src/core/services/order/create-order.dto';
import { UpdateOrderStatusDto } from 'src/core/services/order/update-order-status.dto';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Headers('x-customer-user-id') customerUserIdHeader: string | undefined,
  ) {
    const customerUserId = customerUserIdHeader?.trim();
    if (customerUserId && !isUuid(customerUserId)) {
      throw new BadRequestException('Invalid customer id');
    }
    return this.orderService.create(dto, customerUserId);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('my')
  findMyOrders(
    @Headers('x-customer-user-id') customerUserIdHeader: string | undefined,
  ) {
    const userId = customerUserIdHeader?.trim();
    if (!userId) {
      throw new UnauthorizedException('Missing X-Customer-User-Id header');
    }
    if (!isUuid(userId)) {
      throw new BadRequestException('Invalid customer id');
    }
    return this.orderService.findOrdersForCustomer(userId);
  }

  @Get('guest')
  findGuestOrders(@Query('email') email: string | undefined) {
    const normalized = (email ?? '').trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Missing email');
    }
    return this.orderService.findOrdersForGuestEmail(normalized);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // UUID string
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, body.status);
  }
}
