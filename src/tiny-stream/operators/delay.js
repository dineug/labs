import { Observable } from '../observable/Observable';

export const delay = ms => source$ =>
  new Observable(subscriber =>
    source$.subscribe({
      ...subscriber,
      next: value => setTimeout(subscriber.next, ms, value),
    })
  );
