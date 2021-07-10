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
    } else if (
      (node.nodeType === 3 || node.nodeType === 8) &&
      node.data.trimStart().startsWith('$lit-maker-')
    ) {
      console.log(
        `${node.nodeType === 3 ? 'TextNode' : 'CommentNode'} =>`,
        node.data
      );
    }
  }
};

const a = 1;
const b = () => {};
const d = [1, 2, 3];
const e = true;

html`
  <div id="${a}" @click="${b}">
    <span>${a}</span>
    <span>1</span>
    <span test="${a}">2</span>
    <ul>
      ${d.map(data => html`<li>${data}</li>`)}
    </ul>
    ${e ? html`<div aaa="${a}">true</div>` : html`<div>false</div>`}
    <!-- ${a} -->
  </div>
`;
