import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MergeRequest } from './merge-request.entity';
import { User } from './user.entity';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'external_id' })
  externalId: number;

  @Column({ nullable: true, name: 'path_with_namespace' })
  pathWithNamespace: string;

  @OneToMany(() => MergeRequest, (mergeRequest) => mergeRequest.project)
  mergeRequests: MergeRequest[];
}
