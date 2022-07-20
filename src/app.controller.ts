import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BOT_TOKEN } from './config';
import { TelegramService } from './modules/telegram/telegram.service';
import { NotifyService } from './modules/notify/notify.service';

@Controller()
export class AppController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly notifyService: NotifyService,
  ) {}

  @Post(`bot${BOT_TOKEN}`)
  async processUpdate(@Body() data: any, @Res() res: Response): Promise<void> {
    await this.telegramService.processUpdate(data);

    res.status(200).send();
  }

  @Post(`notify/:hash`)
  async notify(
    @Param('hash') hash: string,
    @Body() data: any,
    @Res() res: Response,
  ): Promise<void> {
    await this.notifyService.notify(hash, data);

    res.status(200).send();
  }
}
