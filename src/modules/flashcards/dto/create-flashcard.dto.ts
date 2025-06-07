import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateFlashcardDto {
  @IsInt()
  topicId: number;

  @IsString()
  @IsNotEmpty()
  front_text: string;

  @IsString()
  @IsNotEmpty()
  back_text: string;
}
