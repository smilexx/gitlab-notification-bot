import {intervalToDuration, parse} from "date-fns";
import {logger} from "../services";

const dateFormat = 'yyyy-MM-dd kk:mm:ss';

export const getDuration = (startDate: string, endDate: string) => {
    const start = parse(startDate, dateFormat, new Date());
    logger.debug({startDate, start});

    const end = parse(endDate, dateFormat, new Date());
    logger.debug({endDate, end});

    return startDate && endDate && intervalToDuration({
        start, end
    })
}
