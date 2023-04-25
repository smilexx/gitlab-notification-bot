import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
