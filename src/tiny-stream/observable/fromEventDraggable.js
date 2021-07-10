import { merge, fromEvent } from './index';
import { throttleTime, debounceTime, takeUntil } from '../operators';

export const fromEventDraggable = items =>
  merge(
    ...items.map(item => fromEvent(item, 'dragover').pipe(throttleTime(300)))
  ).pipe(
    debounceTime(50),
    takeUntil(merge(...items.map(item => fromEvent(item, 'dragend'))))
  );
