import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('course_certificates')
@Unique(['user', 'course'])
export class CourseCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.courseCertificates)
  user: User;

  @ManyToOne(() => Course, (course) => course.certificates)
  course: Course;

  @Column()
  certificateNumber: string; // Số chứng chỉ

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  finalScore: number; // Điểm cuối khóa

  @Column({ type: 'timestamp' })
  issuedAt: Date; // Ngày cấp chứng chỉ

  @Column({ type: 'text', nullable: true })
  certificateUrl: string; // URL chứng chỉ PDF

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 