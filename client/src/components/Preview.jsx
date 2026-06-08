import { useMemo } from 'react';
import { buildCSS } from '../cssUtils';
import styles from './Preview.module.css';

const MOCK_CHARACTERS = [
  { team: 'townsfolk', names: ['Washerwoman', 'Librarian', 'Investigator', 'Chef', 'Empath'] },
  { team: 'outsider',  names: ['Butler', 'Drunk'] },
  { team: 'minion',    names: ['Poisoner', 'Spy'] },
  { team: 'demon',     names: ['Imp'] },
];

function buildPreviewHtml(css, w) {
  const rows = MOCK_CHARACTERS.flatMap(group =>
    group.names.map(name => `
      <li>
        <div class="role">
          <div class="name">${name}</div>
          <div class="ability">A sample ability text for ${name}. Hover to reveal.</div>
        </div>
      </li>`).join('')
  ).join('');

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
      <div class="team townsfolk">
        <ul>
          <li><div class="role"><div class="name">Washerwoman</div><div class="ability">You start knowing that 1 of 2 players is a particular Townsfolk.</div></div></li>
          <li><div class="role"><div class="name">Librarian</div><div class="ability">You start knowing that 1 of 2 players is a particular Outsider.</div></div></li>
          <li><div class="role"><div class="name">Investigator</div><div class="ability">You start knowing that 1 of 2 players is a particular Minion.</div></div></li>
          <li><div class="role"><div class="name">Chef</div><div class="ability">You start knowing how many pairs of evil players there are.</div></div></li>
          <li><div class="role"><div class="name">Empath</div><div class="ability">Each night, you learn how many of your 2 alive neighbors are evil.</div></div></li>
        </ul>
      </div>
      <div class="team outsider">
        <ul>
          <li><div class="role"><div class="name">Butler</div><div class="ability">Each night, choose a player (not yourself). Tomorrow, you may only vote if they are voting too.</div></div></li>
          <li><div class="role"><div class="name">Drunk</div><div class="ability">You do not know you are the Drunk. You think you are a Townsfolk character, but your ability malfunctions.</div></div></li>
        </ul>
      </div>
      <div class="team minion">
        <ul>
          <li><div class="role"><div class="name">Poisoner</div><div class="ability">Each night, choose a player. They are poisoned tonight and tomorrow day.</div></div></li>
          <li><div class="role"><div class="name">Spy</div><div class="ability">Each night, you see the Grimoire. You might register as good &amp; as a Townsfolk or Outsider, even if dead.</div></div></li>
        </ul>
      </div>
      <div class="team demon">
        <ul>
          <li><div class="role"><div class="name">Imp</div><div class="ability">Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.</div></div></li>
        </ul>
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
