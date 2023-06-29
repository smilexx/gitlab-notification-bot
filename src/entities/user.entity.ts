import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Approve } from './approve.entity';
import { MergeRequest } from './merge-request.entity';
import { Project } from './project.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'external_id' })
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

  @ManyToMany(() => Project)
  @JoinTable({ name: 'users_projects' })
  projects: Project[];
}
