import { createWalker, cloneNode, removeNode } from './helper';
import { TemplateLiterals, html, templateCache } from './r-html';
import { Part, partMap } from './r-part';

type Container = Element | ShadowRoot;

interface TemplateInstance {
  strings: TemplateStringsArray;
  parts: Part[];
}

const renderCache = new WeakMap<Container, TemplateInstance>();

export function createTemplateInstance(
  { strings, values }: TemplateLiterals,
  parts: Part[]
): DocumentFragment | null {
  !templateCache.has(strings) && html(strings, values);
  const template = templateCache.get(strings);
  if (!template) return null;

  console.log(template);

  const fragment = cloneNode(template.element.content) as DocumentFragment;
  const walker = createWalker(fragment);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  template.nodes.forEach(node =>
    parts.push(
      new partMap[node.type](
        nodes[node.nodeIndex],
        node.valueIndex,
        node.attrName
      )
    )
  );

  return fragment;
}

export function render(
  templateLiterals: TemplateLiterals,
  container: Container
) {
  const { strings, values } = templateLiterals;
  const oldTemplateInstance = renderCache.get(container);
  const isRecommit =
    oldTemplateInstance && oldTemplateInstance.strings === strings;

  if (isRecommit && oldTemplateInstance) {
    const { parts } = oldTemplateInstance;

    parts.forEach(part => part.commit(values[part.valueIndex]));
  } else {
    const parts: Part[] = [];
    const fragment = createTemplateInstance(templateLiterals, parts);

    console.log(parts);

    if (fragment) {
      parts.forEach(part => part.commit(values[part.valueIndex]));
      renderCache.set(container, { strings, parts });
      container.childNodes.forEach(removeNode);
      container.appendChild(fragment);
    }
  }
}
