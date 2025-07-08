import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { Logger } from '@nestjs/common';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async createOrder(user: User, courseId: number, amount: number): Promise<{ order: Order, orderCode: number }> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingOrder = await this.orderRepository.findOne({
      where: { 
        user: { id: user.id }, 
        course: { id: courseId },
        status: OrderStatus.PAID 
      }
    });

    if (existingOrder) {
      throw new ConflictException('User has already purchased this course');
    }

    const coursePrice = Number(course.price);
    if (amount !== coursePrice) {
      throw new BadRequestException(`Amount ${amount} does not match course price ${coursePrice}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.orderRepository.create({
        user,
        course,
        amount,
        status: OrderStatus.PENDING,
      });
      
      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      
      this.logger.log(`Order created successfully: ${savedOrder.id}`);
      return { order: savedOrder, orderCode: savedOrder.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { user: { id: userId } }, 
      relations: ['course', 'user'],
      order: { createdAt: 'DESC' } 
    });
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id: orderId },
      relations: ['course', 'user']
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updatePayOsOrderId(orderId: number, payOsOrderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    order.payOsOrderId = payOsOrderId;
    const updatedOrder = await this.orderRepository.save(order);
    
    this.logger.log(`PayOS Order ID updated for order ${orderId}: ${payOsOrderId}`);
    return updatedOrder;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);
    
    this.logger.log(`Order ${orderId} status updated to: ${status}`);
    return updatedOrder;
  }

  async updateOrderStatusByPayOsOrderId(payOsOrderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { payOsOrderId },
      relations: ['user', 'course']
    });
    if (!order) throw new NotFoundException('Order not found by payOsOrderId');
    
    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);
    
    if (status === OrderStatus.PAID) {
      try {
        if (order.user && order.course) {
          await this.enrollmentService.enrollUser(order.user, order.course);
          this.logger.log(`User ${order.user.id} auto-enrolled in course ${order.course.id} after payment`);
        } else {
          this.logger.warn(`Missing user or course data for order ${order.id}. User: ${!!order.user}, Course: ${!!order.course}`);
        }
      } catch (error) {
        this.logger.error(`Failed to auto-enroll user ${order.user?.id} in course ${order.course?.id}: ${error.message}`);
      }
    }
    
    this.logger.log(`Order with PayOS ID ${payOsOrderId} status updated to: ${status}`);
    return updatedOrder;
  }

  async getOrderByPayOsOrderId(payOsOrderId: string): Promise<Order | null> {
    return this.orderRepository.findOne({ 
      where: { payOsOrderId },
      relations: ['course', 'user']
    });
  }
}
