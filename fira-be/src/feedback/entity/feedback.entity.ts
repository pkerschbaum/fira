import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { FeedbackScore } from '../feedback.types';
import { User } from '../../identity-management/entity/user.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ enum: FeedbackScore, nullable: false })
  score: FeedbackScore;
  @Column({ type: 'text', nullable: true })
  text?: string;
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
