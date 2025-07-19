import { IsNumber } from 'class-validator';

export class StartTestDto {
  @IsNumber()
  testId: number;
}
