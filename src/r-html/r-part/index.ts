import { DynamicNodeType } from '@/r-html/r-html';
import { PartClass } from '@/r-html/r-part/helper';
import { AttributePart } from '@/r-html/r-part/attribute.part';
import { EventAttributePart } from '@/r-html/r-part/eventAttribute.part';
import { SpreadAttributePart } from '@/r-html/r-part/spreadAttribute.part';
import { PropertyAttributePart } from '@/r-html/r-part/propertyAttribute.part';
import { BooleanAttributePart } from '@/r-html/r-part/booleanAttribute.part';
import { CommentNodePart } from '@/r-html/r-part/commentNode.part';
import { TextNodePart } from '@/r-html/r-part/textNode.part';

export const partMap: Record<DynamicNodeType, PartClass> = {
  Attribute: AttributePart,
  SpreadAttribute: SpreadAttributePart,
  EventAttribute: EventAttributePart,
  PropertyAttribute: PropertyAttributePart,
  BooleanAttribute: BooleanAttributePart,
  CommentNode: CommentNodePart,
  TextNode: TextNodePart,
};
