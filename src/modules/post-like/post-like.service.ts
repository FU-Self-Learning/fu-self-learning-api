import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from '../../entities/post-like.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class PostLikeService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async likePost(postId: number, user: User): Promise<PostLike> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const existed = await this.postLikeRepository.findOne({ where: { post: { id: postId }, user: { id: user.id } } });
    if (existed) return existed;
    const like = this.postLikeRepository.create({ post, user });
    return this.postLikeRepository.save(like);
  }

  async unlikePost(postId: number, user: User): Promise<void> {
    const like = await this.postLikeRepository.findOne({ where: { post: { id: postId }, user: { id: user.id } } });
    if (like) await this.postLikeRepository.remove(like);
  }

  async countLikes(postId: number): Promise<number> {
    return this.postLikeRepository.count({ where: { post: { id: postId } } });
  }

  async isLiked(postId: number, user: User): Promise<boolean> {
    const like = await this.postLikeRepository.findOne({ where: { post: { id: postId }, user: { id: user.id } } });
    return !!like;
  }
}
