import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Topic } from './topic.entity';
import { CommentCourse } from './comment-course.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.courses)
  instructor: User;

  @OneToMany(() => Topic, (topic) => topic.course)
  topics: Topic[];

  @Column({ nullable: true })
  document_url: string;

  @OneToMany(() => CommentCourse, (CommentCourse) => CommentCourse.course)
  comments: Comment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
