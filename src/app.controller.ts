import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PipelineEvent, TagPushEvent } from 'gitlab-event-types';
import { BOT_TOKEN, SECRET_TOKEN } from './config';
import { NotifyService } from './modules/notify/notify.service';
import { TelegramService } from './modules/telegram/telegram.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly notifyService: NotifyService,
  ) {}

  @Post(`bot${BOT_TOKEN}`)
  async processUpdate(@Body() data: any, @Res() res: Response): Promise<void> {
    try {
      this.logger.debug(data);

      await this.telegramService.processUpdate(data);

      res.status(200).send();
    } catch (e) {
      this.logger.error(e.message);

      throw e;
    }
  }

  @Post(`notify/:hash`)
  async notify(
    @Param('hash') hash: string,
    @Body() data: PipelineEvent | TagPushEvent,
    @Res() res: Response,
    @Query('options') options: string,
  ): Promise<void> {
    if (hash !== SECRET_TOKEN) {
      throw new UnauthorizedException();
    }
    try {
      const { chatId, branches } = JSON.parse(
        Buffer.from(options, 'base64').toString(),
      );

      await this.notifyService.notify(chatId, branches, data);

      res.status(200).send();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
