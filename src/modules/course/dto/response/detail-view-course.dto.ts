import { Expose, Type } from 'class-transformer';

class _InstructorDto {
  @Expose()
  username: string;

  @Expose()
  avatarUrl: string;
}

class _CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

class _TopicDto {
  @Expose()
  id: number;
  
  @Expose()
  title: string;

  @Expose()
  description: string;
}

export class DetailViewCourseDto {
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
  createdAt: Date;

  @Expose()
  @Type(() => _InstructorDto)
  instructor: _InstructorDto;

  @Expose()
  @Type(() => _CategoryDto)
  categories: _CategoryDto[];

  @Expose()
  @Type(() => _TopicDto)
  topics: _TopicDto[];
}
