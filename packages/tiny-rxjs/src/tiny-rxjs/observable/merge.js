import { Observable } from '@/tiny-rxjs/Observable';

export const merge = (...observables) =>
  new Observable(subscriber => {
    const subscriptions = observables.map(source$ =>
      source$.subscribe(subscriber)
    );

    return () =>
      subscriptions.forEach(subscription => subscription.unsubscribe());
  });
