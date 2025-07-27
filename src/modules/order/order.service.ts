import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { PayOsService } from './payos.service';
import { CreateOrderResponseDto, UserOrdersResponseDto, WebhookProcessResultDto, OrderDto } from './dto/order-response.dto';

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
    private readonly payOsService: PayOsService,
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

  async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.amount)', 'total')
      .where('order.status = :status', { status: OrderStatus.PAID })
      .getRawOne();
      
    return Number(result?.total || 0);
  }

  async calculateMonthlyRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.amount)', 'total')
      .where('order.status = :status', { status: OrderStatus.PAID })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return Number(result?.total || 0);
  }

  async createOrderWithPayment(user: User, courseId: number, amount: number): Promise<CreateOrderResponseDto> {
    try {
      const { order, orderCode } = await this.createOrder(user, courseId, amount);
      const payOs = await this.payOsService.createPayment(amount, orderCode, courseId);
      await this.updatePayOsOrderId(order.id, payOs.payOsOrderId);
      order.payOsOrderId = payOs.payOsOrderId;
      this.logger.log(`Payment created for user ${user.id}, order ${order.id}`);
      const response = new CreateOrderResponseDto();
      response.success = true;
      response.order = plainToClass(OrderDto, order, { excludeExtraneousValues: true });
      response.payUrl = payOs.payUrl;
      response.payOsOrderId = payOs.payOsOrderId;
      
      return response;
    } catch (error) {
      this.logger.error(`Failed to create order for user ${user.id}: ${error.message}`);
      
      const response = new CreateOrderResponseDto();
      response.success = false;
      response.message = error.message;
      response.error = error.name;
      
      return response;
    }
  }

  async getUserOrdersFormatted(userId: number): Promise<UserOrdersResponseDto> {
    try {
      const orders = await this.getUserOrders(userId);
      const transformedOrders = orders.map(order => 
        plainToClass(OrderDto, order, { excludeExtraneousValues: true })
      );
      
      const response = new UserOrdersResponseDto();
      response.success = true;
      response.orders = transformedOrders;
      response.count = transformedOrders.length;
      
      return response;
    } catch (error) {
      this.logger.error(`Failed to get user orders for user ${userId}: ${error.message}`);
      
      const response = new UserOrdersResponseDto();
      response.success = false;
      response.message = 'Failed to retrieve orders';
      response.error = error.message;
      
      return response;
    }
  }

  async processWebhook(body: any, payos: any): Promise<WebhookProcessResultDto> {
    try {
      this.logger.log('Processing webhook with body:', JSON.stringify(body));
      
      const webhookDataVerified = payos.verifyPaymentWebhookData(body);
      this.logger.log('Verified webhook data:', JSON.stringify(webhookDataVerified));

      if (!webhookDataVerified) {
        const response = new WebhookProcessResultDto();
        response.success = false;
        response.statusCode = 403;
        response.message = 'Invalid signature - webhook data verification failed';
        return response;
      }

      const orderCode = webhookDataVerified.orderCode?.toString();
      const code = webhookDataVerified.code;
      
      if (!orderCode) {
        const response = new WebhookProcessResultDto();
        response.success = false;
        response.statusCode = 400;
        response.message = 'Missing orderCode in webhook data';
        return response;
      }

      this.logger.log('Webhook received orderCode:', orderCode);

      const orderInDb = await this.getOrderByPayOsOrderId(orderCode);
      this.logger.log('Order in DB:', orderInDb ? JSON.stringify(orderInDb) : 'Not found');

      if (!orderInDb) {
        const response = new WebhookProcessResultDto();
        response.success = false;
        response.statusCode = 404;
        response.message = `Order not found for orderCode: ${orderCode}`;
        return response;
      }

      if (code === '00') {
        await this.updateOrderStatusByPayOsOrderId(orderCode, OrderStatus.PAID);
        const response = new WebhookProcessResultDto();
        response.success = true;
        response.statusCode = 200;
        response.message = `Order ${orderCode} marked as PAID successfully`;
        return response;
      } else {
        await this.updateOrderStatusByPayOsOrderId(orderCode, OrderStatus.FAILED);
        const response = new WebhookProcessResultDto();
        response.success = true;
        response.statusCode = 200;
        response.message = `Order ${orderCode} marked as FAILED`;
        return response;
      }
    } catch (error) {
      this.logger.error('Error in processWebhook:', error.message);
      const response = new WebhookProcessResultDto();
      response.success = false;
      response.statusCode = 500;
      response.message = 'Internal server error during webhook processing';
      response.error = error.message;
      return response;
    }
  }
}
