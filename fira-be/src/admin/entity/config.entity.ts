import { Entity, PrimaryColumn, Column, Check, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { JudgementMode } from '../../judgements/judgements.types';

const nameOfUniqueColumn = 'id';
const uniqueValue = 1;

@Entity()
export class Config {
  // add fixed primary key to allow only one entry in the config table
  @PrimaryColumn({
    default: uniqueValue,
    nullable: false,
    update: false,
    name: nameOfUniqueColumn,
  })
  @Check(`${nameOfUniqueColumn} = ${uniqueValue}`)
  id: number = uniqueValue;
  @Column({ type: 'integer', nullable: false })
  annotationTargetPerUser: number;
  @Column({ type: 'integer', nullable: false })
  annotationTargetPerJudgPair: number;
  @Column({ enum: JudgementMode, nullable: false })
  judgementMode: JudgementMode;
  @Column({ type: 'boolean', nullable: false })
  rotateDocumentText: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
