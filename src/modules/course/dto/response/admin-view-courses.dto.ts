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
  updatedAt: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  @Type(() => _InstructorDto)
  instructor: _InstructorDto;

  @Expose()
  @Type(() => _CategoryDto)
  categories: _CategoryDto[];
}
