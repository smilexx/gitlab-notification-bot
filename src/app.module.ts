import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TelegramModule } from './modules/telegram/telegram.module';
import {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} from './config';
import { Branch } from './entities/branch.entity';
import { Chat } from './entities/chat.entity';
import { NotifyModule } from './modules/notify/notify.module';
import { TelegramService } from './modules/telegram/telegram.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DATABASE_HOST,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      entities: [Chat, Branch],
      ssl: false,
    }),
    TelegramModule,
    NotifyModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor(private readonly telegramService: TelegramService) {
    this.telegramService.startBot();
  }
}
