import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  enrollAt?: Date;
}
