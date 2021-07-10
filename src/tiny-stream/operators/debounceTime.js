import { Observable } from '@/seunghwan.lee94@nhntoast.com/feat-stream';

export const debounceTime = ms => source$ =>
  new Observable(subscriber => {
    let timerId = null;

    const subscription = source$.subscribe({
      ...subscriber,
      next: value => {
        clearTimeout(timerId);
        timerId = setTimeout(subscriber.next, ms, value);
      },
    });

    return () => {
      clearTimeout(timerId);
      subscription.unsubscribe();
    };
  });
