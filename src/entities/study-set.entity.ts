import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Flashcard } from './flashcard.entity';

@Entity('study_sets')
export class StudySet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ default: false })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.studySets)
  user: User;

  @OneToMany(() => Flashcard, (flashcard) => flashcard.studySet, { cascade: true })
  flashcards: Flashcard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 