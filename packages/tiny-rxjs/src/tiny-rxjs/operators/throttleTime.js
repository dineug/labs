import { Observable } from '@/tiny-rxjs/Observable';

// https://stackoverflow.com/questions/57059666/how-does-throttletime-operators-config-parameter-work-throttleconfig

const defaultConfig = { leading: true, trailing: false };

export const throttleTime =
  (ms, options = {}) =>
  source$ => {
    const config = Object.assign({}, defaultConfig, options);

    return new Observable(subscriber => {
      let timerId = null;
      let leadingValue = null;
      let trailingValue = null;

      const subscription = source$.subscribe({
        ...subscriber,
        next: value => {
          trailingValue = value;

          if (timerId) return;

          if (config.leading) {
            leadingValue = value;
            subscriber.next(value);
          }

          timerId = setTimeout(() => {
            if (
              config.trailing &&
              (!config.leading || leadingValue !== trailingValue)
            ) {
              subscriber.next(trailingValue);
            }
            timerId = null;
          }, ms);
        },
      });

      return () => {
        clearTimeout(timerId);
        subscription.unsubscribe();
      };
    });
  };
