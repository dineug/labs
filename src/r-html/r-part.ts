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
  flat,
  insertBeforeNode,
  removeNode,
} from './helper';
import { TemplateLiterals, DynamicNodeType } from './r-html';
import { createTemplateInstance } from './r-render';

export interface Part {
  valueIndex: number;
  commit(value: any): void;
}

interface ChildPart {
  templateLiterals: TemplateLiterals;
  parts: Part[];
}

export class AttributePart implements Part {
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

export class PropertyAttributePart implements Part {
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

export class BooleanAttributePart implements Part {
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

export class EventAttributePart implements Part {
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

export class SpreadAttributePart implements Part {
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

export class CommentNodePart implements Part {
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

export class TextNodePart {
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
      this.instanceNodes.forEach(removeNode);
      this.instanceNodes = [];
      this.#childParts = [];
      this.#node.data =
        isNull(value) || isUndefined(value) ? '' : String(value);
    } else if (isTemplateLiterals(value)) {
      if (this.#value?.strings !== value.strings) {
        this.instanceNodes.forEach(removeNode);
        this.instanceNodes = [];
        this.#childParts = [];

        const childPart = createChildPart(value);
        const fragment = createTemplateInstance(value, childPart.parts);
        const nodes = Array.from(fragment?.childNodes ?? []);

        if (fragment && nodes) {
          insertBeforeNode(fragment, this.#node);
          this.#childParts.push(childPart);
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
          const fragment = createTemplateInstance(data, childPart.parts);
          const nodes = Array.from(fragment?.childNodes ?? []);

          if (fragment && nodes) {
            insertBeforeNode(fragment, this.#node);
            this.instanceNodes.push(...nodes);
            this.#childParts.push(childPart);
          }
        } else if (isObject(data)) {
          // TODO 커스텀 바인딩 객체?
          if (data instanceof Node) {
            insertBeforeNode(data, this.#node);
            this.instanceNodes.push(data);
          }
        } else if (isFunction(data)) {
          // TODO 함수 바인딩?
        }
      });

      this.#childParts.forEach(({ parts, templateLiterals: { values } }) =>
        parts.forEach(part => part.commit(values[part.valueIndex]))
      );
    } else if (isObject(value)) {
      this.instanceNodes.forEach(removeNode);
      this.instanceNodes = [];
      this.#childParts = [];

      // TODO 커스텀 바인딩 객체?
      if (value instanceof Node) {
        insertBeforeNode(value, this.#node);
        this.instanceNodes.push(value);
      }
    } else if (isFunction(value)) {
      // TODO 함수 바인딩?
    }

    this.#value = value;
  }
}

export const partMap: Record<DynamicNodeType, any> = {
  Attribute: AttributePart,
  SpreadAttribute: SpreadAttributePart,
  EventAttribute: EventAttributePart,
  PropertyAttribute: PropertyAttributePart,
  BooleanAttribute: BooleanAttributePart,
  CommentNode: CommentNodePart,
  TextNode: TextNodePart,
};
