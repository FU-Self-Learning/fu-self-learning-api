import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';

export class CreateLessonsWithTopic {
  @IsNumber()
  @IsNotEmpty()
  topicId: number;

  @IsNotEmpty()
  data: CreateLessonDto;

  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @IsNumber()
  @IsNotEmpty()
  videoDuration: number;
}
