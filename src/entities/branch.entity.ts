import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'branches' })
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_id' })
  chatId: string;

  @Column()
  branch: string;
}
