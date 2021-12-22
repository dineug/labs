import { Observable, throttleTime } from '@/tiny-rxjs';

const ob = new Observable((subscriber: any) => {
  let count = 0;

  setInterval(() => {
    subscriber.next(++count);
  }, 100);
});

ob.pipe(throttleTime(1000)).subscribe(console.log);
