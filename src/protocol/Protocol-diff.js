import { Observable } from 'rxjs';

/**
 * * RxJS ObservableProtocol
 */

const source = subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  // subscriber.error('error');
};

const multiplyO = num => source$ =>
  new Observable(subscriber =>
    source$.subscribe({
      ...subscriber,
      next: value => subscriber.next(value * num),
    })
  );

const observable = new Observable(source);

observable
  .pipe(multiplyO(2), multiplyO(5), multiplyO(3), multiplyO(7))
  .subscribe({
    next: console.log,
    error: console.error,
    complete: () => console.log('complete'),
  });

/**
 * * PromiseProtocol
 */

const executor = (resolve, reject) => {
  resolve(1);
  // reject('error');
};

const multiplyP = num => value => value * num;

const promise = new Promise(executor);

promise
  .then(multiplyP(2))
  .then(multiplyP(5))
  .then(multiplyP(3))
  .then(multiplyP(7))
  .then(console.log)
  .catch(console.error)
  .finally(() => console.log('finally'));

/**
 * * IterableProtocol
 */

function* generator() {
  yield 1;
  yield 2;
  yield 3;
  // throw new Error('error');
}

const multiplyI = num => value => value * num;

const iterable = generator();

const pipe =
  (...operators) =>
  initValue =>
    operators.reduce((value, operator) => operator(value), initValue);

try {
  [...iterable]
    .map(pipe(multiplyI(2), multiplyI(5), multiplyI(3), multiplyI(7)))
    .map(console.log);
  console.log('complete');
} catch (err) {
  console.error(err);
}

/**
 * * IterableProtocol, Pipeline operator
 * https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Pipeline_operator
 * https://babeljs.io/docs/en/babel-plugin-proposal-pipeline-operator
 */

function* generatorP() {
  yield 1;
  yield 2;
  yield 3;
  // throw new Error('error');
}

const multiplyIP = num => value => value * num;

const iterableP = generatorP();

try {
  [...iterableP]
    .map(
      value =>
        value
        |> multiplyIP(2)
        |> multiplyIP(5)
        |> multiplyIP(3)
        |> multiplyIP(7)
    )
    .map(console.log);
  console.log('complete');
} catch (err) {
  console.error(err);
}
