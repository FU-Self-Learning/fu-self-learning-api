import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from 'src/entities/test.entity';

export class CreateQuestionForTopicExamDto {
  @IsString()
  question_text: string;

  @IsArray()
  @IsString({ each: true })
  correct_answer: string[];

  @IsArray()
  @IsString({ each: true })
  choices: string[];

  @IsNumber()
  topicId: number;
}

export class CreateTopicExamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  courseId: number;

  @IsNumber()
  topicId: number; // Specific topic for this exam

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  duration?: number; // minutes

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number; // %

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  shuffleAnswers?: boolean;

  @IsOptional()
  @IsBoolean()
  requireVideoCompletion?: boolean; // Default true for topic exams

  // Auto-generate questions
  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  autoGenerateCount?: number;

  // Manual questions
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionForTopicExamDto)
  questions?: CreateQuestionForTopicExamDto[];
} 