const CANCEL = Symbol('cancel');

function CancelPromise(executor) {
  let cancelReject = null;
  const cancelPromise = new Promise((_, reject) => (cancelReject = reject));
  const newPromise = new Promise(executor);
  const cancel = () => cancelReject(CANCEL);
  return [Promise.race([cancelPromise, newPromise]), cancel];
}

const executor = (resolve, reject) => {
  setTimeout(resolve, 0, 1);
  // reject('error');
};

const multiplyP = num => value => value * num;

const [promise, cancel] = CancelPromise(executor);

cancel(); // ! Cancel

promise
  .then(multiplyP(2))
  .then(multiplyP(5))
  .then(multiplyP(3))
  .then(multiplyP(7))
  .then(console.log)
  .catch(console.error)
  .finally(() => console.log('finally'));
