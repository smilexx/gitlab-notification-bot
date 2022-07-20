import { Injectable, Logger } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidV4 } from 'uuid';

import { APP_URL, BOT_TOKEN } from '../../config';
import { Chat } from '../../entities/chat.entity';
import { Branch } from 'src/entities/branch.entity';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private bot = null;

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
  }

  public processUpdate = async (data: any) => this.bot.processUpdate(data);

  public sendMessage = async (chatId: string | number, text: string) =>
    this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });

  private webhookError = (error) => {
    this.logger.error(error);
  };

  private getChatByChatId = (chatId: string | number): Promise<Chat> => {
    return this.chatsRepository.findOne({
      where: { chatId: chatId.toString() },
    });
  };

  private onStart = async (msg) => {
    this.logger.debug(msg);

    const chatId = msg.chat.id;

    let chat = await this.getChatByChatId(chatId);

    this.logger.debug('chat', chat);

    if (isNil(chat)) {
      chat = await this.chatsRepository.create({
        chatId: chatId.toString(),
        hash: uuidV4(),
      });
    }

    this.logger.debug(chat);

    this.bot.sendMessage(
      chatId,
      `Hi here! To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${chat?.hash}`,
    );
  };

  private onUrl = async (msg) => {
    this.logger.debug(msg);

    const chat = await this.getChatByChatId(msg.chat.id.toString());

    this.logger.debug(chat);

    this.bot.sendMessage(
      msg.chat.id,
      `To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${chat?.hash}`,
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
              callback_data: '/branches',
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
      const text = [
        'You subscribe to:',
        `<pre>${branches.map(({ branch }) => `- ${branch}`).join('\n')}</pre>`,
        '',
        'to add new branch send /addbranch',
      ];

      this.bot.sendMessage(msg.chat.id, text.join('\n'), {
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

  private onMessage = (msg) => {
    this.logger.debug('get message', msg);

    const callback = this.answerCallbacks[msg.chat.id];
    if (callback) {
      delete this.answerCallbacks[msg.chat.id];
      return callback(msg);
    }
  };
}
