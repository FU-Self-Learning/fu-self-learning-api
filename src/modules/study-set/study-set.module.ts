import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySet } from '../../entities/study-set.entity';
import { User } from '../../entities/user.entity';
import { Flashcard } from '../../entities/flashcard.entity';
import { Course } from '../../entities/course.entity';
import { StudySetService } from './study-set.service';
import { StudySetController } from './study-set.controller';
import { FlashcardsModule } from '../flashcards/flashcards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudySet, User, Flashcard, Course]),
    FlashcardsModule,
  ],
  controllers: [StudySetController],
  providers: [StudySetService],
  exports: [StudySetService],
})
export class StudySetModule {} 