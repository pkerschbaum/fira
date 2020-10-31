import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

const DEFAULT_VERSION = 1;
export const COLUMN_QUERY_VERSION = 'query_version';

export type TQuery = {
  id: string;
  createdAt: Date;
};

export type TQueryVersion = {
  query: Query;
  version: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
export class Query implements TQuery {
  @PrimaryColumn()
  id: string;
  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
@Index(['query', 'version'], { unique: true })
export class QueryVersion implements TQueryVersion {
  @ManyToOne(() => Query, {
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
  @Column()
  text: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
