import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from '../../entities/topic.entity';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { CourseModule } from '../course/course.module';
import { Lesson } from 'src/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Lesson]), CourseModule],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
