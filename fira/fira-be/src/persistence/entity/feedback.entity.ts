import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { FeedbackScore } from '../../../../fira-commons';
import { User } from './user.entity';

export type TFeedback = {
  id: number;
  score: FeedbackScore;
  text: string | null;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
@Index(['user'])
export class Feedback implements TFeedback {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ enum: FeedbackScore })
  score: FeedbackScore;
  @Column({ type: 'text', nullable: true })
  text: string | null;
  @ManyToOne(() => User, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  user: User;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
