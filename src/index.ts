import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const port = process.env.PORT || 80;

const url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443';
const bot = new TelegramBot(token, {webHook: {port}});
console.log(`${url}/bot${token}`);
bot.setWebHook(`${url}/bot${token}`);

bot.on('message', function onMessage(msg) {
    bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
});
