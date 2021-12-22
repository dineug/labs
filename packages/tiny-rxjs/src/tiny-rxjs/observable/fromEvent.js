import { Observable } from '@/tiny-rxjs/Observable';

export const fromEvent = (element, eventName) =>
  new Observable(subscriber => {
    const handler = event => subscriber.next(event);

    element.addEventListener(eventName, handler);

    return () => element.removeEventListener(eventName, handler);
  });
