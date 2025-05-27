import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Follow } from "src/entities/follow.entity";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";

@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
        private usersService: UsersService,
    ) {}

    async create(followingId: number, followedId: number): Promise<Follow> {
        const followingUser = await this.usersService.findUserById(followingId);
        const followedUser = await this.usersService.findUserById(followedId);

        if (!followingUser || !followedUser) {
            throw new Error("User not found");
        }
        const follow = this.followRepository.create({
            followed_user: followedUser,
            following_user: followingUser,
        });

        return this.followRepository.save(follow);
    }

    async getFollowers(userId: number): Promise<Follow[]> {
        const user = await this.usersService.getProfile(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.followRepository.find({
            where: { followed_user: { id: userId } },
            relations: ["following_user"],
        });
    }

    async getFollowing(userId: number): Promise<Follow[]> {
        const user = await this.usersService.getProfile(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.followRepository.find({
            where: { following_user: { id: userId } },
            relations: ["followed_user"],
        });
    }

    async unfollow(followingId: number, followedId: number): Promise<void> {
        const follow = await this.followRepository.findOne({
            where: {
                following_user: { id: followingId },
                followed_user: { id: followedId },
            },
        });

        if (!follow) {
            throw new Error("Follow relationship not found");
        }

        await this.followRepository.remove(follow);
    }
}