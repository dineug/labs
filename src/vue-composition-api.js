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

      this.innerHTML = this.render();

      this[mounted]?.forEach(hook => hook());
    }

    disconnectedCallback() {
      this[unmounted]?.forEach(hook => hook());
    }
  };

  customElements.define(name, C);
}

// ================

function useMyHook() {
  onBeforeMount(() => {
    console.log('useMyHook onBeforeMount');
  });

  onMounted(() => {
    console.log('useMyHook onMounted');
  });
}

defineElement('my-element', () => {
  const a = 'test';
  useMyHook();

  console.log('my-element created');

  onBeforeMount(() => {
    console.log('my-element onBeforeMount1');
  });

  onBeforeMount(() => {
    console.log('my-element onBeforeMount2');
  });

  onMounted(() => {
    console.log('my-element onMounted');
  });

  onUnmounted(() => {
    console.log('my-element onUnmounted');
  });

  return () => /*html*/ `<div>${a}</div>`;
});

const myElement = document.createElement('my-element');
document.body.appendChild(myElement);
document.body.removeChild(myElement);
