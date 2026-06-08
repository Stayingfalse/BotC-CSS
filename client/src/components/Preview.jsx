import { useMemo } from 'react';
import { buildCSS } from '../cssUtils';
import styles from './Preview.module.css';

const PREVIEW_TITLE = 'Boozling by Lau';
const PREVIEW_HINT = '*Not the first night';

const PREVIEW_TEAMS = [
  {
    className: 'townsfolk',
    label: 'Townsfolk',
    roles: [
      { className: 'role-noble', icon: 'https://botc.app/assets/noble_g-B0vksP8B.webp', name: 'Noble', ability: 'You start knowing 3 players, 1 of which is evil.' },
      { className: 'role-pixie', icon: 'https://botc.app/assets/pixie_g-B1xIo6Bx.webp', name: 'Pixie', ability: 'You start knowing 1 in-play Townsfolk...' },
      { className: 'role-highpriestess', icon: 'https://botc.app/assets/highpriestess_g-D0i0Myk4.webp', name: 'High Priestess', ability: 'Each night, learn who you should talk to.' },
      { className: 'role-balloonist', icon: 'https://botc.app/assets/balloonist_g-Dlfqy_E5.webp', name: 'Balloonist', ability: 'Each night, learn a player of a new character type.' },
      { className: 'role-fortuneteller', icon: 'https://botc.app/assets/fortuneteller_g-lQQzYvkg.webp', name: 'Fortune Teller', ability: 'Choose 2 players: learn if either is a Demon.' },
      { className: 'role-oracle', icon: 'https://botc.app/assets/oracle_g-HZdhcJUJ.webp', name: 'Oracle', ability: 'Each night*, learn how many dead players are evil.' },
      { className: 'role-savant', icon: 'https://botc.app/assets/savant_g-n6x1YgAZ.webp', name: 'Savant', ability: 'Each day, learn 1 true & 1 false statement.' },
      { className: 'role-philosopher', icon: 'https://botc.app/assets/philosopher_g-DOk3eWqe.webp', name: 'Philosopher', ability: 'Once per game, gain a good ability; they become drunk.' },
      { className: 'role-huntsman', icon: 'https://botc.app/assets/huntsman_g-1Nv97uqA.webp', name: 'Huntsman', ability: 'Once per game, choose a living player: if Damsel, rescue.' },
      { className: 'role-fisherman', icon: 'https://botc.app/assets/fisherman_g-D4SVpSql.webp', name: 'Fisherman', ability: 'Once per game, get advice from the Storyteller.' },
      { className: 'role-slayer', icon: 'https://botc.app/assets/slayer_g-BO_75tK_.webp', name: 'Slayer', ability: 'Once per game, choose a player: if Demon, they die.' },
      { className: 'role-sage', icon: 'https://botc.app/assets/sage_g-BQUVfu9h.webp', name: 'Sage', ability: 'If Demon kills you, learn it is 1 of 2 players.' },
      { className: 'role-cannibal', icon: 'https://botc.app/assets/cannibal_g-eP3mwaD2.webp', name: 'Cannibal', ability: 'You gain the ability of the executed player.' },
    ],
  },
  {
    className: 'outsider',
    label: 'Outsiders',
    roles: [
      { className: 'role-drunk', icon: 'https://botc.app/assets/drunk_g--QNmv0ZY.webp', name: 'Drunk', ability: 'You think you are a Townsfolk, but you are not.' },
      { className: 'role-mutant', icon: 'https://botc.app/assets/mutant_g-CUe36x-i.webp', name: 'Mutant', ability: 'If you are mad about being an Outsider, you might be executed.' },
      { className: 'role-damsel', icon: 'https://botc.app/assets/damsel_g-NwMWC09c.webp', name: 'Damsel', ability: 'Minions know a Damsel is in play; if guessed, good loses.' },
      { className: 'role-klutz', icon: 'https://botc.app/assets/klutz_g-DRcV_Rgl.webp', name: 'Klutz', ability: 'When you die, choose an alive player: if evil, good loses.' },
      { className: 'role-golem', icon: 'https://botc.app/assets/golem_g-HC-xAVh8.webp', name: 'Golem', ability: 'You may nominate once; if not Demon, they die.' },
    ],
  },
  {
    className: 'minion',
    label: 'Minions',
    roles: [
      { className: 'role-baron', icon: 'https://botc.app/assets/baron_e-CH4q2C6-.webp', name: 'Baron', ability: '+2 Outsiders.' },
      { className: 'role-cerenovus', icon: 'https://botc.app/assets/cerenovus_e-ARmVZpWA.webp', name: 'Cerenovus', ability: 'Each night, choose a player & a good character: they are mad.' },
      { className: 'role-scarletwoman', icon: 'https://botc.app/assets/scarletwoman_e-BP5Fv_Ne.webp', name: 'Scarlet Woman', ability: 'If Demon dies with 5+ alive, you become the Demon.' },
      { className: 'role-marionette', icon: 'https://botc.app/assets/marionette_e-BVmqAITW.webp', name: 'Marionette', ability: 'You think you are good; Demon knows you; you neighbor Demon.' },
    ],
  },
  {
    className: 'demon',
    label: 'Demons',
    roles: [
      { className: 'role-nodashii', icon: 'https://botc.app/assets/nodashii_e-Dt8UO6rj.webp', name: 'No Dashii', ability: 'Each night*, choose a player to die; neighbors are poisoned.' },
    ],
  },
];

const PREVIEW_JINXES = [
  {
    className: 'jinx-scarletwoman-fanggu',
    icons: [
      'https://botc.app/assets/scarletwoman_e-BP5Fv_Ne.webp',
      'https://botc.app/assets/fanggu_e-6DavSWxL.webp',
    ],
    name: 'Scarlet Woman & Fang Gu',
    ability: 'If both would become Demon, Scarlet Woman stays a Minion.',
  },
  {
    className: 'jinx-marionette-balloonist',
    icons: [
      'https://botc.app/assets/marionette_e-BVmqAITW.webp',
      'https://botc.app/assets/balloonist_g-Dlfqy_E5.webp',
    ],
    name: 'Marionette & Balloonist',
    ability: 'If Marionette thinks they are Balloonist, an Outsider may be added.',
  },
  {
    className: 'jinx-marionette-huntsman',
    icons: [
      'https://botc.app/assets/marionette_e-BVmqAITW.webp',
      'https://botc.app/assets/huntsman_g-1Nv97uqA.webp',
    ],
    name: 'Marionette & Huntsman',
    ability: 'If Marionette thinks they are Huntsman, the Damsel is added.',
  },
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

function renderRole(role) {
  return `<li class="${escapeHtml(role.className)}">
    <span class="icon" style="background-image:url('${escapeHtml(role.icon)}')"></span>
    <div class="name">${escapeHtml(role.name)}</div>
    <span class="ability">${escapeHtml(role.ability)}</span>
  </li>`;
}

function renderTeam(team) {
  return `<div class="team ${escapeHtml(team.className)}">
    <aside>${escapeHtml(team.label)}</aside>
    <ul>
      ${team.roles.map(renderRole).join('')}
    </ul>
  </div>`;
}

function renderJinx(jinx) {
  return `<li class="${escapeHtml(jinx.className)}">
    ${jinx.icons.map(icon => `<span class="icon" style="background-image:url('${escapeHtml(icon)}')"></span>`).join('')}
    <div class="name">${escapeHtml(jinx.name)}</div>
    <span class="ability">${escapeHtml(jinx.ability)}</span>
  </li>`;
}

function buildPreviewHtml(css, w) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    height: 100%;
    background: #2a2a3a;
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
  }

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
  <div class="label">Characters</div>
  <div class="container" id="tab-character">
    <section>
      <div class="title">${escapeHtml(PREVIEW_TITLE)}</div>
      ${PREVIEW_TEAMS.map(renderTeam).join('')}
      <div class="team jinxes">
        <aside>Jinxes</aside>
        <ul>
          ${PREVIEW_JINXES.map(renderJinx).join('')}
        </ul>
      </div>
      <div class="hint">${escapeHtml(PREVIEW_HINT)}</div>
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
        <span className={styles.toolbarHint}>Previewing the official sidebar DOM structure</span>
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
