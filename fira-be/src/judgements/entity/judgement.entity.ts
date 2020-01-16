import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { JudgementStatus, RelevanceLevel, JudgementMode } from '../judgements.types';
import { DocumentVersion } from '../../admin/entity/document.entity';
import { QueryVersion } from '../../admin/entity/query.entity';
import { User } from '../../identity-management/entity/user.entity';

@Entity()
export class Judgement {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ enum: JudgementStatus, nullable: false })
  status: JudgementStatus;
  @Column({ enum: RelevanceLevel, nullable: true })
  relevanceLevel: RelevanceLevel;
  @Column({ type: 'numeric', array: true, nullable: true })
  relevancePositions: number[];
  @Column({ nullable: false })
  rotate: boolean;
  @Column({ enum: JudgementMode, nullable: false })
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
  durationUsedToJudgeMs: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
