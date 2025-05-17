import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
