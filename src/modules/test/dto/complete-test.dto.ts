import { IsNumber } from 'class-validator';

export class CompleteTestDto {
  @IsNumber()
  attemptId: number;
}
