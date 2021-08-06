import TelegramBot from "node-telegram-bot-api";

import {PORT, BOT_TOKEN, APP_URL} from "../config";
import {logger} from "./logger";

const bot = new TelegramBot(BOT_TOKEN, {webHook: {port: Number(PORT)}});

export const startBot = () => {
    logger.info('bot started');

    bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

    bot.onText(/\/start/, (msg) => {
        logger.debug('new message', msg);

        bot.sendMessage(msg.chat.id, msg.chat.id.toString());
    });
}
