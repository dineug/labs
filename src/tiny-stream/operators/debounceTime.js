import { Observable } from '../observable/Observable';

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
