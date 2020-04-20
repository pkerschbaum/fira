import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

import { Document } from './document.entity';
import { Query } from './query.entity';

export const COLUMN_PRIORITY = 'priority';

export type TJudgementPair = {
  document: Document;
  query: Query;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
@Index(['document'])
@Index(['query'])
export class JudgementPair implements TJudgementPair {
  @ManyToOne(() => Document, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  document: Document;
  @ManyToOne(() => Query, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  query: Query;
  @Column({ name: COLUMN_PRIORITY })
  priority: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
