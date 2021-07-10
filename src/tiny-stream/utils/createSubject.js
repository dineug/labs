export function createSubject() {
  const observers = [];

  const next = (...value) => {
    observers.forEach(observer => observer(...value));
  };

  const subscribe = observer => {
    observers.push(observer);

    return () => {
      observers.includes(observer) &&
        observers.splice(observers.indexOf(observer), 1);
    };
  };

  return {
    next,
    subscribe,
  };
}
