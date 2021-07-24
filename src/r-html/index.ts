import { html } from './r-html';
import { render } from './r-render';

// ============================================

// ${d.map((data: any) => html`<li>${data}</li>`)}

const testTpl = (a: any, b: any, d: any, e: any, f: any) =>
  html`
    <div
      id="${a}"
      .test=" ${a}"
      ...${f}
      @click="${b}"
      onclick=${b}
      ?readonly=${e}
    >
      <span id="123">${a}</span>
      <span test="asdf">1</span>
      <span test="${a}">2</span>
      <ul>
        <li>test-start</li>

        <li>test-end</li>
      </ul>
      ${html`
        <div>
          ${e ? html`<div aaa="${a}">true</div>` : html`<div>false</div>`}
        </div>
        <div>${a}</div>
        ${a}
      `}
      <div>${a} 가운데 ${a} 마커일 경우</div>
      <div>가운데 ${a} 마커가 ${a}${a} 두개 이상일 경우 ${a}</div>
      <!-- ${a} -->
      <!-- test -->
    </div>
    <div>test</div>
  `;

let a = 1;
let b = () => console.log('click');
let d = ['1', '2', '3'];
let e = true;
let f = { a: 1, b: 2, c: 3 };

const container = document.createElement('div');
render(testTpl(a, b, d, e, f), container);

setInterval(() => {
  a++;
  d = [
    Math.random().toString(),
    Math.random().toString(),
    Math.random().toString(),
  ];
  render(testTpl(a, b, d, e, f), container);
}, 1000);
document.body.appendChild(container);
