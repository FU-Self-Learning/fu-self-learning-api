import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  Validate,
  ArrayMinSize,
} from 'class-validator';
import { FlashcardManualDto } from './create-study-set-empty.dto';
import { RequirePasswordIfNotPublic } from 'src/shared/validation/match-password';

export class CreateStudySetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  isPublic: boolean;

  @Validate(RequirePasswordIfNotPublic)
  password: string;

  @IsArray()
  @ArrayMinSize(3)
  flashcards: FlashcardManualDto[];
}
