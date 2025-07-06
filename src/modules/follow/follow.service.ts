import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'src/entities/follow.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    private usersService: UsersService,
  ) {}

  async toggleFollow(
    followingId: number,
    followedId: number,
  ): Promise<{ action: 'follow' | 'unfollow'; follow?: Follow }> {
    const followingUser = await this.usersService.findUserById(followingId);
    const followedUser = await this.usersService.findUserById(followedId);

    if (!followingUser || !followedUser) {
      throw new Error('User not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: {
        followingUser: { id: followingId },
        followedUser: { id: followedId },
      },
    });

    if (existingFollow) {
      await this.followRepository.remove(existingFollow);
      return { action: 'unfollow' };
    } else {
      const follow = this.followRepository.create({
        followedUser: followedUser,
        followingUser: followingUser,
      });
      const savedFollow = await this.followRepository.save(follow);
      return { action: 'follow', follow: savedFollow };
    }
  }

  async getFollowers(userId: number): Promise<Follow[]> {
    const user = await this.usersService.getProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.followRepository.find({
      where: { followedUser: { id: userId } },
      relations: ['followingUser'],
    });
  }

  async getFollowing(userId: number): Promise<Follow[]> {
    const user = await this.usersService.getProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.followRepository.find({
      where: { followingUser: { id: userId } },
      relations: ['followedUser'],
    });
  }
}
