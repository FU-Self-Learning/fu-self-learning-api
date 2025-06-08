import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../../entities/lesson.entity';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { TopicModule } from '../topic/topic.module';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson]), TopicModule],
  controllers: [LessonController],
  providers: [LessonService, CloudinaryService],
  exports: [LessonService],
})
export class LessonModule {} 