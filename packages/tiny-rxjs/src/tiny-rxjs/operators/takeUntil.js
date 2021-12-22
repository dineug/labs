import { Observable } from '@/tiny-rxjs/Observable';

export const takeUntil = notifier$ => source$ =>
  new Observable(subscriber => {
    const subscriptions = [];

    subscriptions.push(
      source$.subscribe(subscriber),
      notifier$.subscribe({
        next: () => subscriber.complete(),
        error: () => subscriber.complete(),
        complete: () => subscriber.complete(),
      })
    );

    return () =>
      subscriptions.forEach(subscription => subscription.unsubscribe());
  });
