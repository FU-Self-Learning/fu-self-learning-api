import { Controller, Post, Body, Req, UseGuards, Param, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderStatus } from '../../entities/order.entity';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { PayOsService } from './payos.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly payOsService: PayOsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/:courseId')
  async createOrder(
    @Req() req: Request,
    @Param('courseId') courseId: number,
    @Body('amount') amount: number,
  ): Promise<{ order: Order; payUrl: string; payOsOrderId: string }> {
    // @ts-ignore
    const user = req.user as User;
    const course = { id: courseId } as Course;
    // Integrate with PayOs to get payOsOrderId and payUrl
    const { order, orderCode } = await this.orderService.createOrder(user, course, amount);
    const payOs = await this.payOsService.createPayment(amount, orderCode);
    // Lưu payOsOrderId vào DB
    await this.orderService.updatePayOsOrderId(order.id, payOs.payOsOrderId);
    order.payOsOrderId = payOs.payOsOrderId;
    return { order, payUrl: payOs.payUrl, payOsOrderId: payOs.payOsOrderId };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Req() req: Request): Promise<Order[]> {
    // @ts-ignore
    const user = req.user as User;
    return this.orderService.getUserOrders(user.id);
  }
}
