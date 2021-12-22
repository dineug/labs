function* source() {
  yield 1;
  yield 2;
  yield 3;
  // throw new Error('error');
}

const multiply = num =>
  async function* (source) {
    for await (const value of source) yield value * num;
  };

const iterable = source();

const pipe =
  (...operators) =>
  initSource =>
    operators.reduce((source, operator) => operator(source), initSource);

try {
  const iter = pipe(
    multiply(2),
    multiply(5),
    multiply(3),
    multiply(7)
  )(iterable);

  for await (const value of iter) {
    console.log(value);
  }

  console.log('complete');
} catch (err) {
  console.error(err);
}
