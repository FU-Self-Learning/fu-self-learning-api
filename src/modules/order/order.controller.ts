import { Controller, Post, Body, Req, UseGuards, Param, Get, ParseIntPipe, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../../entities/order.entity';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { PayOsService } from './payos.service';
import { CreateOrderDto, CreateOrderParamsDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly payOsService: PayOsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/:courseId')
  async createOrder(
    @Req() req: any,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ order: Order; payUrl: string; payOsOrderId: string }> {
    const user = req.user as User;
    
    try {
      const { order, orderCode } = await this.orderService.createOrder(user, courseId, createOrderDto.amount);
      const payOs = await this.payOsService.createPayment(createOrderDto.amount, orderCode);
      await this.orderService.updatePayOsOrderId(order.id, payOs.payOsOrderId);
      
      order.payOsOrderId = payOs.payOsOrderId;
      
      this.logger.log(`Payment created for user ${user.id}, order ${order.id}`);
      return { order, payUrl: payOs.payUrl, payOsOrderId: payOs.payOsOrderId };
    } catch (error) {
      this.logger.error(`Failed to create order for user ${user.id}: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Req() req: any): Promise<Order[]> {
    const user = req.user as User;
    return this.orderService.getUserOrders(user.id);
  }
}
