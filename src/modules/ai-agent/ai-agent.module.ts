import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { PdfService } from '../pdf/pdf.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';
import { QuizQuestion } from 'src/entities/quiz-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, QuizQuestion])],
  controllers: [AiAgentController],
  providers: [AiAgentService,PdfService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
