import { IsNumber, IsOptional } from 'class-validator';

export class GenerateTopicsDto {
  @IsNumber()
  @IsOptional()
  num_questions?: number = 5; // Default number of questions per topic
}
