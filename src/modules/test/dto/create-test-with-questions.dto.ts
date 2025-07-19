import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestType } from 'src/entities/test.entity';

export class CreateQuestionForTestDto {
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

export class CreateTestWithQuestionsDto {
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
  topicIds?: number[];

  @IsOptional()
  @IsEnum(TestType)
  type?: TestType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  duration?: number; // phút

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

  // Tự động tạo câu hỏi
  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  autoGenerateCount?: number;

  @IsOptional()
  @IsString()
  autoGeneratePrompt?: string;

  // Tạo câu hỏi thủ công
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionForTestDto)
  questions?: CreateQuestionForTestDto[];
}
