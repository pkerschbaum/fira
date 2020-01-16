import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;
  @CreateDateColumn()
  createdAt: Date;
}
