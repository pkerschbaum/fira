import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Document {
  @PrimaryColumn()
  id: number;
  @Column({ nullable: false })
  text: string;
}
