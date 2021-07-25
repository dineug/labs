import { PartOptions, MixinPart } from '@/r-html/r-part/helper';

export const BooleanAttributePart = MixinPart(
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
      this.#value = value;

      Boolean(value)
        ? this.#node.setAttribute(this.#attrName, '')
        : this.#node.removeAttribute(this.#attrName);
    }
  }
);
