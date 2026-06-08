import { useMemo } from 'react';
import { buildCSS } from '../cssUtils';
import styles from './Preview.module.css';

const MOCK_CHARACTERS = [
  {
    team: 'townsfolk',
    roles: [
      { name: 'Washerwoman', ability: 'You start knowing that 1 of 2 players is a particular Townsfolk.', tokenA: '#ead6ad', tokenB: '#a58f63' },
      { name: 'Librarian', ability: 'You start knowing that 1 of 2 players is a particular Outsider.', tokenA: '#e6d2aa', tokenB: '#8c7f57' },
      { name: 'Investigator', ability: 'You start knowing that 1 of 2 players is a particular Minion.', tokenA: '#f0d9a1', tokenB: '#947444' },
      { name: 'Chef', ability: 'You start knowing how many pairs of evil players there are.', tokenA: '#f3d8ac', tokenB: '#8f6133' },
      { name: 'Empath', ability: 'Each night, you learn how many of your 2 alive neighbors are evil.', tokenA: '#e6c99f', tokenB: '#7d5d39' },
    ],
  },
  {
    team: 'outsider',
    roles: [
      { name: 'Butler', ability: 'Each night, choose a player (not yourself). Tomorrow, you may only vote if they are voting too.', tokenA: '#b4c9b7', tokenB: '#506e54' },
      { name: 'Drunk', ability: 'You do not know you are the Drunk. You think you are a Townsfolk character, but your ability malfunctions.', tokenA: '#9eb7a0', tokenB: '#3f6147' },
    ],
  },
  {
    team: 'minion',
    roles: [
      { name: 'Poisoner', ability: 'Each night, choose a player. They are poisoned tonight and tomorrow day.', tokenA: '#d1a7b3', tokenB: '#6d3342' },
      { name: 'Spy', ability: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.', tokenA: '#c794a2', tokenB: '#5a2a36' },
    ],
  },
  {
    team: 'demon',
    roles: [
      { name: 'Imp', ability: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.', tokenA: '#d88989', tokenB: '#7a2323' },
    ],
  },
];

const MOCK_JINXES = [
  { pair: 'Empath ↔ Spy', text: 'The Empath does not learn about the Spy.' },
  { pair: 'Librarian ↔ Drunk', text: 'The Librarian may get false information while the Drunk is in play.' },
];

const JINX_TOKEN_COLORS = {
  primary: '#5f6b80',
  secondary: '#242833',
};

function escapeXml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function tokenImageDataUri(name, toneA, toneB) {
  const normalizedName = String(name ?? '').trim();
  const letters = normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const safeLetters = letters.replace(/[^A-Z0-9]/g, '') || '??';
  const primary = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(toneA ?? '').trim())
    ? String(toneA).trim()
    : '#ead6ad';
  const secondary = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(toneB ?? '').trim())
    ? String(toneB).trim()
    : '#8b6f47';

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
<defs>
<radialGradient id='g' cx='38%' cy='32%' r='68%'>
<stop offset='0%' stop-color='${primary}'/>
<stop offset='100%' stop-color='${secondary}'/>
</radialGradient>
</defs>
<circle cx='64' cy='64' r='60' fill='url(#g)' stroke='rgba(255,255,255,0.42)' stroke-width='5'/>
<text x='64' y='75' text-anchor='middle' font-family='Georgia, serif' font-size='42' font-weight='700' fill='rgba(255,255,255,0.92)'>${escapeXml(safeLetters)}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function escapeHtml(text) {
  const safeText = String(text ?? '');

  return safeText
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPreviewHtml(css, w) {
  const teamBlocks = MOCK_CHARACTERS.map(group => {
    const rows = group.roles.map(role => {
      const safeName = escapeHtml(role.name);
      const safeAbility = escapeHtml(role.ability);
      const tokenUrl = tokenImageDataUri(role.name, role.tokenA, role.tokenB);

      return `<li>
        <div class="icon" style="background-image:url('${tokenUrl}');"></div>
        <div class="role">
          <div class="name">${safeName}</div>
          <div class="ability">${safeAbility}</div>
        </div>
      </li>`;
    }).join('');

    return `<div class="team ${group.team}"><ul>${rows}</ul></div>`;
  }).join('');

  const jinxRows = MOCK_JINXES.map((jinx, index) => {
    const tokenUrl = tokenImageDataUri('JX', JINX_TOKEN_COLORS.primary, JINX_TOKEN_COLORS.secondary);
    return `<li class="jinx">
      <div class="icon" style="background-image:url('${tokenUrl}');"></div>
      <div class="role">
        <div class="name">${escapeHtml(jinx.pair)}</div>
        <div class="ability">${escapeHtml(jinx.text)}</div>
      </div>
    </li>`;
  }).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  /* Preview host reset */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%;
    background: #2a2a3a;
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
  }

  /* Scope override: un-fix positioning for the preview */
  aside.character.tab:not(.character-open):not(.positioned) {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    height: 100% !important;
    min-height: 100% !important;
    max-height: 100% !important;
  }

  ${css}
</style>
</head>
<body>
<aside class="character tab" style="width:${w}px; flex-shrink:0;">
  <div class="container">
    <section>
      ${teamBlocks}
      <div class="team jinxes">
        <ul>${jinxRows}</ul>
      </div>
    </section>
  </div>
</aside>
</body>
</html>`;
}

export default function Preview({ settings }) {
  const css = useMemo(() => buildCSS(settings), [settings]);

  const srcDoc = useMemo(
    () => buildPreviewHtml(css, settings.w ?? 270),
    [css, settings.w]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Live Preview</span>
        <span className={styles.toolbarHint}>Hover over a character name to see ability text</span>
      </div>
      <div className={styles.stage}>
        <iframe
          className={styles.frame}
          srcDoc={srcDoc}
          title="BotC sidebar preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
