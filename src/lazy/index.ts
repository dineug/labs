import { from } from './operators';

const result = from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .take(2)
  .toArray();

console.log(result);
