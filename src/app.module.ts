import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NotifyModule } from './modules/notify/notify.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TelegramService } from './modules/telegram/telegram.service';

@Module({
  imports: [TelegramModule, NotifyModule],
  controllers: [AppController],
})
export class AppModule {
  constructor(private readonly telegramService: TelegramService) {
    this.telegramService.startBot();
  }
}
