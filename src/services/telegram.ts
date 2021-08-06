import TelegramBot from "node-telegram-bot-api";

import {APP_URL, BOT_TOKEN} from "../config";
import {logger} from "./logger";

export const bot = new TelegramBot(BOT_TOKEN);

export const startBot = () => {
    logger.info('bot started');

    bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, `Hi here! To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${msg.chat.id}`);
    });
}

export const processUpdate = async (data: any) => bot.processUpdate(data);

export const sendMessage = async (chatId: string | number, text: string) => bot.sendMessage(chatId, text);
