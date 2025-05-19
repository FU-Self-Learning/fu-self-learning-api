import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly userService: UsersService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  private async uploadImage(file?: Express.Multer.File): Promise<string> {
    if (!file?.path) return '';
    try {
      const result = await this.cloudinary.uploadImage(file.path);
      return result.secure_url;
    } catch (err) {
      throw new BadRequestException('Failed to upload image: ' + err.message);
    }
  }

  async create(
    dto: CreatePostDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Post> {
    const user = await this.userService.getProfile(userId);
    if (!user) throw new BadRequestException('User not found');

    const image = await this.uploadImage(file);

    const post = this.postRepo.create({
      ...dto,
      image,
      user,
    });

    return this.postRepo.save(post);
  }

  async update(
    id: number,
    dto: UpdatePostDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new BadRequestException('Post not found');
    if (post.user.id !== userId) {
      throw new BadRequestException('Unauthorized update attempt');
    }

    const image = file ? await this.uploadImage(file) : post.image;
    Object.assign(post, dto, { image });

    return this.postRepo.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepo.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new BadRequestException('Post not found');
    return post;
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new BadRequestException('Post not found');
    if (post.user.id !== userId) {
      throw new BadRequestException('Unauthorized delete attempt');
    }

    if (post.image) {
      const publicId = this.extractPublicIdFromUrl(post.image);
      await this.cloudinary.deleteImage(publicId);
    }

    await this.postRepo.remove(post);
  }

  private extractPublicIdFromUrl(url: string): string {
    const filename = url.split('/').pop();
    return filename?.split('.')[0] ?? '';
  }
}
