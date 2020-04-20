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
export const COLUMN_DOCUMENT_VERSION = 'document_version';

export type TDocument = {
  id: string;
  createdAt: Date;
};

export type TDocumentVersion = {
  document: Document;
  version: number;
  text: string;
  annotateParts: string[];
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
export class Document implements TDocument {
  @PrimaryColumn()
  id: string;
  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
@Index(['document', 'version'], { unique: true })
export class DocumentVersion implements TDocumentVersion {
  @ManyToOne(() => Document, {
    eager: true,
    cascade: ['insert'],
    onDelete: 'RESTRICT',
    primary: true,
    nullable: false,
  })
  document: Document;
  @PrimaryColumn({
    name: COLUMN_DOCUMENT_VERSION,
    type: 'integer',
    nullable: false,
    default: DEFAULT_VERSION,
  })
  version: number = DEFAULT_VERSION;
  @Column()
  text: string;
  @Column({ type: 'text', array: true })
  annotateParts: string[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
