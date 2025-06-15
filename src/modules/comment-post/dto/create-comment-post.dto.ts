import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCommentPostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  postId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
