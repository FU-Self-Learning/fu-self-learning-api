import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from '../pdf/pdf.service';
import { Topic } from 'src/entities/topic.entity';
import { ErrorMessage } from 'src/common/constants/error-message.constant';
import { Course } from 'src/entities/course.entity';
import { JwtAuthGuard } from 'src/config/jwt/jwt-auth.guard';

@Controller('ai')
export class AiAgentController {
  constructor(
    private readonly aiAgentService: AiAgentService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('generate-topics')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async generateTopics(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<{ topics: Topic[]; summary: Partial<Course> }> {
    try {
      const text = await this.pdfService.extractTextFromBuffer(file.buffer);
      return this.aiAgentService.generateTopicsAndSummary(text, req.user.id);
    } catch (error) {
      throw new BadRequestException({
        message: ErrorMessage.VALIDATE_FAILED,
        description: 'File is missing or invalid',
      });
    }
  }

  @Post('generate-questions')
  @UseGuards(JwtAuthGuard)
  async generateQuestions(@Body() body: { topicId: number; topicTitle: string; count: number }) {
    // Gọi GeminiService để generate câu hỏi
    const { topicId, topicTitle, count } = body;
    // Lấy GeminiService từ module (hoặc inject nếu cần)
    const geminiService = (this.aiAgentService as any).geminiService || (global as any).geminiService;
    if (!geminiService) throw new Error('GeminiService not available');
    const questions = await geminiService.generateQuestions(topicTitle, topicId, count);
    return questions;
  }

  @Post('generate-questions-by-topic')
  @UseGuards(JwtAuthGuard)
  async generateQuestionsByTopic(@Body() body: { topicId: number; count: number }) {
    const { topicId, count } = body;
    // Lấy title topic từ DB
    const topic = await this.aiAgentService['topicRepository'].findOne({ where: { id: topicId } });
    if (!topic) throw new Error('Topic not found');
    const questions = await this.aiAgentService.geminiService.generateQuestions(topic.title, topicId, count);
    return questions;
  }

  @Post('preview-course/:courseId')
  @UseGuards(JwtAuthGuard)
  async previewCourseWithAI(@Param('courseId') courseId: string) {
    return this.aiAgentService.previewCourseWithAI(parseInt(courseId));
  }
}
