import * as dotenv from 'dotenv';

dotenv.config();

const {
  BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN',
  PORT = 80,
  APP_URL = 'https://<app-name>.herokuapp.com:443',
  LOG_LEVEL = 'debug',
  SECRET_TOKEN,
} = process.env;

export { BOT_TOKEN, PORT, APP_URL, LOG_LEVEL, SECRET_TOKEN };
