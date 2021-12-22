import { range } from 'lodash-es';

const MAX = 1_000_000_000;

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const createData = (size = 100) =>
  range(0, size).map(() => getRandomInt(1, MAX).toString());

const createHeader = (size = 100) => range(0, size).map(n => `header-${n}`);

export function* generateData(size: number, total: number) {
  while (true) {
    const headers: string[] = createHeader();
    const list = range(0, size).map(() => createData());

    yield {
      headers,
      list,
      total,
    };
  }
}

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
