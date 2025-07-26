import { IsNumber, IsArray, IsString, IsOptional } from 'class-validator';

export class SubmitAnswerDto {
  @IsNumber()
  attemptId: number;

  @IsNumber()
  questionId: number;

  @IsArray()
  @IsString({ each: true })
  selectedAnswers: string[];

  @IsOptional()
  @IsNumber()
  timeSpent?: number; // giây
} 