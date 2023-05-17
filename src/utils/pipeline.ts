import { __, includes, pipe, prop } from 'ramda';

export const isNotifyStatus = pipe(
  prop('status'),
  includes(__, ['success', 'failed']),
);
