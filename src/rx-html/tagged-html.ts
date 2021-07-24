import {
  createWalker,
  createMarker,
  createTemplate,
  isElementNode,
  isTextNode,
  isCommentNode,
  isMarker,
  isSpreadMarker,
  getAttributeType,
  getAttributeName,
  getMarkerIndex,
} from './helper';

export type DynamicNodeType =
  | 'Attribute'
  | 'SpreadAttribute'
  | 'EventAttribute'
  | 'PropertyAttribute'
  | 'TextNode'
  | 'CommentNode';

export interface DynamicNode {
  type: DynamicNodeType;
  nodeIndex: number;
  valueIndex: number;
  attrName?: string;
}

export interface Template {
  element: HTMLTemplateElement;
  nodes: DynamicNode[];
}

export interface TemplateLiterals {
  strings: TemplateStringsArray;
  values: unknown[];
}

export const cache = new WeakMap<TemplateStringsArray, Template>();

export const html = (
  strings: TemplateStringsArray,
  ...values: any[]
): TemplateLiterals => {
  const templateLiterals: TemplateLiterals = { strings, values };
  if (cache.has(strings)) return templateLiterals;

  const tpl = strings
    .reduce<Array<string>>(
      (acc, cur, i) =>
        i < values.length ? acc.concat(cur, createMarker(i)) : acc.concat(cur),
      []
    )
    .join('');
  const template = createTemplate(tpl);
  const walker = createWalker(template.element.content);
  let nodeIndex = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (isElementNode(node)) {
      if (node.hasAttributes()) {
        for (const attrName of node.getAttributeNames()) {
          const attrValue = node.getAttribute(attrName);

          if (isMarker(attrValue)) {
            template.nodes.push({
              type: getAttributeType(attrName),
              nodeIndex,
              valueIndex: getMarkerIndex(attrValue),
              attrName: getAttributeName(attrName),
            });
            node.removeAttribute(attrName);
          } else if (isSpreadMarker(attrName)) {
            template.nodes.push({
              type: 'SpreadAttribute',
              nodeIndex,
              valueIndex: getMarkerIndex(attrName),
            });
            node.removeAttribute(attrName);
          }
        }
      }
    } else if (isTextNode(node) && isMarker(node.data)) {
      template.nodes.push({
        type: 'TextNode',
        nodeIndex,
        valueIndex: getMarkerIndex(node.data),
      });
      node.data = '';
    } else if (isCommentNode(node) && isMarker(node.data)) {
      template.nodes.push({
        type: 'CommentNode',
        nodeIndex,
        valueIndex: getMarkerIndex(node.data),
      });
      node.data = '';
    }

    nodeIndex++;
  }

  cache.set(strings, template);
  return templateLiterals;
};
