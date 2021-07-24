import {
  MARKER,
  SPREAD_MARKER,
  PREFIX_PROPERTY,
  PREFIX_ON_EVENT,
  PREFIX_EVENT,
} from './constants';
import { Template, TemplateLiterals, DynamicNodeType } from './tagged-html';

type typeofKey =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';

const walker = document.createTreeWalker(
  document,
  NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT + NodeFilter.SHOW_COMMENT
);

export function createWalker(node: Node) {
  walker.currentNode = node;
  return walker;
}

export const createMarker = (index: number) => `${MARKER}-${index}`;

export function createTemplate(tpl: string): Template {
  const element = document.createElement('template');
  element.innerHTML = tpl;
  return { element, nodes: [] };
}
const createIsNode =
  <T extends { nodeType: number }>(nodeType: number) =>
  (node: Node | T): node is T =>
    node.nodeType === nodeType;

const createIsMarker =
  (marker: string) =>
  (value?: string | null): value is string =>
    Boolean(value?.trimStart().startsWith(marker));

export const isElementNode = createIsNode<Element>(Node.ELEMENT_NODE);
export const isTextNode = createIsNode<Text>(Node.TEXT_NODE);
export const isCommentNode = createIsNode<Comment>(Node.COMMENT_NODE);

export const isMarker = createIsMarker(MARKER);
export const isSpreadMarker = createIsMarker(SPREAD_MARKER);
export const isPropertyMarker = createIsMarker(PREFIX_PROPERTY);
export const isEventMarker = createIsMarker(PREFIX_EVENT);
export const isOnEventMarker = createIsMarker(PREFIX_ON_EVENT);

export const isTypeof = (type: typeofKey) => (value: any) =>
  typeof value === type;

export const isBigint = isTypeof('bigint');
export const isBoolean = isTypeof('boolean');
export const isFunction = isTypeof('function');
export const isNumber = isTypeof('number');
export const isString = isTypeof('string');
export const isSymbol = isTypeof('symbol');
export const isUndefined = isTypeof('undefined');
export const isNull = (value: any) => value === null;
export const { isArray } = Array;
export const isObject = (value: any) =>
  value && isTypeof('object')(value) && !isArray(value);

export const isPrimitive = (value: any) =>
  isBigint(value) ||
  isBoolean(value) ||
  isNumber(value) ||
  isString(value) ||
  isSymbol(value) ||
  isUndefined(value);

export const isTemplateStringsArray = (
  value: any
): value is TemplateStringsArray =>
  isArray(value) && isArray((value as any).raw);

export const isTemplateLiterals = (value: any): value is TemplateLiterals =>
  isTemplateStringsArray(value.strings) && isArray(value.values);

export const getMarkerIndex = (marker: string) =>
  Number(marker.trim().split('-').pop() ?? '-1');

export const getAttributeType = (value: string): DynamicNodeType =>
  isPropertyMarker(value)
    ? 'PropertyAttribute'
    : isEventMarker(value) || isOnEventMarker(value)
    ? 'EventAttribute'
    : 'Attribute';

export const getAttributeName = (value: string) =>
  isPropertyMarker(value) || isEventMarker(value)
    ? value.substring(1)
    : isOnEventMarker(value)
    ? (value as string).substring(2)
    : value;

export const cloneNode = (node: Node) => document.importNode(node, true);
