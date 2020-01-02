import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { DocumentVersion } from '../../admin/entity/document.entity';
import { QueryVersion } from '../../admin/entity/query.entity';
import { User } from '../../identity-management/entity/user.entity';

export enum JudgementStatus {
  TO_JUDGE = 'TO_JUDGE',
  JUDGED = 'JUDGED',
}

export enum RelevanceLevel {
  NOT_RELEVANT = '0_NOT_RELEVANT',
  TOPIC_RELEVANT_DOES_NOT_ANSWER = '1_TOPIC_RELEVANT_DOES_NOT_ANSWER',
  GOOD_ANSWER = '2_GOOD_ANSWER',
  PERFECT_ANSWER = '3_PERFECT_ANSWER',
  MISLEADING_ANSWER = '-1_MISLEADING_ANSWER',
}

export enum JudgementMode {
  PLAIN_RELEVANCE_SCORING = 'PLAIN_RELEVANCE_SCORING',
  SCORING_AND_SELECT_SPANS = 'SCORING_AND_SELECT_SPANS',
}

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
}
