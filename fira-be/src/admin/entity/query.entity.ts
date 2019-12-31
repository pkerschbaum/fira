import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Query {
  @PrimaryColumn()
  id: number;
  @Column({ nullable: false })
  text: string;
}
