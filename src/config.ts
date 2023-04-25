import * as dotenv from 'dotenv';

dotenv.config();

const {
  BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN',
  PORT = 80,
  APP_URL = '',
  LOG_LEVEL = 'info',
  DATABASE_HOST = '',
  DATABASE_USER = '',
  DATABASE_PASSWORD = '',
  DATABASE_NAME = 'bot',
} = process.env;

export {
  BOT_TOKEN,
  PORT,
  APP_URL,
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  LOG_LEVEL,
};
