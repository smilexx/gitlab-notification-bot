import log4js from 'log4js';

import {LOG_LEVEL} from '../config'

const logger = log4js.getLogger();
logger.level = LOG_LEVEL;

export { logger }
