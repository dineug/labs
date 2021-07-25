import { isObject } from '@/r-html/helper';
import { PartOptions, MixinPart } from '@/r-html/r-part/helper';

export const SpreadAttributePart = MixinPart(
  class {
    #node: Node;
    #value: any = null;

    constructor({ node }: PartOptions) {
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
);
