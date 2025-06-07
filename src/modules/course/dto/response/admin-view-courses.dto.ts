import { Expose, Type } from 'class-transformer';

class _InstructorDto {
  @Expose()
  username: string;
}

class _CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

class _TopicDto {
  @Expose()
  title: string;
}

export class AdminViewCourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => _InstructorDto)
  instructor: _InstructorDto;

  @Expose()
  @Type(() => _CategoryDto)
  categories: _CategoryDto[];
}
