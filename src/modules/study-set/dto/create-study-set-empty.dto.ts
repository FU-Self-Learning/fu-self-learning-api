import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequirePasswordIfNotPublic } from 'src/shared/validation/match-password';

export class CreateStudySetEmptyDto {
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
}

export class FlashcardManualDto {
  @IsString()
  @IsNotEmpty()
  front_text: string;

  @IsString()
  @IsNotEmpty()
  back_text: string;

  @IsOptional()
  @IsString()
  generation_source?: string;
}

export class AddFlashcardsManualDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlashcardManualDto)
  @IsNotEmpty()
  flashcards: FlashcardManualDto[];
}
