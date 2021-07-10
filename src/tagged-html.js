export const html = (arr, ...values) => {
  const tpl = arr
    .reduce(
      (acc, cur, i) =>
        acc.concat(cur, i !== values.length ? `$lit-maker-${i}` : ''),
      []
    )
    .join('');

  console.log(tpl);

  const template = document.createElement('div');
  template.innerHTML = tpl;

  const walker = document.createTreeWalker(
    template,
    133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,
    null,
    false
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node.nodeType === 1) {
      console.log('Element =>', node);

      if (node.hasAttributes()) {
        for (const name of node.getAttributeNames()) {
          console.log('Attribute =>', name, node.getAttribute(name));
        }
      }
    } else if (node.nodeType === 3 && node.data.startsWith('$lit-maker-')) {
      console.log('TextNode =>', node.data);
    }
  }
};

const a = 1;
const b = 2;
const c = () => {};

html`
  <div id="${b}" @click="${c}">
    <span>${a}</span>
    <span>1</span>
    <span test="${b}">2</span>
  </div>
`;
