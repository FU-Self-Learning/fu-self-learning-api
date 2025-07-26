import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { Test } from 'src/entities/test.entity';
import { TestAttempt } from 'src/entities/test-attempt.entity';
import { TestAnswer } from 'src/entities/test-answer.entity';
import { Course } from 'src/entities/course.entity';
import { Topic } from 'src/entities/topic.entity';
import { QuizQuestion } from 'src/entities/quiz-question.entity';
import { QuizQuestionModule } from '../quiz-question/quiz-question.module';
import { AiAgentModule } from '../ai-agent/ai-agent.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      TestAttempt,
      TestAnswer,
      Course,
      Topic,
      QuizQuestion,
    ]),
    QuizQuestionModule,
    AiAgentModule,
  ],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {} 