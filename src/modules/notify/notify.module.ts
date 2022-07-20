import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyService } from './notify.service';
import { TelegramModule } from '../telegram/telegram.module';
import { Chat } from '../../entities/chat.entity';
import { Branch } from '../../entities/branch.entity';

@Module({
  imports: [TelegramModule, TypeOrmModule.forFeature([Chat, Branch])],
  providers: [NotifyService],
  exports: [NotifyService]
})
export class NotifyModule {}
