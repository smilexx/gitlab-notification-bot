import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Approve } from './approve.entity';
import { MergeRequest } from './merge-request.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  externalId: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  username: string;

  @OneToMany(() => Approve, (approve) => approve.user)
  approves: Approve[];

  @OneToMany(() => MergeRequest, (mergeRequest) => mergeRequest.user)
  mergeRequests: MergeRequest[];
}
