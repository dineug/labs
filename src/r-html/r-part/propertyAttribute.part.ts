import { PartOptions, MixinPart } from '@/r-html/r-part/helper';

export const PropertyAttributePart = MixinPart(
  class {
    #node: Node;
    #value: any = null;
    #attrName: string;

    constructor({ node, attrName = 'none' }: PartOptions) {
      this.#node = node;
      this.#attrName = attrName;
    }

    commit(value: any) {
      if (this.#value === value) return;
      this.#value = value;

      Reflect.set(this.#node, this.#attrName, value, this.#node);
    }
  }
);
