import { IsString, IsInt, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsInt()
  courseId: number;

  @IsArray()
  @ArrayNotEmpty()
  memberIds: number[];
}
