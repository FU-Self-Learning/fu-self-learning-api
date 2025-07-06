import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';

export class CreateLessonsWithTopic {
  @IsNumber()
  @IsNotEmpty()
  topicId: number;

  @IsNotEmpty()
  data: CreateLessonDto;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  videoDuration?: number;
}
