import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course]),
    UsersModule,
    CourseModule,
    EnrollmentModule,
  ],
  providers: [],
  controllers: [AdminController],
  exports: [],
})
export class AdminModule {}
