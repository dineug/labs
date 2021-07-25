import { isPrimitive, isNull, isUndefined, isSymbol } from '@/r-html/helper';
import { CustomPartOptions, MixinPart } from '@/r-html/r-part/helper';

export const CommentNodePart = MixinPart(
  class {
    #node: Comment;
    #value: any = null;

    constructor({ node }: CustomPartOptions) {
      this.#node = node as Comment;
    }

    commit(value: any) {
      if (this.#value === value) return;
      this.#value = value;

      if (!isPrimitive(value) || isSymbol(value)) return;

      this.#node.data =
        isNull(value) || isUndefined(value) ? '' : String(value);
    }
  }
);
