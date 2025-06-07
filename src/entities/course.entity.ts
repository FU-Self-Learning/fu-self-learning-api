import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Topic } from './topic.entity';
import { CommentCourse } from './comment-course.entity';
import { Category } from './category.entity';

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
  documentUrl: string;

  @OneToMany(() => CommentCourse, (commentCourse) => commentCourse.course)
  comments: CommentCourse[];

  @ManyToMany(() => Category, (category) => category.courses)
  @JoinTable()
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
