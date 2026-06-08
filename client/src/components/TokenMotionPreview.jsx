import { useMemo } from 'react';
import { buildTokenMotionCSS } from '../tokenMotionUtils';
import styles from './TokenMotionPreview.module.css';

// Representative player token data using publicly available botc.app character assets
const PREVIEW_PLAYERS = [
  { name: 'Alice',  character: 'Noble',         icon: 'https://botc.app/assets/noble_g-B0vksP8B.webp' },
  { name: 'Bob',    character: 'Fortune Teller', icon: 'https://botc.app/assets/fortuneteller_g-lQQzYvkg.webp' },
  { name: 'Carol',  character: 'Empath',         icon: 'https://botc.app/assets/empath_g-CZiCVKRj.webp' },
  { name: 'Dave',   character: 'Slayer',          icon: 'https://botc.app/assets/slayer_g-BO_75tK_.webp' },
  { name: 'Eve',    character: 'Oracle',          icon: 'https://botc.app/assets/oracle_g-HZdhcJUJ.webp' },
  { name: 'Frank',  character: 'Baron',           icon: 'https://botc.app/assets/baron_e-CH4q2C6-.webp' },
  { name: 'Grace',  character: 'Cerenovus',       icon: 'https://botc.app/assets/cerenovus_e-ARmVZpWA.webp' },
  { name: 'Henry',  character: 'No Dashii',       icon: 'https://botc.app/assets/nodashii_e-Dt8UO6rj.webp' },
  { name: 'Izzy',   character: 'Pixie',           icon: 'https://botc.app/assets/pixie_g-B1xIo6Bx.webp' },
  { name: 'Jack',   character: 'Balloonist',      icon: 'https://botc.app/assets/balloonist_g-Dlfqy_E5.webp' },
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

function renderPlayer(player) {
  return `<div class="player">
    <div class="token" style="background-image:url('${escapeHtml(player.icon)}')"></div>
    <div class="name">${escapeHtml(player.name)}</div>
  </div>`;
}

function buildPreviewHtml(css) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%;
    background: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  #app {
    width: 100%;
    padding: 20px;
  }

  #app .players {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 16px;
    justify-content: center;
    align-items: center;
  }

  #app .player {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  #app .player .token {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    background-color: #3d3d5c;
    border: 3px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }

  #app .player .name {
    font-family: sans-serif;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${css}
</style>
</head>
<body>
<div id="app">
  <div class="players">
    ${PREVIEW_PLAYERS.map(renderPlayer).join('\n    ')}
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
        <span className={styles.toolbarHint}>Previewing grimoire player tokens — hover to test</span>
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
