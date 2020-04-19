import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { JudgementStatus } from '../../typings/enums';
import { RelevanceLevel, JudgementMode } from '../../../../commons';
import { DocumentVersion } from './document.entity';
import { QueryVersion } from './query.entity';
import { User } from './user.entity';

export type TJudgement = {
  id: number;
  status: JudgementStatus;
  relevanceLevel: RelevanceLevel | null;
  relevancePositions: number[] | null;
  rotate: boolean;
  mode: JudgementMode;
  document: DocumentVersion;
  query: QueryVersion;
  user: User;
  durationUsedToJudgeMs: number | null;
  judgedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
export class Judgement implements TJudgement {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ enum: JudgementStatus })
  status: JudgementStatus;
  @Column({ enum: RelevanceLevel, nullable: true })
  relevanceLevel: RelevanceLevel;
  @Column({ type: 'numeric', array: true, nullable: true })
  relevancePositions: number[] | null;
  @Column()
  rotate: boolean;
  @Column({ enum: JudgementMode })
  mode: JudgementMode;
  @ManyToOne(() => DocumentVersion, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  document: DocumentVersion;
  @ManyToOne(() => QueryVersion, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  query: QueryVersion;
  @ManyToOne(() => User, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  user: User;
  @Column({ nullable: true, type: 'integer' })
  durationUsedToJudgeMs: number | null;
  @Column({ nullable: true, type: 'timestamp with time zone' })
  judgedAt: Date | null;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
