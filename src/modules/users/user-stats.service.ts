import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsersByMonth(
    year: number,
  ): Promise<{ labels: string[]; data: number[] }> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'EXTRACT(MONTH FROM user.createdAt) AS month',
        'COUNT(user.id) AS count',
      ])
      .where('EXTRACT(YEAR FROM user.createdAt) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const labels = result.map((r) => `Tháng ${r.month}`);
    const data = result.map((r) => Number(r.count));
    return { labels, data };
  }
}
