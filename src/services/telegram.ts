import TelegramBot from "node-telegram-bot-api";
import {v4 as uuidV4} from 'uuid';

import {APP_URL, BOT_TOKEN} from "../config";
import {logger} from "./logger";
import {createChat, getChat} from "./postgres";
import {isNil} from "ramda";

export const bot = new TelegramBot(BOT_TOKEN);

export const startBot = () => {
    logger.info('bot started');

    bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

    bot.on('webhook_error', (error) => {
        logger.error(error);
    });

    bot.onText(/\/start/, async (msg) => {
        logger.debug(msg);
        let {rows: [chat]} = await getChat(msg.chat.id.toString());

        logger.debug('chat', chat);
        if (isNil(chat)) {
            const result = await createChat(msg.chat.id.toString(), uuidV4());
            [chat] = result.rows;
        }

        logger.debug(chat);

        bot.sendMessage(msg.chat.id, `Hi here! To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${chat?.hash}`);
    });

    bot.onText(/\/url/, async (msg) => {
        logger.debug(msg);

        const {rows: [chat]} = await getChat(msg.chat.id.toString());

        logger.debug(chat);

        bot.sendMessage(msg.chat.id, `To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${chat?.hash}`);
    });

    bot.onText(/\/settings/, async (msg) => {
        logger.debug(msg);

        bot.sendMessage(msg.chat.id, 'Choose one of the options please:', {
            "reply_markup": {
                "inline_keyboard": [
                    [{
                        "text": "A1"
                        , "callback_data": "A1"
                    },
                        {
                            "text": "B1"
                            , "callback_data": "B1"
                        }]
                ]
            }
        })
    });

    bot.on('callback_query', function (msg) {
        logger.info(msg);
    });
}

export const processUpdate = async (data: any) => bot.processUpdate(data);

export const sendMessage = async (chatId: string | number, text: string) => bot.sendMessage(chatId, text, {parse_mode: "HTML"});
