import { Entity, PrimaryColumn, Column, Check, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
