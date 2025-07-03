import { Expose } from 'class-transformer';

export class InstructorViewCourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  videoIntroUrl: string;

  @Expose()
  documentUrl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
