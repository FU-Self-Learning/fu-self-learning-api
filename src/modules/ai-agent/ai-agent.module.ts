import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { GeminiService } from './gemini.service';
import { PdfService } from '../pdf/pdf.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';
import { QuizQuestion } from 'src/entities/quiz-question.entity';
import { Category } from 'src/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, QuizQuestion, Category])],
  controllers: [AiAgentController],
  providers: [
    {
      provide: AiAgentService,
      useFactory: (geminiService: GeminiService, topicRepository) => new AiAgentService(geminiService, topicRepository),
      inject: [GeminiService, 'TopicRepository'],
    },
    GeminiService,
    PdfService,
  ],
  exports: [AiAgentService, GeminiService],
})
export class AiAgentModule {}
