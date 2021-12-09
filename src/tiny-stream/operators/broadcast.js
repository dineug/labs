import { Observable } from '../observable/Observable';

export function broadcast() {
  const subscriberList = [];

  return source$ =>
    new Observable(subscriber => {
      subscriberList.push(subscriber);

      const subscription = source$.subscribe({
        next: value =>
          subscriberList.forEach(subscriber => subscriber.next(value)),
        error: err =>
          subscriberList.forEach(subscriber => subscriber.error(err)),
        complete: () =>
          subscriberList.forEach(subscriber => subscriber.complete()),
      });

      return () => {
        subscription.unsubscribe();
        subscriberList.includes(subscriber) &&
          subscriberList.splice(subscriberList.indexOf(subscriber), 1);
      };
    });
}
