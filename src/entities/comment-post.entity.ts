import { Post } from './post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('comments_post')
export class CommentPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.commentsPost)
  user: User;

  @ManyToOne(() => Post, (post) => post.id, { onDelete: 'CASCADE' })
  post: Post;


  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
