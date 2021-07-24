import {
  createChildPart,
  isPrimitive,
  isNull,
  isUndefined,
  isSymbol,
  isFunction,
  isObject,
  isArray,
  isTemplateLiterals,
  createWalker,
  flat,
  cloneNode,
  insertBeforeNode,
  removeNode,
} from './helper';
import {
  TemplateLiterals,
  DynamicNodeType,
  html,
  templateCache,
} from './r-html';

type Container = Element | ShadowRoot;

interface Part {
  valueIndex: number;
  commit(value: any): void;
}

export interface ChildPart {
  templateLiterals: TemplateLiterals;
  parts: Part[];
}

interface RenderInstance {
  strings: TemplateStringsArray;
  parts: Part[];
}

const renderCache = new WeakMap<Element | ShadowRoot, RenderInstance>();

class AttributePart implements Part {
  valueIndex: number;
  #node: Element;
  #value: any = null;
  #attrName: string;

  constructor(node: Node, valueIndex: number, attrName: string) {
    this.valueIndex = valueIndex;
    this.#node = node as Element;
    this.#attrName = attrName;
  }

  commit(value: any) {
    if (this.#value === value) return;
    this.#value = value;

    if (!isPrimitive(value) || isSymbol(value)) return;

    isNull(value) || isUndefined(value)
      ? this.#node.removeAttribute(this.#attrName)
      : this.#node.setAttribute(this.#attrName, String(value));
  }
}

class PropertyAttributePart implements Part {
  valueIndex: number;
  #node: Node;
  #value: any = null;
  #attrName: string;

  constructor(node: Node, valueIndex: number, attrName: string) {
    this.valueIndex = valueIndex;
    this.#node = node;
    this.#attrName = attrName;
  }

  commit(value: any) {
    if (this.#value === value) return;
    this.#value = value;

    Reflect.set(this.#node, this.#attrName, value, this.#node);
  }
}

class BooleanAttributePart implements Part {
  valueIndex: number;
  #node: Element;
  #value: any = null;
  #attrName: string;

  constructor(node: Node, valueIndex: number, attrName: string) {
    this.valueIndex = valueIndex;
    this.#node = node as Element;
    this.#attrName = attrName;
  }

  commit(value: any) {
    if (this.#value === value) return;
    this.#value = value;

    Boolean(value)
      ? this.#node.setAttribute(this.#attrName, '')
      : this.#node.removeAttribute(this.#attrName);
  }
}

class EventAttributePart implements Part {
  valueIndex: number;
  #node: Element;
  #value: any = null;
  #attrName: string;

  constructor(node: Node, valueIndex: number, attrName: string) {
    this.valueIndex = valueIndex;
    this.#node = node as Element;
    this.#attrName = attrName;
  }

  commit(value: any) {
    if (this.#value === value) return;

    isFunction(this.#value) &&
      this.#node.removeEventListener(this.#attrName, this.#value);
    isFunction(value) && this.#node.addEventListener(this.#attrName, value);

    this.#value = value;
  }
}

class SpreadAttributePart implements Part {
  valueIndex: number;
  #node: Node;
  #value: any = null;

  constructor(node: Node, valueIndex: number) {
    this.valueIndex = valueIndex;
    this.#node = node;
  }

  commit(value: any) {
    if (this.#value === value) return;
    this.#value = value;

    isObject(value) &&
      Object.keys(value).forEach(key =>
        Reflect.set(this.#node, key, value[key], this.#node)
      );
  }
}

class CommentNodePart implements Part {
  valueIndex: number;
  #node: Comment;
  #value: any = null;

  constructor(node: Node, valueIndex: number) {
    this.valueIndex = valueIndex;
    this.#node = node as Comment;
  }

  commit(value: any) {
    if (this.#value === value) return;
    this.#value = value;

    if (!isPrimitive(value) || isSymbol(value)) return;

    this.#node.data = isNull(value) || isUndefined(value) ? '' : String(value);
  }
}

class TextNodePart {
  valueIndex: number;
  #node: Text;
  #value: any = null;
  #childParts: ChildPart[] = [];
  instanceNodes: Node[] = [];

  constructor(node: Node, valueIndex: number) {
    this.valueIndex = valueIndex;
    this.#node = node as Text;
  }

  commit(value: any) {
    if (this.#value === value) return;

    if (isPrimitive(value)) {
      this.#node.data =
        isNull(value) || isUndefined(value) ? '' : String(value);
    } else if (isTemplateLiterals(value)) {
      if (this.#value?.strings !== value.strings) {
        const childPart = createChildPart(value);
        const fragment = _render(value, childPart.parts);
        const nodes = Array.from(fragment?.childNodes ?? []);

        if (fragment && nodes) {
          insertBeforeNode(fragment, this.#node);
          this.#childParts = [];
          this.#childParts.push(childPart);
          this.instanceNodes.forEach(removeNode);
          this.instanceNodes = [];
          this.instanceNodes.push(...nodes);
        }
      }

      this.#childParts.forEach(({ parts }) =>
        parts.forEach(part => part.commit(value.values[part.valueIndex]))
      );
    } else if (isArray(value)) {
      const list = [...flat(value)];
      this.instanceNodes.forEach(removeNode);
      this.instanceNodes = [];
      this.#childParts = [];

      list.forEach(data => {
        if (isPrimitive(data)) {
          const node = document.createTextNode(
            isNull(data) || isUndefined(data) ? '' : String(data)
          );

          insertBeforeNode(node, this.#node);
          this.instanceNodes.push(node);
        } else if (isTemplateLiterals(data)) {
          const childPart = createChildPart(data);
          const fragment = _render(data, childPart.parts);
          const nodes = Array.from(fragment?.childNodes ?? []);

          if (fragment && nodes) {
            insertBeforeNode(fragment, this.#node);
            this.instanceNodes.push(...nodes);
            this.#childParts.push(childPart);
          }
        } else if (isObject(data)) {
          // TODO 커스텀 바인딩 객체?
        }
      });

      this.#childParts.forEach(({ parts, templateLiterals: { values } }) =>
        parts.forEach(part => part.commit(values[part.valueIndex]))
      );
    } else if (isObject(value)) {
      // TODO 커스텀 바인딩 객체?
    }

    this.#value = value;
  }
}

const partMap: Record<DynamicNodeType, any> = {
  Attribute: AttributePart,
  SpreadAttribute: SpreadAttributePart,
  EventAttribute: EventAttributePart,
  PropertyAttribute: PropertyAttributePart,
  BooleanAttribute: BooleanAttributePart,
  CommentNode: CommentNodePart,
  TextNode: TextNodePart,
};

function _render(
  { strings, values }: TemplateLiterals,
  parts: Part[]
): DocumentFragment | null {
  !templateCache.has(strings) && html(strings, values);
  const template = templateCache.get(strings);
  if (!template) return null;

  console.log(template);

  const fragment = cloneNode(template.element.content) as DocumentFragment;
  const walker = createWalker(fragment);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  template.nodes.forEach(node =>
    parts.push(
      new partMap[node.type](
        nodes[node.nodeIndex],
        node.valueIndex,
        node.attrName
      )
    )
  );

  return fragment;
}

export function render(
  templateLiterals: TemplateLiterals,
  container: Container
) {
  const { strings, values } = templateLiterals;
  const oldRenderInstance = renderCache.get(container);
  const isRecommit = oldRenderInstance && oldRenderInstance.strings === strings;

  if (isRecommit && oldRenderInstance) {
    const { parts } = oldRenderInstance;
    parts.forEach(part => part.commit(values[part.valueIndex]));
  } else {
    const parts: Part[] = [];
    const fragment = _render(templateLiterals, parts);

    console.log(parts);

    if (fragment) {
      parts.forEach(part => part.commit(values[part.valueIndex]));
      renderCache.set(container, { strings, parts });
      container.childNodes.forEach(removeNode);
      container.appendChild(fragment);
    }
  }
}
