import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Approve } from './approve.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => Approve, (approve) => approve.user)
  approves: Approve[];
}
