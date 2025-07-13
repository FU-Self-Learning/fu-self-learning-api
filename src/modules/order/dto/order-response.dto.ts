import { Expose, Type, Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';

export class OrderCourseDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  imageUrl: string;

  @Expose()
  @IsNumber()
  price: number;
}

export class OrderDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsString()
  payOsOrderId: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => OrderCourseDto)
  @ValidateNested()
  course: OrderCourseDto;
}

export class CreateOrderResponseDto {
  @Expose()
  @IsBoolean()
  success: boolean;

  @Expose()
  @IsOptional()
  @Type(() => OrderDto)
  @ValidateNested()
  order?: OrderDto;

  @Expose()
  @IsOptional()
  @IsString()
  payUrl?: string;

  @Expose()
  @IsOptional()
  @IsString()
  payOsOrderId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  message?: string;

  @Expose()
  @IsOptional()
  @IsString()
  error?: string;
}

export class UserOrdersResponseDto {
  @Expose()
  @IsBoolean()
  success: boolean;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Transform(({ obj }) => obj.orders?.length || 0)
  count?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders?: OrderDto[];

  @Expose()
  @IsOptional()
  @IsString()
  message?: string;

  @Expose()
  @IsOptional()
  @IsString()
  error?: string;
}

export class WebhookProcessResultDto {
  @Expose()
  @IsBoolean()
  success: boolean;

  @Expose()
  @IsNumber()
  statusCode: number;

  @Expose()
  @IsString()
  message: string;

  @Expose()
  @IsOptional()
  @IsString()
  error?: string;
}
