import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
