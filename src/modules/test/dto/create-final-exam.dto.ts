import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from 'src/entities/test.entity';

export class CreateQuestionForFinalExamDto {
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

export class CreateFinalExamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  topicIds?: number[]; // Topics to include in final exam

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
  requireAllTopicExamsCompleted?: boolean; // Default true for final exams

  // Auto-generate questions from all topics
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
  @Type(() => CreateQuestionForFinalExamDto)
  questions?: CreateQuestionForFinalExamDto[];
} 