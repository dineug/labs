import { isPrimitive, isNull, isUndefined, isSymbol } from '@/r-html/helper';
import { PartOptions, MixinPart } from '@/r-html/r-part/helper';

export const AttributePart = MixinPart(
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

      if (!isPrimitive(value) || isSymbol(value)) return;

      isNull(value) || isUndefined(value)
        ? this.#node.removeAttribute(this.#attrName)
        : this.#node.setAttribute(this.#attrName, String(value));
    }
  }
);
