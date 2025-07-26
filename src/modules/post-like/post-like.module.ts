import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from '../../entities/post-like.entity';
import { Post } from '../../entities/post.entity';
import { PostLikeService } from './post-like.service';
import { PostLikeController } from './post-like.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike, Post])],
  providers: [PostLikeService],
  controllers: [PostLikeController],
  exports: [PostLikeService],
})
export class PostLikeModule {}
