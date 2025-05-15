// src/modules/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UsersModule, 
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}