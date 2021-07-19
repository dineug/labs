export const isObject = obj => !!obj && typeof obj === 'object';
export const isArray = obj => Array.isArray(obj);

const rawToProxy = new WeakMap();
const rawToObservers = new WeakMap();
const proxyToRaw = new WeakMap();
const observerToTriggers = new WeakMap();
const queue = [];

let currentObserver = null;
let batch = false;

export function observer(f) {
  currentObserver = f;
  f();
  currentObserver = null;

  return () => unobserve(f);
}

function unobserve(observer) {
  const triggers = observerToTriggers.get(observer);

  triggers?.forEach(({ raw }) => {
    const observers = rawToObservers.get(raw);

    observers &&
      observers.includes(observer) &&
      observers.splice(observers.indexOf(observer), 1);
  });

  triggers && observerToTriggers.delete(observer);
}

function addObserver(raw) {
  if (!currentObserver) return;

  const observers = rawToObservers.get(raw);

  if (!observers) {
    rawToObservers.set(raw, [currentObserver]);
  } else if (!observers.includes(currentObserver)) {
    observers.push(currentObserver);
  }
}

function addTrigger(raw, p) {
  if (!currentObserver) return;

  const triggers = observerToTriggers.get(currentObserver);

  if (triggers) {
    const trigger = triggers.find(trigger => trigger.raw === raw);

    if (!trigger) {
      triggers.push({ raw, keys: [p] });
    } else if (!trigger.keys.includes(p)) {
      trigger.keys.push(p);
    }
  } else {
    observerToTriggers.set(currentObserver, [{ raw, keys: [p] }]);
  }
}

function isTrigger(raw, p, observer) {
  const triggers = observerToTriggers.get(observer);

  return triggers
    ? triggers.some(trigger => trigger.raw === raw && trigger.keys.includes(p))
    : false;
}

const effect = (raw, p) =>
  rawToObservers.get(raw)?.forEach(observer => {
    if (!isTrigger(raw, p, observer)) return;

    queue.includes(observer) || queue.push(observer);

    if (!batch) {
      requestAnimationFrame(execute);
      batch = true;
    }
  });

function execute() {
  while (queue.length) {
    const target = queue.shift();

    unobserve(target);
    observer(target);
  }
  batch = false;
}

export function observable(raw) {
  const proxy = new Proxy(raw, {
    get(target, p, receiver) {
      const value = Reflect.get(target, p, receiver);

      addObserver(raw);
      addTrigger(raw, p);

      if (isObject(value) && !proxyToRaw.has(value)) {
        if (rawToProxy.has(value)) return rawToProxy.get(value);

        return observable(value);
      }

      return value;
    },
    set(target, p, value, receiver) {
      const oldValue = Reflect.get(target, p, receiver);
      const res = Reflect.set(target, p, value, receiver);

      if (!isArray(target) && oldValue !== value) {
        effect(target, p);
      } else if (p === 'length') {
        effect(target, p);
      }

      return res;
    },
  });

  rawToProxy.set(raw, proxy);
  proxyToRaw.set(proxy, raw);

  return proxy;
}

let currentInstance = null;

const createLifecycle = name => hook =>
  currentInstance &&
  (currentInstance[name] ?? (currentInstance[name] = [])).push(hook);

const beforeMount = Symbol('beforeMount');
const mounted = Symbol('mounted');
const unmounted = Symbol('unmounted');

const onBeforeMount = createLifecycle(beforeMount);
const onMounted = createLifecycle(mounted);
const onUnmounted = createLifecycle(unmounted);

export function defineElement(name, setup) {
  const C = class extends HTMLElement {
    constructor() {
      super();

      currentInstance = this;
      this.render = setup.call(this, this);
      currentInstance = null;
    }

    connectedCallback() {
      this[beforeMount]?.forEach(hook => hook());

      observer(() => {
        this.innerHTML = this.render();
      });

      this[mounted]?.forEach(hook => hook());
    }

    disconnectedCallback() {
      this[unmounted]?.forEach(hook => hook());
    }
  };

  customElements.define(name, C);
}

// ================

defineElement('my-element', () => {
  const state = observable({ count: 0 });

  setInterval(() => {
    state.count++;
  }, 1000);

  return () => /*html*/ `<div>${state.count}</div>`;
});

const myElement = document.createElement('my-element');
document.body.appendChild(myElement);
