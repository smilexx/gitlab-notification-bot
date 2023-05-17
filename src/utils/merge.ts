import { propEq } from 'ramda';

export const isWorkInProgress = propEq('work_in_progress', true);
