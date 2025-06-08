import { Expose } from 'class-transformer';

export class ViewLessonDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  videoUrl: string;

  @Expose()
  videoDuration: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 