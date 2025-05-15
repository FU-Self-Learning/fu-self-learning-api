import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private usersService: UsersService, 
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const user = await this.usersService.getProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const post = this.postRepository.create({
      ...createPostDto,
      user,
    });

    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }

  async findOne(id: number): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id }
    });
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.user.id !== userId) {
      throw new Error('You are not authorized to update this post');
    }
    const updatedPost = this.postRepository.create({
      ...post,
      ...updatePostDto,
    });
    return this.postRepository.save(updatedPost);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.user.id !== userId) {
      throw new Error('You are not authorized to delete this post');
    }
    await this.postRepository.delete(id);
  }
}