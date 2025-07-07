import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsNumber, IsEnum } from 'class-validator';

export enum StudySetType {
  COURSE = 'course',
  MULTI_COURSE = 'multi-course',
  RANDOM = 'random',
  CUSTOM = 'custom',
}

export class CreateStudySetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsEnum(StudySetType)
  type: StudySetType;

  // For type = course
  @IsNumber()
  @IsOptional()
  courseId?: number;

  // For type = multi-course
  @IsArray()
  @IsOptional()
  courseIds?: number[];

  // For type = random, multi-course
  @IsNumber()
  @IsOptional()
  limit?: number;

  // For type = custom
  @IsArray()
  @IsOptional()
  flashcardIds?: number[];
} 