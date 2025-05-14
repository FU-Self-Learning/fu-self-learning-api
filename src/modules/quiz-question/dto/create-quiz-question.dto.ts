import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateQuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  correct_answer: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  choices: string[];

  @IsNumber()
  @IsNotEmpty()
  topicId: number;
} 