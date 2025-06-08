import { Expose, Type } from 'class-transformer';

class _LessonDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  videoDuration: number;

  @Expose()
  videoUrl: string;
}

export class ViewAllTopicDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  totalDuration: number;

  @Expose()
  @Type(() => _LessonDto)
  lessons: _LessonDto[];
}