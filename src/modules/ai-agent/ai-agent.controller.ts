import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
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
}
