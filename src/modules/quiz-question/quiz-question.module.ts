import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from '../../entities/quiz-question.entity';
import { Topic } from '../../entities/topic.entity';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizQuestionService } from './quiz-question.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, Topic])],
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
  exports: [QuizQuestionService],
})
export class QuizQuestionModule {}
