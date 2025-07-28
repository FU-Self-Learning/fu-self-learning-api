import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { GeminiService } from './gemini.service';
import { PdfService } from '../pdf/pdf.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';
import { QuizQuestion } from 'src/entities/quiz-question.entity';
import { Category } from 'src/entities/category.entity';
import { CourseService } from '../course/course.service';
import { TopicService } from '../topic/topic.service';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Lesson } from 'src/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, QuizQuestion, Category, Course, User, Lesson])],
  controllers: [AiAgentController],
  providers: [
    {
      provide: AiAgentService,
      useFactory: (geminiService: GeminiService, topicRepository, courseService: CourseService, topicService: TopicService) => 
        new AiAgentService(geminiService, topicRepository, courseService, topicService),
      inject: [GeminiService, 'TopicRepository', CourseService, TopicService],
    },
    GeminiService,
    PdfService,
    CourseService,
    TopicService,
  ],
  exports: [AiAgentService, GeminiService],
})
export class AiAgentModule {}
