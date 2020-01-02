import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';

const DEFAULT_VERSION = 1;
export const COLUMN_QUERY_VERSION = 'query_version';

@Entity()
export class Query {
  @PrimaryColumn()
  id: number;
}

@Entity()
export class QueryVersion {
  @ManyToOne(type => Query, {
    eager: true,
    cascade: ['insert'],
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  query: Query;
  @PrimaryColumn({
    name: COLUMN_QUERY_VERSION,
    type: 'integer',
    nullable: false,
    default: DEFAULT_VERSION,
  })
  version: number = DEFAULT_VERSION;
  @Column({ nullable: false })
  text: string;
}
