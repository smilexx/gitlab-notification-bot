import { Injectable, Logger } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidV4 } from 'uuid';
import * as pug from 'pug';

import { APP_URL, BOT_TOKEN } from '../../config';
import { Chat } from '../../entities/chat.entity';
import { Branch } from 'src/entities/branch.entity';

const templateMap = {
  start: pug.compileFile('views/messages/start.pug'),
  url: pug.compileFile('views/messages/url.pug'),
  branches: pug.compileFile('views/messages/branches.pug'),
};

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private bot: TelegramBot = null;

  private answerCallbacks = {};

  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {
    this.bot = new TelegramBot(BOT_TOKEN);
  }

  public startBot(): void {
    this.logger.log('bot started');

    this.bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

    this.bot.on('webhook_error', this.webhookError);

    this.bot.onText(/\/start/, this.onStart);
    this.bot.onText(/\/url/, this.onUrl);
    this.bot.onText(/\/settings/, this.onSettings);
    this.bot.onText(/\/branches/, this.onBranches);
    this.bot.onText(/\/addbranch/, this.onAddBranch);
    this.bot.onText(/\/removebranch/, this.onRemoveBranch);
    this.bot.on('message', this.onMessage);
    this.bot.on('channel_post', this.onChannelPost);
  }

  public processUpdate = async (data: any) => this.bot.processUpdate(data);

  public sendMessage = async (chatId: string | number, text: string) =>
    this.bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

  public editMessage = async (
    chatId: string | number,
    messageId: number,
    text: string,
  ) => {
    try {
      this.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } catch (e) {
      return false;
    }
  };

  private webhookError = (error) => {
    this.logger.error(error);
  };

  private getChatByChatId = (chatId: string | number): Promise<Chat> => {
    return this.chatsRepository.findOne({
      where: { chatId: chatId.toString() },
    });
  };

  private onStart = async (msg: TelegramBot.Message) => {
    this.logger.debug(msg);

    const chatId = msg.chat.id;

    let chat = await this.getChatByChatId(chatId);

    this.logger.debug('chat', chat);

    if (isNil(chat)) {
      chat = await this.chatsRepository.save({
        chatId: chatId.toString(),
        hash: uuidV4(),
      });
    }

    this.logger.debug(chat);

    this.bot.sendMessage(
      chatId,
      templateMap.start({ appUrl: APP_URL, hash: chat.hash }),
      { parse_mode: 'HTML' },
    );
  };

  private onUrl = async (msg) => {
    this.logger.debug(msg);

    const chat = await this.getChatByChatId(msg.chat.id.toString());

    this.logger.debug(chat);

    this.bot.sendMessage(
      msg.chat.id,
      templateMap.url({ appUrl: APP_URL, hash: chat.hash }),
      { parse_mode: 'HTML' },
    );
  };

  private onSettings = async (msg) => {
    this.logger.debug(msg);

    this.bot.sendMessage(msg.chat.id, 'Choose one of the options please:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'A1',
              callback_data: 'A1',
            },
            {
              text: 'B1',
              callback_data: 'B1',
            },
          ],
        ],
      },
    });
  };

  private onBranches = async (msg) => {
    const branches = await this.branchesRepository.find({
      where: { chatId: msg.chat.id.toString() },
    });

    if (branches.length === 0) {
      this.bot.sendMessage(
        msg.chat.id,
        'You subscribe to all branches. To add new branch send /addbranch',
      );
    } else {
      this.bot.sendMessage(msg.chat.id, templateMap.branches({ branches }), {
        parse_mode: 'HTML',
      });
    }
  };

  private onAddBranch = async (msg) => {
    await this.bot.sendMessage(msg.chat.id, 'Enter name branch');

    this.answerCallbacks[msg.chat.id] = async (msg) => {
      await this.branchesRepository.create({
        chatId: msg.chat.id.toString(),
        branch: msg.text,
      });

      this.bot.sendMessage(
        msg.chat.id,
        `Success create subscribe to branch ${msg.text}`,
      );
    };
  };

  private onRemoveBranch = async (msg) => {
    await this.bot.sendMessage(msg.chat.id, 'Enter name branch');

    this.answerCallbacks[msg.chat.id] = async (msg) => {
      await this.branchesRepository.delete({
        chatId: msg.chat.id.toString(),
        branch: msg.text,
      });

      this.bot.sendMessage(
        msg.chat.id,
        `Success create subscribe to branch ${msg.text}`,
      );
    };
  };

  private onMessage = (msg: TelegramBot.Message) => {
    this.logger.debug('get message', msg);

    const callback = this.answerCallbacks[msg.chat.id];
    if (callback) {
      delete this.answerCallbacks[msg.chat.id];
      return callback(msg);
    }
  };

  private onChannelPost = (msg: TelegramBot.Message) => {
    this.logger.debug('get message', msg);

    if (msg.text === '/start') {
      this.onStart(msg);
    }
  };
}
