import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { TestType } from 'src/entities/test.entity';

export class CreateTestDto {
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
  @IsArray()
  @IsNumber({}, { each: true })
  questionIds?: number[];

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
  @Min(1)
  @Max(100)
  questionCount?: number;

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
}
