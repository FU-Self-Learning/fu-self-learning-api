import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

        if (dto.parentId) {
            const parentComment = await this.commentRepo.findOne({
                where: { id: dto.parentId },
                relations: ['post'],
            });

            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }

            if (parentComment.post.id !== dto.postId) {
                throw new NotFoundException('Parent comment does not belong to the same post');
            }

            comment.parent = parentComment;
        }

        return this.commentRepo.save(comment);
    }

    findAll(): Promise<CommentPost[]> {
        return this.commentRepo.find({
            relations: ['user', 'post', 'replies', 'replies.user'],
            where: { parent: IsNull() },
            order: { created_at: 'DESC' },
        });
    }

    findPostComments(postId: number): Promise<CommentPost[]> {
        return this.commentRepo.find({
            where: { post: { id: postId }, parent: IsNull() },
            relations: ['user', 'replies', 'replies.user'],
            order: { created_at: 'DESC' },
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

        if (comment.user.id !== Number(userId)) {
            throw new NotFoundException('You are not the owner of this comment');
        }

        Object.assign(comment, dto);
        return this.commentRepo.save(comment);
    }

    async remove(id: number, userId: number): Promise<void> {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ['user', 'replies'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user.id !== Number(userId)) {
            throw new NotFoundException('You are not the owner of this comment');
        }

        if (comment.replies && comment.replies.length > 0) {
            comment.content = '[Deleted]';
            await this.commentRepo.save(comment);
        } else {
            await this.commentRepo.delete(id);
        }
    }
}