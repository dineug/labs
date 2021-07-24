import {
  MARKER,
  SPREAD_MARKER,
  PREFIX_PROPERTY,
  PREFIX_ON_EVENT,
  PREFIX_EVENT,
  PREFIX_BOOLEAN,
  replaceMarkerRegexp,
  markerIndexRegexp,
  multiMarkerIndexRegexp,
  markerOnlyRegexp,
} from './constants';
import { Template, TemplateLiterals, DynamicNodeType } from './r-html';
import { ChildPart } from './r-render';

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

export const createChildPart = (
  templateLiterals: TemplateLiterals
): ChildPart => ({
  templateLiterals,
  parts: [],
});

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
  (marker: string, prefix: boolean = true) =>
  (value?: string | null): value is string => {
    if (prefix) return Boolean(value?.trimStart().startsWith(marker));
    const regexp = new RegExp(`${marker}`);
    return regexp.test(value ?? '');
  };

const createIsTypeof =
  <T = any>(type: typeofKey) =>
  (value: any): value is T =>
    typeof value === type;

export const isElementNode = createIsNode<Element>(Node.ELEMENT_NODE);
export const isTextNode = createIsNode<Text>(Node.TEXT_NODE);
export const isCommentNode = createIsNode<Comment>(Node.COMMENT_NODE);

export const isPrefixSpreadMarker = createIsMarker(SPREAD_MARKER);
export const isPrefixPropertyMarker = createIsMarker(PREFIX_PROPERTY);
export const isPrefixBooleanMarker = createIsMarker(PREFIX_BOOLEAN);
export const isPrefixEventMarker = createIsMarker(PREFIX_EVENT);
export const isPrefixOnEventMarker = createIsMarker(PREFIX_ON_EVENT);
export const isMarker = createIsMarker(MARKER, false);
export function isMarkerOnly(value?: string | null) {
  const marker = value?.trim();
  return marker && markerOnlyRegexp.test(marker);
}

const isObjectRaw = createIsTypeof('object');
export const isBigint = createIsTypeof<bigint>('bigint');
export const isBoolean = createIsTypeof<boolean>('boolean');
export const isFunction = createIsTypeof<Function>('function');
export const isNumber = createIsTypeof<number>('number');
export const isString = createIsTypeof<string>('string');
export const isSymbol = createIsTypeof<symbol>('symbol');
export const isUndefined = createIsTypeof<undefined>('undefined');
export const isNull = (value: any): value is null => value === null;
export const { isArray } = Array;
export const isObject = (value: any) =>
  isObjectRaw(value) && !isNull(value) && !isArray(value);

export const isPrimitive = (value: any) =>
  isBigint(value) ||
  isBoolean(value) ||
  isNumber(value) ||
  isString(value) ||
  isSymbol(value) ||
  isUndefined(value) ||
  isNull(value);

export const isTemplateStringsArray = (
  value: any
): value is TemplateStringsArray =>
  isArray(value) && isArray((value as any).raw);

export const isTemplateLiterals = (value: any): value is TemplateLiterals =>
  isTemplateStringsArray(value.strings) && isArray(value.values);

export function getMarkerIndex(value: string) {
  const match = markerIndexRegexp.exec(value);
  return match ? Number(match[1]) : -1;
}

export function getMultiMarkerIndex(value: string) {
  const indexes: number[] = [];
  let match = multiMarkerIndexRegexp.exec(value);

  while (match) {
    indexes.push(Number(match[2]));
    match = multiMarkerIndexRegexp.exec(value);
  }

  return indexes;
}

export const getAttributeType = (value: string): DynamicNodeType =>
  isPrefixPropertyMarker(value)
    ? 'PropertyAttribute'
    : isPrefixEventMarker(value) || isPrefixOnEventMarker(value)
    ? 'EventAttribute'
    : isPrefixBooleanMarker(value)
    ? 'BooleanAttribute'
    : 'Attribute';

export const getAttributeName = (value: string) =>
  isPrefixPropertyMarker(value) ||
  isPrefixEventMarker(value) ||
  isPrefixBooleanMarker(value)
    ? value.substring(1)
    : isPrefixOnEventMarker(value)
    ? (value as string).substring(2)
    : value;

export const cloneNode = (node: Node) => node.cloneNode(true);

export function* flat<T = any>(iterator: any[]): Generator<T> {
  for (const value of iterator) {
    if (value && value[Symbol.iterator]) yield* flat(value);
    else yield value;
  }
}

export function insertBeforeNode(newChild: Node, refChild: Node) {
  const parent = refChild.parentElement;
  if (!parent) return;

  parent.insertBefore(newChild, refChild);
}

export function insertAfterNode(newChild: Node, refChild: Node) {
  const parent = refChild.parentElement;
  if (!parent) return;

  refChild.nextSibling
    ? parent.insertBefore(newChild, refChild.nextSibling)
    : parent.appendChild(newChild);
}

export const removeNode = (node: Node) =>
  node.parentElement && node.parentElement.removeChild(node);

export function splitTextNode(node: Text) {
  const markers = getMultiMarkerIndex(node.data).map(index =>
    createMarker(index)
  );

  node.data
    .replace(replaceMarkerRegexp, MARKER)
    .split(MARKER)
    .reduce<Array<Text>>(
      (acc, cur, i) =>
        i < markers.length
          ? acc.concat(
              document.createTextNode(cur),
              document.createTextNode(markers[i])
            )
          : acc.concat(document.createTextNode(cur)),
      []
    )
    .filter(node => node.data !== '')
    .forEach((textNode, index) =>
      index === 0
        ? (node.data = textNode.data)
        : insertAfterNode(textNode, node)
    );
}
