const executor = (resolve, reject) => {
  resolve(1);
  // reject('error');
};

const multiply = num => value => value * num;

const promise = new Promise(executor);

promise
  .then(multiply(2))
  .then(multiply(5))
  .then(multiply(3))
  .then(multiply(7))
  .then(console.log)
  .catch(console.error)
  .finally(() => console.log('finally'));
