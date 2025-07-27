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
import { Lesson } from './lesson.entity';

@Entity('video_progress')
@Unique(['user', 'lesson'])
export class VideoProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.videoProgress)
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.videoProgress)
  lesson: Lesson;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  watchedDuration: number; // Thời gian đã xem (giây)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDuration: number; // Tổng thời gian video (giây)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number; // Phần trăm đã xem (%)

  @Column({ default: false })
  isCompleted: boolean; // Đã xem hết video chưa

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date; // Thời điểm hoàn thành

  @Column({ type: 'timestamp', nullable: true })
  lastWatchedAt: Date; // Thời điểm xem cuối cùng

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 