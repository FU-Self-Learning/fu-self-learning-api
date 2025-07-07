import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashcard } from '../../entities/flashcard.entity';
import { Category } from '../../entities/category.entity';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { TopicModule } from '../topic/topic.module';
import { LessonModule } from '../lesson/lesson.module';
import { CourseModule } from '../course/course.module';
import { GeminiService } from '../ai-agent/gemini.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Flashcard, Category]),
    TopicModule,
    LessonModule,
    CourseModule,
  ],
  controllers: [FlashcardsController],
  providers: [FlashcardsService, GeminiService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
