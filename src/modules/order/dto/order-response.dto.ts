import { Expose, Transform, Type, plainToClass } from 'class-transformer';

export class OrderCourseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  price: number;
}

export class OrderDto {
  @Expose()
  id: number;

  @Expose()
  amount: number;

  @Expose()
  status: string;

  @Expose()
  payOsOrderId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OrderCourseDto)
  course: OrderCourseDto;
}

export class CreateOrderResponseDto {
  success: boolean;
  order?: OrderDto;
  payUrl?: string;
  payOsOrderId?: string;
  message?: string;
  error?: string;

  static success(order: any, payUrl: string, payOsOrderId: string): CreateOrderResponseDto {
    const response = new CreateOrderResponseDto();
    response.success = true;
    response.order = plainToClass(OrderDto, order, { excludeExtraneousValues: true });
    response.payUrl = payUrl;
    response.payOsOrderId = payOsOrderId;
    return response;
  }

  static error(message: string, error?: string): CreateOrderResponseDto {
    const response = new CreateOrderResponseDto();
    response.success = false;
    response.message = message;
    response.error = error;
    return response;
  }
}

export class UserOrdersResponseDto {
  success: boolean;
  count?: number;
  orders?: OrderDto[];
  message?: string;
  error?: string;

  static success(orders: any[]): UserOrdersResponseDto {
    const response = new UserOrdersResponseDto();
    response.success = true;
    response.count = orders.length;
    response.orders = orders.map(order => 
      plainToClass(OrderDto, order, { excludeExtraneousValues: true })
    );
    return response;
  }

  static error(message: string, error?: string): UserOrdersResponseDto {
    const response = new UserOrdersResponseDto();
    response.success = false;
    response.message = message;
    response.error = error;
    return response;
  }
}

export class WebhookProcessResultDto {
  success: boolean;
  statusCode: number;
  message: string;
  error?: string;

  static success(statusCode: number, message: string): WebhookProcessResultDto {
    const result = new WebhookProcessResultDto();
    result.success = true;
    result.statusCode = statusCode;
    result.message = message;
    return result;
  }

  static error(statusCode: number, message: string, error?: string): WebhookProcessResultDto {
    const result = new WebhookProcessResultDto();
    result.success = false;
    result.statusCode = statusCode;
    result.message = message;
    result.error = error;
    return result;
  }
}
