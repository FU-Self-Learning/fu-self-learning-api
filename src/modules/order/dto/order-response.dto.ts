export class OrderCourseDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;

  constructor(course: any) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.imageUrl = course.imageUrl;
    this.price = course.price;
  }
}

export class OrderDto {
  id: number;
  amount: number;
  status: string;
  payOsOrderId: string;
  createdAt: Date;
  updatedAt: Date;
  course: OrderCourseDto;

  constructor(order: any) {
    this.id = order.id;
    this.amount = order.amount;
    this.status = order.status;
    this.payOsOrderId = order.payOsOrderId;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.course = new OrderCourseDto(order.course);
  }
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
    response.order = new OrderDto(order);
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
    response.orders = orders.map(order => new OrderDto(order));
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
