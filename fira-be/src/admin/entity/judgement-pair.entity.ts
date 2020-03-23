import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Document } from './document.entity';
import { Query } from './query.entity';

export const COLUMN_PRIORITY = 'priority';

@Entity()
export class JudgementPair {
  @ManyToOne((type) => Document, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  document: Document;
  @ManyToOne((type) => Query, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  query: Query;
  @Column({ name: COLUMN_PRIORITY, nullable: false })
  priority: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
