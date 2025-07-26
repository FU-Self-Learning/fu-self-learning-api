import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PostLikeService } from './post-like.service';
import { JwtAuthGuard } from '../../config/jwt/jwt-auth.guard';

@Controller('posts/:postId/like')
@UseGuards(JwtAuthGuard)
export class PostLikeController {
  constructor(private readonly postLikeService: PostLikeService) {}

  @Post()
  async like(@Param('postId') postId: number, @Req() req) {
    await this.postLikeService.likePost(postId, req.user);
    return { message: 'Liked' };
  }

  @Delete()
  async unlike(@Param('postId') postId: number, @Req() req) {
    await this.postLikeService.unlikePost(postId, req.user);
    return { message: 'Unliked' };
  }

  @Get()
  async getLikeStatus(@Param('postId') postId: number, @Req() req) {
    const count = await this.postLikeService.countLikes(postId);
    const liked = await this.postLikeService.isLiked(postId, req.user);
    return { count, liked };
  }
}
