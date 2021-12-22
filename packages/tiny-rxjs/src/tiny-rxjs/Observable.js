import { isFunction, noop } from 'lodash-es';

import { pipe } from '@/tiny-rxjs/pipe';

export class Observable {
  constructor(source) {
    this.source = source;
  }

  subscribe(observer) {
    let next = isFunction(observer) ? observer : observer.next;
    let isUnsubscribe = false;

    const destroyCallback = () => {
      if (!destroy) return;
      isFunction(destroy) ? destroy() : destroy.unsubscribe();
    };

    const unsubscribe = () => {
      if (isUnsubscribe) return;
      next = noop;
      destroy ? destroyCallback() : queueMicrotask(destroyCallback);
      isUnsubscribe = true;
    };

    const subscriber = {
      next: value => next(value),
      error(err) {
        unsubscribe();
        observer.error && observer.error(err);
      },
      complete() {
        unsubscribe();
        observer.complete && observer.complete();
      },
    };

    var destroy = this.source(subscriber);

    return {
      unsubscribe,
    };
  }

  pipe(...operators) {
    return operators.length ? pipe(...operators)(this) : this;
  }
}
