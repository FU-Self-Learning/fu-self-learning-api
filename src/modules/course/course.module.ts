import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../../entities/course.entity';
import { Topic } from '../../entities/topic.entity';
import { User } from '../../entities/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Category } from 'src/entities/category.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Topic, User, Category])],
  controllers: [CourseController],
  providers: [CourseService, CloudinaryService],
  exports: [CourseService],
})
export class CourseModule {} 