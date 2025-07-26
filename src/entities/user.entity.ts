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
import { CommentCourse } from './comment-course.entity';
import { AIContentRequest } from './ai-content-request.entity';
import { SocialInteraction } from './social-interaction.entity';
import { Follow } from './follow.entity';
import { StudySession } from './study-session.entity';
import { QuizResult } from './quiz-result.entity';
import { CommentPost } from './comment-post.entity';
import { StudySet } from './study-set.entity';
import { PostLike } from './post-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  dob: Date;

  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: Role, default: Role.Student })
  role: Role;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PostLike, (like) => like.user)
  postLikes: PostLike[];

  @OneToMany(
    () => AIContentRequest,
    (aiContentRequest) => aiContentRequest.user,
  )
  aiContentRequests: AIContentRequest[];

  @OneToMany(() => CommentCourse, (commentCourse) => commentCourse.user)
  commentsCourse: CommentCourse[];

  @OneToMany(() => CommentPost, (CommentPost) => CommentPost.user)
  commentsPost: CommentPost[];

  @OneToMany(() => Follow, (follow) => follow.followingUser)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followedUser)
  followers: Follow[];

  @OneToMany(
    () => SocialInteraction,
    (socialInteraction) => socialInteraction.senderUser,
  )
  sender: Follow[];

  @OneToMany(
    () => SocialInteraction,
    (socialInteraction) => socialInteraction.receiverUser,
  )
  receiver: Follow[];

  @OneToMany(() => SocialInteraction, (si) => si.senderUser)
  sentMessages: SocialInteraction[];

  @OneToMany(() => SocialInteraction, (si) => si.receiverUser)
  receivedMessages: SocialInteraction[];

  @OneToMany(() => StudySession, (session) => session.user)
  studySessions: StudySession[];

  @OneToMany(() => QuizResult, (result) => result.user)
  quizResults: QuizResult[];

  @OneToMany(() => StudySet, (studySet) => studySet.user)
  studySets: StudySet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
