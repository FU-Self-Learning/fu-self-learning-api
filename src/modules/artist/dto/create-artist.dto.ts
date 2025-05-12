import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsUrl, IsArray } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  biography?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  genres?: string[];
} 