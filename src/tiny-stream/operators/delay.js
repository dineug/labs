import { Observable } from '@/seunghwan.lee94@nhntoast.com/feat-stream';

export const delay = ms => source$ =>
  new Observable(subscriber =>
    source$.subscribe({
      ...subscriber,
      next: value => setTimeout(subscriber.next, ms, value),
    })
  );
