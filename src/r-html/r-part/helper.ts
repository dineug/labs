import { TemplateLiterals } from '@/r-html/r-html';

export interface Part {
  valueIndex: number;
  commit(value: any): void;
}

export interface PartOptions {
  valueIndex: number;
  node: Node;
  attrName?: string;
}

export interface PartClass {
  new (options: PartOptions): Part;
}

export interface ChildPart {
  templateLiterals: TemplateLiterals;
  parts: Part[];
}

interface CustomPart {
  commit(value: any): void;
}

export interface CustomPartOptions {
  node: Node;
  attrName: string;
}

interface CustomPartClass {
  new (options: CustomPartOptions): CustomPart;
}

export const MixinPart = (Part: CustomPartClass): PartClass =>
  class extends Part implements Part {
    valueIndex: number;

    constructor({ node, valueIndex, attrName }: PartOptions) {
      super({
        attrName: attrName ?? 'not-found-attribute-name',
        node,
      });
      this.valueIndex = valueIndex;
    }

    commit(value: any) {
      super.commit(value);
    }
  };
