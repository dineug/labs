function createSubject() {
  const observers = [];

  const addObserver = observer => observers.push(observer);

  const unobserve = observer =>
    observers.includes(observer) &&
    observers.splice(observers.indexOf(observer), 1);

  const effect = value => observers.forEach(observer => observer(value));

  return {
    addObserver,
    unobserve,
    effect,
  };
}

function observable() {
  const subjectMap = {};

  const observer = (topic, f) => {
    const subject = subjectMap[topic] ?? (subjectMap[topic] = createSubject());
    subject.addObserver(f);
    return () => subject.unobserve(f);
  };

  const unobserve = (topic, f) =>
    subjectMap[topic] && subjectMap[topic].unobserve(f);

  const effect = (topic, value) =>
    subjectMap[topic] && subjectMap[topic].effect(value);

  return {
    observer,
    unobserve,
    effect,
  };
}

// ================

const state = observable();

state.observer('count', value => console.log('1', value));
state.observer('count', value => console.log('2', value));

let count = 0;
setInterval(() => {
  // notify
  state.effect('count', count++);
}, 1000);
