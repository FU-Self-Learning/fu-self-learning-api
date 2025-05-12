import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.following)
  @JoinColumn({ name: 'following_user_id' }) // trỏ đến user đang follow người khác
  following_user: User;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followed_user_id' }) // trỏ đến user được follow
  followed_user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
