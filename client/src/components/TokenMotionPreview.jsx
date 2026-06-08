import { useMemo } from 'react';
import { buildTokenMotionCSS } from '../tokenMotionUtils';
import styles from './TokenMotionPreview.module.css';

// 6 players matching the BotC grim circle HTML: <ul><li></li>×6</ul>
// Uses publicly available botc.app character assets
const PREVIEW_PLAYERS = [
  { name: 'Alice',  character: 'Noble',          roleId: 'noble',         team: 'townsfolk', icon: 'https://botc.app/assets/noble_g-B0vksP8B.webp' },
  { name: 'Bob',    character: 'Fortune Teller',  roleId: 'fortuneteller', team: 'townsfolk', icon: 'https://botc.app/assets/fortuneteller_g-lQQzYvkg.webp' },
  { name: 'Carol',  character: 'Philosopher',     roleId: 'philosopher',   team: 'townsfolk', icon: 'https://botc.app/assets/philosopher_g-DOk3eWqe.webp' },
  { name: 'Dave',   character: 'Baron',           roleId: 'baron',         team: 'minion',    icon: 'https://botc.app/assets/baron_e-CH4q2C6-.webp' },
  { name: 'Eve',    character: 'Cerenovus',       roleId: 'cerenovus',     team: 'minion',    icon: 'https://botc.app/assets/cerenovus_e-ARmVZpWA.webp' },
  { name: 'Frank',  character: 'No Dashii',       roleId: 'nodashii',      team: 'demon',     icon: 'https://botc.app/assets/nodashii_e-Dt8UO6rj.webp' },
];

function escapeHtml(text) {
  const safeText = String(text ?? '');
  return safeText
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderPlayer(player, index) {
  return `<li>
    <div class="player ${escapeHtml(player.team)}">
      <div class="life"></div>
      <div class="token ${escapeHtml(player.roleId)}">
        <span class="icon" style="background-image:url('${escapeHtml(player.icon)}')"></span>
        <span class="leaf-left"></span>
        <span class="leaf-right"></span>
        <svg viewBox="0 0 150 150" class="name">
          <path d="M 13 75 C 13 160, 138 160, 138 75" id="curve${index}" fill="transparent"/>
          <text width="150" x="66.6%" text-anchor="middle" class="label mozilla" font-size="110%">
            <textPath href="#curve${index}">${escapeHtml(player.character)}</textPath>
          </text>
        </svg>
        <div class="edition edition-tb ${escapeHtml(player.team)}"></div>
      </div>
      <div class="name"><span>${escapeHtml(player.name)}</span></div>
    </div>
  </li>`;
}

function buildPreviewHtml(css) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://botc.app/assets/index-CQDkN3zl.css">
<style>
  ${css}
</style>
</head>
<body>
<div id="app">
  <div id="townsquare" class="square">
    <ul class="circle size-6">
      ${PREVIEW_PLAYERS.map((p, i) => renderPlayer(p, i)).join('\n      ')}
    </ul>
  </div>
</div>
</body>
</html>`;
}

export default function TokenMotionPreview({ settings }) {
  const css = useMemo(() => buildTokenMotionCSS(settings), [settings]);
  const srcDoc = useMemo(() => buildPreviewHtml(css), [css]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Live Preview</span>
        <span className={styles.toolbarHint}>Previewing the official grimoire DOM structure — hover to test</span>
      </div>
      <div className={styles.stage}>
        <iframe
          className={styles.frame}
          srcDoc={srcDoc}
          title="BotC player token motion preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
