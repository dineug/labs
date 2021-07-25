import { isFunction } from '@/r-html/helper';
import { PartOptions, MixinPart } from '@/r-html/r-part/helper';

export const EventAttributePart = MixinPart(
  class {
    #node: Element;
    #value: any = null;
    #attrName: string;

    constructor({ node, attrName = 'none' }: PartOptions) {
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
);
