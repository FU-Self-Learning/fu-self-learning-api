export class RevenueStatDto {
  month: string;
  revenue: number;

  constructor(month: string, revenue: number) {
    this.month = month;
    this.revenue = revenue;
  }
}

export class UserRegistrationStatDto {
  month: string;
  count: number;

  constructor(month: string, count: number) {
    this.month = month;
    this.count = count;
  }
}
