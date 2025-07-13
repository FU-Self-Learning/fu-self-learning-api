import { Controller, Post, Body, Req, UseGuards, Param, Get, ParseIntPipe, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/:courseId')
  async createOrder(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = req.user as User;
    return this.orderService.createOrderWithPayment(user, courseId, createOrderDto.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Req() req: any) {
    const user = req.user as User;
    return this.orderService.getUserOrdersFormatted(user.id);
  }
}
