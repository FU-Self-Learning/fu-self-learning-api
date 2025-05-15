import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentPost } from '../../entities/comment-post.entity';
import { CreateCommentPostDto } from './dto/create-comment-post.dto';
import { UpdateCommentPostDto } from './dto/update-comment-post.dto';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { log } from 'node:console';

@Injectable()
export class CommentPostService {
    constructor(
        @InjectRepository(CommentPost)
        private readonly commentRepo: Repository<CommentPost>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Post)
        private readonly postRepo: Repository<Post>,
    ) { }

    async create(dto: CreateCommentPostDto, userId: number): Promise<CommentPost> {
        const user = await this.userRepo.findOneBy({ id: userId });
        const post = await this.postRepo.findOneBy({ id: dto.postId });

        if (!user || !post) {
            throw new NotFoundException('User or Post not found');
        }

        const comment = this.commentRepo.create({
            content: dto.content,
            user,
            post,
        });

        return this.commentRepo.save(comment);
    }

    findAll(): Promise<CommentPost[]> {
        return this.commentRepo.find({ relations: ['user', 'post'] });
    }

    findPostComments(postId: number): Promise<CommentPost[]> {
        return this.commentRepo.find({
            where: { post: { id: postId } },
            relations: ['user'],
            order: { created_at: 'ASC' },
        });
    }

    async update(
        id: number,
        dto: UpdateCommentPostDto,
        userId: number
    ): Promise<CommentPost> {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        log('User ID:', comment?.user.id);

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user.id !== userId) {
            throw new NotFoundException('You are not the owner of this comment');
        }

        Object.assign(comment, dto);
        return this.commentRepo.save(comment);
    }

    async remove(id: number, userId: number): Promise<void> {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user.id !== userId) {
            throw new NotFoundException('You are not the owner of this comment');
        }

        await this.commentRepo.delete(id);
    }
}