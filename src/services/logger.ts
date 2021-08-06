import log4js from 'log4js';

import {INFO_LEVEL} from '../config'

const logger = log4js.getLogger();
logger.level = INFO_LEVEL;

export { logger }
