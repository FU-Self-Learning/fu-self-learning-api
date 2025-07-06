import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}

export class CreateOrderParamsDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  courseId: number;
}
