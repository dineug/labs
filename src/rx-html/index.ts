import { createWalker, cloneNode } from './helper';
import { TemplateLiterals, DynamicNodeType, html, cache } from './tagged-html';

const { log } = console;

interface Part {
  type: DynamicNodeType;
  attrName?: string;
  node: Node;
  value: unknown;
  parts: Part[];

  commit(value: any): void;
}

function _render({ strings, values }: TemplateLiterals) {
  const template = cache.get(strings);

  if (template) {
    const instance = cloneNode(template.element.content);
    const walker = createWalker(instance);
    const nodes: Node[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      nodes.push(node);
    }

    for (const node of template.nodes) {
      if (node.type === 'TextNode') {
        const currentNode = nodes[node.nodeIndex];
        const parent = currentNode.parentElement;

        if (parent) {
          const value = values[node.valueIndex];

          if (Array.isArray(value)) {
            value.forEach(v => {
              const currentInstance = _render(v as any);
              currentInstance &&
                parent.insertBefore(currentInstance, currentNode);
            });
          } else if (typeof value === 'object') {
            const currentInstance = _render(value as any);
            currentInstance &&
              parent.insertBefore(currentInstance, currentNode);
          } else {
            (currentNode as Text).data = String(value);
          }
        }
      } else if (node.type === 'CommentNode') {
        const currentNode = nodes[node.nodeIndex];
        const value = values[node.valueIndex];
        (currentNode as Comment).data = String(value);
      }
    }

    return instance;
  }
}

function render(
  templateLiterals: TemplateLiterals,
  container: Element | ShadowRoot
) {
  // receiver
  console.log(templateLiterals);

  const instance = _render(templateLiterals);
  if (instance) {
    container.appendChild(instance);
  }
}

// ============================================

let a = 1;
let b = () => {};
let d = [1, 2, 3];
let e = true;
let f = { a: 1, b: 2, c: 3 };

const testTpl = (a: any, b: any, d: any, e: any, f: any) => html`
  <div id="${a}" .test=" ${a}" ...${f} @click="${b}" onclick=${b}>
    <span id="123">${a}</span>
    <span test="asdf">1</span>
    <span test="${a}">2</span>
    <ul>
      <li>test</li>
      ${d.map((data: any) => html`<li>${data}</li>`)}
      <li>test2</li>
    </ul>
    ${e ? html`<div aaa="${a}">true</div>` : html`<div>false</div>`}
    <!-- ${a} -->
    <!-- test -->
  </div>
  <div>test</div>
`;

const container = document.createElement('div');
render(testTpl(a, b, d, e, f), container);

// setTimeout(() => {
//   render(testTpl(5, b, d, e, f), container);
// }, 5000);
document.body.appendChild(container);
