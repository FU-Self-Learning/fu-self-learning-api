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
import { Flashcard } from './flashcard.entity';
import { Test } from './test.entity';
import { CourseCertificate } from './course-certificate.entity';
import { CourseStatus } from 'src/common/enums/course-status.enum';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.courses)
  instructor: User;

  @OneToMany(() => Topic, (topic) => topic.course)
  topics: Topic[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  videoIntroUrl: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.INACTIVE
  })
  status: CourseStatus;
  
  @OneToMany(() => CommentCourse, (commentCourse) => commentCourse.course)
  comments: CommentCourse[];

  @ManyToMany(() => Category, (category) => category.courses)
  @JoinTable()
  categories: Category[];

  @OneToMany(() => Flashcard, (flashcard) => flashcard.course)
  flashcards: Flashcard[];

  @OneToMany(() => Test, (test) => test.course)
  tests: Test[];

  @OneToMany(() => CourseCertificate, (certificate) => certificate.course)
  certificates: CourseCertificate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
