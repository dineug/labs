import { Observable } from 'rxjs';

const source = subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  // subscriber.error('error');
};

const multiply = num => source$ =>
  new Observable(subscriber =>
    source$.subscribe({
      next: value => subscriber.next(value * num),
      error: e => subscriber.error(e),
      complete: () => subscriber.complete(),
    })
  );

const observable = new Observable(source);

observable.pipe(multiply(2), multiply(5), multiply(3), multiply(7)).subscribe({
  next: console.log,
  error: console.error,
  complete: () => console.log('complete'),
});
