import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

const DEFAULT_VERSION = 1;
export const COLUMN_DOCUMENT_VERSION = 'document_version';

@Entity()
export class Document {
  @PrimaryColumn({ nullable: false })
  id: string;
  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
export class DocumentVersion {
  @ManyToOne((type) => Document, {
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
  @Column({ nullable: false })
  text: string;
  @Column({ nullable: false, type: 'text', array: true })
  annotateParts: string[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
