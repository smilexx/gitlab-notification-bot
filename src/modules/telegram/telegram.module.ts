import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { Branch } from '../../entities/branch.entity';
import { Chat } from '../../entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Branch])],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
