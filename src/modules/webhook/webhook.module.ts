import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Chat } from '../../entities/chat.entity';
import { MergeModule } from '../merge/merge.module';
import { TelegramModule } from '../telegram/telegram.module';
import { WebHookService } from './webhook.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TelegramModule,
    MergeModule,
    UsersModule,
    TypeOrmModule.forFeature([Chat, Branch]),
  ],
  providers: [WebHookService],
  exports: [WebHookService],
})
export class WebHookModule {}
