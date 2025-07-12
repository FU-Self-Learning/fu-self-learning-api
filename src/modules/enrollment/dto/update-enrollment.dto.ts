import { IsNumber, IsOptional, Min, Max, IsString, IsUrl } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  completedAt?: Date;

  @IsOptional()
  @IsUrl()
  @IsString()
  certificateUrl?: string;
}
