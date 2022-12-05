import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { NotifyService } from './notify.service';

@Module({
  imports: [TelegramModule],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
