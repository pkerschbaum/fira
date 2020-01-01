import { Entity, Column, ManyToOne } from 'typeorm';

import { Document } from './document.entity';
import { Query } from './query.entity';

@Entity()
export class JudgementPair {
  @ManyToOne(type => Document, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  document: Document;
  @ManyToOne(type => Query, {
    eager: true,
    cascade: false,
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  query: Query;
  @Column({ nullable: false })
  priority: number;
}
