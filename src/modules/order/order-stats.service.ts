import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';

@Injectable()
export class OrderStatsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getRevenueByMonth(
    year: number,
  ): Promise<{ labels: string[]; data: number[] }> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'EXTRACT(MONTH FROM order.createdAt) AS month',
        'SUM(order.amount) AS revenue',
      ])
      .where('EXTRACT(YEAR FROM order.createdAt) = :year', { year })
      .andWhere('order.status = :status', { status: 'paid' })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const labels = result.map((r) => `Tháng ${r.month}`);
    const data = result.map((r) => Number(r.revenue));
    return { labels, data };
  }
}
