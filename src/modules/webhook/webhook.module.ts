import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Chat } from '../../entities/chat.entity';
import { MergeModule } from '../merge/merge.module';
import { TelegramModule } from '../telegram/telegram.module';
import { WebHookService } from './webhook.service';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TelegramModule,
    MergeModule,
    TypeOrmModule.forFeature([Chat, Branch, User]),
  ],
  providers: [WebHookService],
  exports: [WebHookService],
})
export class WebHookModule {}
