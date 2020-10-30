import { Entity, PrimaryColumn, Column, Check, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { JudgementMode } from '../../../../fira-commons';

const nameOfUniqueColumn = 'id';
const uniqueValue = 1;

export type TConfig = {
  id: number;
  annotationTargetPerUser: number;
  annotationTargetPerJudgPair: number;
  judgementMode: JudgementMode;
  rotateDocumentText: boolean;
  annotationTargetToRequireFeedback: number;
  createdAt: Date;
  updatedAt: Date;
};

@Entity()
export class Config implements TConfig {
  // add fixed primary key to allow only one entry in the config table
  @PrimaryColumn({
    default: uniqueValue,
    nullable: false,
    update: false,
    name: nameOfUniqueColumn,
  })
  @Check(`${nameOfUniqueColumn} = ${uniqueValue}`)
  id: number = uniqueValue;
  @Column({ type: 'integer' })
  annotationTargetPerUser: number;
  @Column({ type: 'integer' })
  annotationTargetPerJudgPair: number;
  @Column({ enum: JudgementMode })
  judgementMode: JudgementMode;
  @Column({ type: 'boolean' })
  rotateDocumentText: boolean;
  @Column({ type: 'integer' })
  annotationTargetToRequireFeedback: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
