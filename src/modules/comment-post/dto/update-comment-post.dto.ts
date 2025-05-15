import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentPostDto } from './create-comment-post.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentPostDto extends PartialType(CreateCommentPostDto) {
  @IsOptional()
  @IsString()
  content?: string;
}