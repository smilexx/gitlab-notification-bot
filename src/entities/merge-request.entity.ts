import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Chat } from './chat.entity';
import { Approve } from './approve.entity';
import { User } from './user.entity';

@Entity({ name: 'merge_requests' })
export class MergeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column({ nullable: true, name: 'megre_request_id' })
  mergeRequestId: number;

  @Column({ nullable: true, name: 'discussion_id' })
  discussionId: string;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ nullable: true, name: 'note_id' })
  noteId: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true, name: 'message_id' })
  messageId: number;

  @OneToMany(() => Approve, (approve) => approve.mergeRequest)
  approves: Approve[];

  @ManyToOne(() => Chat, (chat) => chat.mergeRequests)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.mergeRequests)
  user: User;
}
