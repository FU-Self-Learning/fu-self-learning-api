import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findUserByName(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(infoRegister: RegisterDto): Promise<User> {
    const user = this.usersRepository.create(infoRegister);
    return await this.usersRepository.save(user);
  }

  //   async update(id: number, username: string, password: string): Promise<User> {
  //     const user = await this.findOne(id);
  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     user.username = username;
  //     user.password = password;

  //     return this.usersRepository.save(user);
  //   }

  // Xóa người dùng
  async remove(id: number): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.usersRepository.remove(user);
  }
  // lấy profile info của người dùng
  async getProfile(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
