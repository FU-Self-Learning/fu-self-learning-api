import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateCommentPostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  postId: number;
}
