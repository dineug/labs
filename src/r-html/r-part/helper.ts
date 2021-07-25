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

interface CustomPartClass {
  new (options: PartOptions): CustomPart;
}

export const MixinPart = (Part: CustomPartClass): PartClass =>
  class extends Part implements Part {
    valueIndex: number;

    constructor(options: PartOptions) {
      super(options);
      this.valueIndex = options.valueIndex;
    }

    commit(value: any) {
      super.commit(value);
    }
  };
