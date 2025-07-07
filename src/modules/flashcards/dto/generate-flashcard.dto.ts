import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';

export enum GenerationSource {
  LESSON = 'lesson',
  TOPIC = 'topic',
  COURSE = 'course',
}

export class GenerateFlashcardDto {
  @IsEnum(GenerationSource)
  source: GenerationSource;

  @IsInt()
  sourceId: number; // lessonId, topicId, hoặc courseId

  @IsString()
  @IsOptional()
  prompt?: string; // Optional custom prompt for AI
} 