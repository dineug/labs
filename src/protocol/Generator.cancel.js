export function* CancelGenerator(iterator, cancelRef) {
  for (const value of iterator) {
    if (value && value[Symbol.iterator]) {
      yield* CancelGenerator(value, cancelRef);
    } else {
      yield value;
    }

    if (cancelRef.value) return;
  }
}

function* generator() {
  yield 1;
  yield 2;
  yield 3;
  // throw new Error('error');
}

const multiplyI = num => value => value * num;

const iterable = generator();

const pipe = (...operators) => initValue =>
  operators.reduce((value, operator) => operator(value), initValue);

try {
  const cancelRef = { value: false };
  const cancel = () => (cancelRef.value = true);
  const ops = pipe(multiplyI(2), multiplyI(5), multiplyI(3), multiplyI(7));

  for (const value of CancelGenerator(iterable, cancelRef)) {
    value === 2 && cancel(); // ! Cancel

    console.log(ops(value));
  }
  console.log('complete');
} catch (err) {
  console.error(err);
}
