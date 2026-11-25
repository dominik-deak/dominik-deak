// Builds the README's SVGs (dark + light) into dist/. Node standard library only, no network.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 840;
const CHAR = 0.6; // JetBrains Mono advance width per 1px of font size

const palettes = {
  dark: { well: '#03060a', panel: '#0a1219', border: '#12303a', linkBorder: '#1d4a57', text: '#cfe9f0', strong: '#f0fdff', muted: '#6f97a3', accent: '#00f0ff', green: '#39ff88' },
  light: { well: '#fbfdfd', panel: '#f3f8f9', border: '#cfe0e4', linkBorder: '#9cc4cc', text: '#1f2328', strong: '#0b1215', muted: '#57707a', accent: '#007c8c', green: '#137a42' },
};

export function uptime(now = new Date()) {
  const months = (now.getUTCFullYear() - 2022) * 12 + (now.getUTCMonth() - 4) - (now.getUTCDate() < 9 ? 1 : 0);
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textWidth = (s, size) => s.length * size * CHAR;

const font = (weight) => readFileSync(join(root, 'assets/fonts', `JetBrainsMono-${weight}.subset.woff2`)).toString('base64');
const fontCss = `@font-face{font-family:JBM;font-weight:400;src:url(data:font/woff2;base64,${font('Regular')}) format('woff2')}@font-face{font-family:JBM;font-weight:700;src:url(data:font/woff2;base64,${font('Bold')}) format('woff2')}text{font-family:JBM,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}`;

const svg = (w, h, title, body, extraCss = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t"><title id="t">${esc(title)}</title><style>${fontCss}${extraCss}</style>${body}</svg>\n`;

function header(p, up) {
  const H = 290;
  const frame = `M0.5 0.5H${W - 18.5}L${W - 0.5} 18.5V${H - 0.5}H0.5Z`;
  const name = 'Dominik Deak';
  const cursorX = 28 + textWidth(name, 52) - name.length + 10;
  const label = 'UPTIME';
  const labelW = textWidth(label, 13) + 5 * 1.8 + 20;
  const valueW = textWidth(up, 13) + 24;
  return svg(W, H, `Dominik Deak, software engineer: AI agents, LLMs and RAG, full-stack TypeScript. Uptime ${up}.`, `
<defs><clipPath id="f"><path d="${frame}"/></clipPath><pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${p.accent}" stroke-opacity=".06"/></pattern></defs>
<g clip-path="url(#f)"><rect width="${W}" height="${H}" fill="${p.well}"/><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="43" fill="${p.panel}"/><path d="M0 43.5H${W}" stroke="${p.border}"/></g>
<path d="${frame}" fill="none" stroke="${p.accent}" stroke-opacity=".4"/>
<text x="28" y="27" font-size="12" fill="${p.muted}">dominik@github:~</text>
<circle cx="${W - 92}" cy="23" r="3" fill="${p.green}"/><text x="${W - 82}" y="27" font-size="12" fill="${p.muted}">online</text>
<text x="28" y="88" font-size="14" fill="${p.muted}"><tspan fill="${p.accent}">~ $</tspan> whoami</text>
<text x="28" y="150" font-size="52" font-weight="700" letter-spacing="-1" fill="${p.strong}">${name}</text>
<rect class="cur" x="${cursorX}" y="112" width="10" height="40" fill="${p.accent}"/>
<text x="28" y="196" font-size="15" fill="${p.text}">Software engineer <tspan fill="${p.accent}">·</tspan> AI agents, LLMs &amp; RAG <tspan fill="${p.accent}">·</tspan> full-stack TypeScript</text>
<rect x="28.5" y="222.5" width="${labelW + valueW}" height="30" rx="4" fill="none" stroke="${p.green}" stroke-opacity=".4"/>
<path d="M${28.5 + labelW} 222.5V252.5" stroke="${p.green}" stroke-opacity=".4"/>
<text x="38" y="242" font-size="13" letter-spacing="1.8" fill="${p.muted}">${label}</text>
<text x="${28 + labelW + 12}" y="242" font-size="13" font-weight="700" fill="${p.green}">${esc(up)}</text>`,
    '@keyframes b{50%{opacity:0}}.cur{animation:b 1.1s step-end infinite}@media (prefers-reduced-motion:reduce){.cur{animation:none}}');
}

function link(p, label) {
  const w = 272, h = 48;
  return svg(w, h, label, `
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="${p.panel}" stroke="${p.linkBorder}"/>
<text x="16" y="29" font-size="13" letter-spacing=".5" fill="${p.accent}">${esc(label)}</text>
<text x="${w - 28}" y="29" font-size="13" fill="${p.muted}">↗</text>`);
}

function section(p, num, cmd, arg, title) {
  const h = 28, size = 15;
  const cmdX = 12 * CHAR * 2 + 12;
  const full = `~ $ ${cmd} ${arg}`;
  const lineX = cmdX + textWidth(full, size) + 12;
  return svg(W, h, title, `
<text x="0" y="19" font-size="12" fill="${p.muted}">${num}</text>
<text x="${cmdX}" y="19" font-size="${size}" fill="${p.strong}"><tspan fill="${p.accent}">~ $</tspan> ${esc(cmd)} <tspan fill="${p.green}">${esc(arg)}</tspan></text>
<path d="M${lineX} 14.5H${W}" stroke="${p.border}"/>`);
}

const icons = {
  agents: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.2 8.2l3.6 7.6M16.8 8.2l-3.6 7.6"/>',
  llms: '<path d="M4 4.5h16v11.5H9.5L4 20.5z" stroke-linejoin="round"/><path d="M8 9h8M8 12.5h5"/>',
  rag: '<g stroke-linecap="round"><ellipse cx="10" cy="5.5" rx="7" ry="2.5"/><path d="M3 5.5v11c0 1.4 3.1 2.5 7 2.5M17 5.5v5M3 11c0 1.4 3.1 2.5 7 2.5"/><circle cx="17" cy="16" r="3"/><path d="M19.2 18.2l2.3 2.3"/></g>',
  react: '<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  node: '<path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z" stroke-linejoin="round"/><path d="M9 15V9l6 6V9"/>',
  aws: '<path d="M7 17h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 8.2 4.5 4.5 0 0 0 7 17z" stroke-linejoin="round"/><path d="M6 20.5c3.5 1.6 8.5 1.6 12 0"/>',
  ts: '<rect x=".75" y=".75" width="22.5" height="22.5" rx="3"/><text x="21" y="21" font-size="9" font-weight="700" text-anchor="end" fill="currentColor" stroke="none">TS</text>',
};

function stack(p) {
  const groups = [
    ['ai', [['AI Agents', 'orchestration', 'agents'], ['LLMs', 'models', 'llms'], ['RAG', 'retrieval', 'rag']]],
    ['platform', [['JS/TS', 'languages', 'ts'], ['React', 'ui', 'react'], ['Node.js', 'runtime', 'node'], ['AWS', 'cloud', 'aws']]],
  ];
  const gap = 12, chipH = 70;
  let y = 0, body = '';
  for (const [label, chips] of groups) {
    body += `<text x="0" y="${y + 12}" font-size="11" letter-spacing="1.8" fill="${p.muted}">${label.toUpperCase()}</text>`;
    y += 22;
    const cw = (W - gap * (chips.length - 1)) / chips.length;
    chips.forEach(([name, desc, icon], i) => {
      const x = i * (cw + gap);
      body += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cw - 1}" height="${chipH - 1}" rx="6" fill="${p.panel}" stroke="${p.border}"/>`
        + `<g transform="translate(${x + 18} ${y + 23})" fill="none" stroke="${p.green}" stroke-width="1.5" color="${p.green}">${icons[icon]}</g>`
        + `<text x="${x + 56}" y="${y + 32}" font-size="14" fill="${p.strong}">${esc(name)}</text>`
        + `<text x="${x + 56}" y="${y + 50}" font-size="11" fill="${p.muted}">${esc(desc)}</text>`;
    });
    y += chipH + 18;
  }
  return svg(W, y - 18, 'Stack. AI: AI Agents, LLMs, RAG. Platform: JS/TS, React, Node.js, AWS.', body);
}

export const aboutLines = [
  'Software engineer focused on AI agents, LLMs and RAG, on a full-stack TypeScript foundation.',
  'Building agents and retrieval pipelines on top of LLMs, and using AI-assisted workflows to ship faster.',
  'Full-stack across the JavaScript/TypeScript ecosystem: React on the front end, Node.js services behind it, AWS underneath.',
  'Always learning. Happy to talk shop with engineers, mentors and fellow tinkerers.',
];

export function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > maxChars) { lines.push(line); line = word; } else line = line ? line + ' ' + word : word;
  }
  return [...lines, line];
}

function about(p) {
  const size = 15, lineH = 24, indent = 24;
  const maxChars = Math.floor((W - indent) / (size * CHAR));
  let y = 0, body = '';
  for (const item of aboutLines) {
    const rows = wrap(item, maxChars);
    // Triangle marker drawn as a path: the subset font has no ▸ glyph.
    body += `<path d="M2 ${y + 10}l7 4.5-7 4.5z" fill="${p.accent}" fill-opacity=".7"/>`;
    rows.forEach((row, i) => { body += `<text x="${indent}" y="${y + 19 + i * lineH}" font-size="${size}" fill="${p.text}">${esc(row)}</text>`; });
    y += rows.length * lineH + 10;
  }
  return svg(W, y - 10 + 6, aboutLines.join(' '), body);
}

function footer(p) {
  return svg(W, 24, '~ $ exit', `<text x="${W / 2}" y="17" font-size="13" text-anchor="middle" fill="${p.muted}"><tspan fill="${p.accent}">~ $</tspan> exit</text>`);
}

export function build(outDir = join(root, 'dist'), now = new Date()) {
  const up = uptime(now);
  for (const [theme, p] of Object.entries(palettes)) {
    const dir = join(outDir, theme);
    mkdirSync(dir, { recursive: true });
    const files = {
      'header.svg': header(p, up),
      'link-linkedin.svg': link(p, 'LinkedIn'),
      'link-portfolio.svg': link(p, 'Portfolio'),
      'link-codewars.svg': link(p, 'Codewars'),
      'section-01.svg': section(p, '01', 'ls', '~/stack', 'Stack'),
      'section-02.svg': section(p, '02', 'cat', 'about.md', 'About'),
      'section-03.svg': section(p, '03', 'git log', '--stats', 'GitHub stats'),
      'section-04.svg': section(p, '04', './snake', '--graph contributions', 'Contribution snake'),
      'stack.svg': stack(p),
      'about.svg': about(p),
      'footer.svg': footer(p),
    };
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  }
  return up;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`built dist/ (uptime ${build()})`);
}
