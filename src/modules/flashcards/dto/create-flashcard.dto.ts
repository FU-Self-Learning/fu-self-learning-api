import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateFlashcardDto {
  @IsInt()
  @IsOptional()
  topicId?: number;

  @IsInt()
  @IsOptional()
  lessonId?: number;

  @IsString()
  @IsNotEmpty()
  front_text: string;

  @IsString()
  @IsNotEmpty()
  back_text: string;

  @IsBoolean()
  @IsOptional()
  is_auto_generated?: boolean;

  @IsString()
  @IsOptional()
  generation_source?: string;
}
