import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(user: User, course: Course, amount: number): Promise<{ order: Order, orderCode: number }> {
    // 1. Tạo order PENDING (chưa có payOsOrderId) để lấy id
    const order = this.orderRepository.create({
      user,
      course,
      amount,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepository.save(order);
    const orderCode = savedOrder.id;
    console.log('Created order with orderCode:', orderCode);
    return { order: savedOrder, orderCode };
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async updateOrderStatusByPayOsOrderId(payOsOrderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { payOsOrderId } });
    if (!order) throw new NotFoundException('Order not found by payOsOrderId');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async getOrderByPayOsOrderId(payOsOrderId: string): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { payOsOrderId } });
  }

  async updatePayOsOrderId(orderId: number, payOsOrderId: string): Promise<Order> {
    

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.payOsOrderId = payOsOrderId;
    return this.orderRepository.save(order);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
