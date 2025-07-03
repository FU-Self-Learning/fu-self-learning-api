import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { Course } from '../../entities/course.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderWebhookController } from './order-webhook.controller';
import { PayOsService } from './payos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Course])],
  controllers: [OrderController, OrderWebhookController],
  providers: [OrderService, PayOsService],
  exports: [OrderService],
})
export class OrderModule {}
