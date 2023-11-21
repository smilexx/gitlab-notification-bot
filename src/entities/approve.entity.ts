import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { MergeRequest } from './merge-request.entity';

@Entity({ name: 'approves' })
@Unique('user_merge_request', ['user', 'mergeRequest'])
export class Approve {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.approves)
  user: User;

  @ManyToOne(() => MergeRequest, (mergeRequest) => mergeRequest.approves)
  mergeRequest: MergeRequest;
}
