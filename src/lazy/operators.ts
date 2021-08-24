function* map<T, R>(f: (value: T) => R, iter: Iterable<T>) {
  for (const value of iter) {
    yield f(value);
  }
}

function* filter<T>(predicate: (value: T) => boolean, iter: Iterable<T>) {
  for (const value of iter) {
    if (predicate(value)) yield value;
  }
}

function* take<T>(length: number, iter: Iterable<T>) {
  let i = 0;
  for (const value of iter) {
    if (i >= length) return;
    yield value;
    i++;
  }
}

const toArray = <T>(iter: Iterable<T>) => [...iter];

export const from = <T>(iter: Iterable<T>) => ({
  map: <R>(f: (value: T) => R) => from(map(f, iter)),
  filter: (predicate: (value: T) => boolean) => from(filter(predicate, iter)),
  take: (length: number) => from(take(length, iter)),
  toArray: () => toArray(iter),
});
