import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

export type TUser = {
  id: string;
  createdAt: Date;
};

@Entity()
export class User implements TUser {
  @PrimaryColumn()
  id: string;
  @CreateDateColumn()
  createdAt: Date;
}
