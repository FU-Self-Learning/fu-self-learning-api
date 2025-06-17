import { IsInt, IsOptional, IsString } from 'class-validator';
export class UpdateCommentPostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  postId?: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
