import {
  createWalker,
  cloneNode,
  isArray,
  isObject,
  isPrimitive,
  isTemplateLiterals,
  flat,
  insertBefore,
} from './helper';
import { TemplateLiterals, DynamicNode, html, cache } from './tagged-html';

const { log } = console;

interface ChildPart {
  templateLiterals: TemplateLiterals;
  parts: Part[];
}

class Part {
  dynamicNode: DynamicNode;
  node: Node;
  value: unknown;
  childParts: ChildPart[] = [];

  constructor(dynamicNode: DynamicNode, node: Node) {
    this.dynamicNode = dynamicNode;
    this.node = node;
  }

  commit(value: any) {
    if (this.value === value) return;
    this.value = value;

    if (this.dynamicNode.type === 'TextNode') {
      const parent = this.node.parentElement;

      if (parent) {
        if (isArray(value)) {
          const arr = [...flat(value)];
          arr.forEach(v => {
            if (isTemplateLiterals(v)) {
              const childPart = {
                templateLiterals: v,
                parts: [],
              };
              const currentInstance = _render(v as any, childPart.parts);
              if (currentInstance) {
                insertBefore(currentInstance, this.node);
                this.childParts.push(childPart);
              }
            } else if (isPrimitive(v)) {
              const currentInstance = document.createTextNode(v);
              insertBefore(currentInstance, this.node);
            } else if (isObject(v)) {
              // TODO 커스텀 바인딩 객체?
            }
          });
        } else if (isTemplateLiterals(value)) {
          const childPart = {
            templateLiterals: value,
            parts: [],
          };
          const currentInstance = _render(value, childPart.parts);
          if (currentInstance) {
            insertBefore(currentInstance, this.node);
            this.childParts.push(childPart);
          }
        } else if (isPrimitive(value)) {
          (this.node as Text).data = String(value);
        } else if (isObject(value)) {
          // TODO 커스텀 바인딩 객체?
        }
      }
    } else if (this.dynamicNode.type === 'CommentNode') {
      (this.node as Comment).data = String(value);
    }

    this.childParts.forEach(childPart =>
      childPart.parts.forEach(part =>
        part.commit(
          childPart.templateLiterals.values[part.dynamicNode.valueIndex]
        )
      )
    );
  }
}

function _render({ strings, values }: TemplateLiterals, parts: Part[]) {
  !cache.has(strings) && html(strings, values);
  const template = cache.get(strings);

  if (template) {
    console.log(template);

    const instance = cloneNode(template.element.content);
    const walker = createWalker(instance);
    const nodes: Node[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      nodes.push(node);
    }

    for (const node of template.nodes) {
      parts.push(new Part(node, nodes[node.nodeIndex]));
    }

    return instance;
  }
}

function render(
  templateLiterals: TemplateLiterals,
  container: Element | ShadowRoot
) {
  // receiver

  const parts: Part[] = [];
  const instance = _render(templateLiterals, parts);
  if (instance) {
    const { values } = templateLiterals;
    parts.forEach(part => part.commit(values[part.dynamicNode.valueIndex]));
    container.appendChild(instance);
  }
}

// ============================================

let a = 1;
let b = () => {};
let d = [1, 2, [4, [{ a: 1, b: 2 }], 6], 3];
let e = true;
let f = { a: 1, b: 2, c: 3 };

const testTpl = (a: any, b: any, d: any, e: any, f: any) =>
  html`
    <div
      id="${a}"
      .test=" ${a}"
      ...${f}
      @click="${b}"
      onclick=${b}
      ?readonly=${e}
    >
      <span id="123">${a}</span>
      <span test="asdf">1</span>
      <span test="${a}">2</span>
      <ul>
        <li>test-start</li>
        ${d.map((data: any) => html`<li>${data}</li>`)}
        <li>test-end</li>
      </ul>
      ${e ? html`<div aaa="${a}">true</div>` : html`<div>false</div>`}
      <div>${a} 가운데 ${a} 마커일 경우</div>
      <div>가운데 ${a} 마커가 ${a}${a} 두개 이상일 경우 ${a}</div>
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
