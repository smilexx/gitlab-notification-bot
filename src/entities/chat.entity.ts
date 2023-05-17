import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MergeRequest } from './merge-request.entity';

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_id' })
  chatId: string;

  @Column()
  hash: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => MergeRequest, (mergeRequest) => mergeRequest.chat)
  mergeRequests: MergeRequest[];
}
