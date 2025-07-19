import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { CourseModule } from '../course/course.module';
import { OrderStatsService } from '../order/order-stats.service';
import { UserStatsService } from '../users/user-stats.service';
import { Order } from 'src/entities/order.entity';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course, Order]),
    UsersModule,
    CourseModule,
  ],
  providers: [OrderStatsService, UserStatsService, AdminService],
  controllers: [AdminController],
  exports: [],
})
export class AdminModule {}
