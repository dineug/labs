import {
  createChildPart,
  isPrimitive,
  isNull,
  isUndefined,
  isFunction,
  isObject,
  isArray,
  isTemplateLiterals,
  flat,
  insertBeforeNode,
  removeNode,
} from '@/r-html/helper';
import { createTemplateInstance } from '@/r-html/r-render';
import {
  CustomPartOptions,
  ChildPart,
  MixinPart,
} from '@/r-html/r-part/helper';

export const TextNodePart = MixinPart(
  class {
    #node: Text;
    #value: any = null;
    #childParts: ChildPart[] = [];
    instanceNodes: Node[] = [];

    constructor({ node }: CustomPartOptions) {
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
);
