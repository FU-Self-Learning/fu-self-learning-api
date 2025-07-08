import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, User, Course])],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
