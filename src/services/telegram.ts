import TelegramBot from "node-telegram-bot-api";
import {v4 as uuidV4} from 'uuid';

import {APP_URL, BOT_TOKEN} from "../config";
import {logger} from "./logger";
import {createBranch, createChat, getBranches, getChat} from "./postgres";
import {isNil} from "ramda";

export const bot = new TelegramBot(BOT_TOKEN);

export const startBot = () => {
    logger.info('bot started');

    bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

    bot.on('webhook_error', (error) => {
        logger.error(error);
    });

    const answerCallbacks = {};

    bot.onText(/\/start/, async (msg) => {
        logger.debug(msg);
        let chat = await getChat(msg.chat.id.toString());

        logger.debug('chat', chat);
        if (isNil(chat)) {
            chat = await createChat(msg.chat.id.toString(), uuidV4());
        }

        logger.debug(chat);

        bot.sendMessage(msg.chat.id, `Hi here! To setup notifications for this chat your GitLab project(repo), open Settings -> Web Hooks and add this URL: ${APP_URL}/notify/${chat?.hash}`);
    });

    bot.onText(/\/url/, async (msg) => {
        logger.debug(msg);

        const chat = await getChat(msg.chat.id.toString());

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
                        , "callback_data": "/branches"
                    },
                        {
                            "text": "B1"
                            , "callback_data": "B1"
                        }]
                ]
            }
        })
    });

    bot.onText(/\/branches/, async (msg) => {
        const branches = await getBranches(msg.chat.id.toString());

        if (branches.length === 0) {
            bot.sendMessage(msg.chat.id,'You subscribe to all branches. To add new branch send /addbranch');
        } else {
            const text = [
                'You subscribe to:',
                `<pre>${branches.map(({ branch }) => `- ${branch}`).join('\n')}</pre>`,
                '',
                'to add new branch send /addbranch'
            ];

            bot.sendMessage(msg.chat.id, text.join('\n'), { parse_mode: "HTML" });
        }
    });

    bot.onText(/\/addbranch/, async (msg) => {
        await bot.sendMessage(msg.chat.id, 'Enter name branch');

        answerCallbacks[msg.chat.id] = async (msg) => {
            await createBranch(msg.chat.id.toString(), msg.text);

            bot.sendMessage(msg.chat.id, `Success create subscribe to branch ${msg.text}`);
        }
    });

    bot.onText(/\/removebranch/, async (msg) => {
        await bot.sendMessage(msg.chat.id, 'Enter name branch');

        answerCallbacks[msg.chat.id] = async (msg) => {
            await createBranch(msg.chat.id.toString(), msg.text);

            bot.sendMessage(msg.chat.id, `Success create subscribe to branch ${msg.text}`);
        }
    });

    bot.on('message', function (msg) {
        const callback = answerCallbacks[msg.chat.id];
        if (callback) {
            delete answerCallbacks[msg.chat.id];
            return callback(msg);
        }
    });

    bot.on('callback_query', function (msg) {
        logger.info(msg);
    });
}

export const processUpdate = async (data: any) => bot.processUpdate(data);

export const sendMessage = async (chatId: string | number, text: string) => bot.sendMessage(chatId, text, {parse_mode: "HTML"});
