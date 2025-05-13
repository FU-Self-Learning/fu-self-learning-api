import { Role } from 'src/common/enums/role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { AIContentRequest } from './ai-content-request.entity';
import { SocialInteraction } from './social-interaction.entity';
import { Follow } from './follow.entity';
import { StudySession } from './study-session.entity';
import { QuizResult } from './quiz-result.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ type: 'enum', enum: Role, default: Role.Student })
  role: Role;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(
    () => AIContentRequest,
    (aiContentRequest) => aiContentRequest.user,
  )
  aiContentRequests: AIContentRequest[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Follow, (follow) => follow.following_user)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followed_user)
  followers: Follow[];

  @OneToMany(
    () => SocialInteraction,
    (socialInteraction) => socialInteraction.sender_user,
  )
  sender: Follow[];

  @OneToMany(
    () => SocialInteraction,
    (socialInteraction) => socialInteraction.receiver_user,
  )
  receiver: Follow[];

  @OneToMany(() => StudySession, (session) => session.user)
  studySessions: StudySession[];

  @OneToMany(() => QuizResult, (result) => result.user)
  quizResults: QuizResult[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
