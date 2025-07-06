import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentPost } from '../../entities/comment-post.entity';
import { CommentPostService } from './comment-post.service';
import { CommentPostController } from './comment-post.controller';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentPost, User, Post])],
  providers: [CommentPostService],
  controllers: [CommentPostController],
})
export class CommentPostModule {}
