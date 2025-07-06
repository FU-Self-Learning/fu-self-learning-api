import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../../entities/course.entity';
import { Topic } from '../../entities/topic.entity';
import { Lesson } from '../../entities/lesson.entity';
import { User } from '../../entities/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseGenerationService } from './course-generation.service';
import { Category } from 'src/entities/category.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PdfService } from '../pdf/pdf.service';
import { GeminiService } from '../ai-agent/gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Topic, Lesson, User, Category])],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseGenerationService,
    CloudinaryService,
    PdfService,
    GeminiService,
  ],
  exports: [CourseService],
})
export class CourseModule {}
