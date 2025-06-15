import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreatePostDto, userId: number, files?: Express.Multer.File[]) {
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => 
        this.cloudinaryService.uploadImage(file.path)
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.secure_url);
    }

    const newPost = this.postRepo.create({
      ...dto,
      images: imageUrls,
      user: { id: userId },
    });

    return this.postRepo.save(newPost);
  }

  async findAll() {
    return this.postRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId: number | string, files?: Express.Multer.File[]) {
    const post = await this.findOne(id);

    const postUserId = Number(post.user.id);
    const requestUserId = Number(userId);

    if (postUserId !== requestUserId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    let imageUrls: string[] = post.images || [];
    
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => 
        this.cloudinaryService.uploadImage(file.path)
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newImageUrls = uploadResults.map(result => result.secure_url);
      
      if (dto.images) {
        imageUrls = [...dto.images, ...newImageUrls];
      } else {
        imageUrls = [...imageUrls, ...newImageUrls];
      }
    } else if (dto.images) {
      imageUrls = dto.images;
    }

    Object.assign(post, {
      ...dto,
      images: imageUrls,
    });

    return this.postRepo.save(post);
  }

  async remove(id: number, userId: number | string) {
    const post = await this.findOne(id);
    const postUserId = Number(post.user.id);
    const requestUserId = Number(userId);

    if (postUserId !== requestUserId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    if (post.images && post.images.length > 0) {
      const deletePromises = post.images.map(imageUrl => {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          return this.cloudinaryService.deleteImage(publicId);
        }
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await this.postRepo.remove(post);
    return { message: 'Post deleted successfully' };
  }
}
