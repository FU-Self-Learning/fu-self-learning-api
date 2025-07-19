import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class GeneratedLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class GeneratedTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratedLessonDto)
  lessons: GeneratedLessonDto[];
}

export class GeneratedCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneratedTopicDto)
  topics: GeneratedTopicDto[];
}

export class GenerateCourseFromPdfResponseDto {
  course: GeneratedCourseDto;
  topics: GeneratedTopicDto[];
}
