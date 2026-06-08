import { useMemo } from 'react';
import { buildCSS } from '../cssUtils';
import styles from './Preview.module.css';

const PREVIEW_HINT = '*Not the first night';

const PREVIEW_TEAMS = [
  {
    className: 'townsfolk',
    label: 'Townsfolk',
    roles: [
      { classes: ['team-townsfolk', 'role-noble'], icon: 'https://botc.app/assets/noble_g-B0vksP8B.webp', name: 'Noble', ability: 'You start knowing 3 players, 1 and only 1 of which is evil.' },
      { classes: ['team-townsfolk', 'role-pixie'], icon: 'https://botc.app/assets/pixie_g-B1xIo6Bx.webp', name: 'Pixie', ability: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.' },
      { classes: ['team-townsfolk', 'role-highpriestess'], icon: 'https://botc.app/assets/highpriestess_g-D0i0Myk4.webp', name: 'High Priestess', ability: 'Each night, learn which player the Storyteller believes you should talk to most.' },
      { classes: ['team-townsfolk', 'role-balloonist'], icon: 'https://botc.app/assets/balloonist_g-Dlfqy_E5.webp', name: 'Balloonist', ability: 'Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider]' },
      { classes: ['team-townsfolk', 'role-fortuneteller'], icon: 'https://botc.app/assets/fortuneteller_g-lQQzYvkg.webp', name: 'Fortune Teller', ability: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.' },
      { classes: ['team-townsfolk', 'role-oracle'], icon: 'https://botc.app/assets/oracle_g-HZdhcJUJ.webp', name: 'Oracle', ability: 'Each night*, you learn how many dead players are evil.' },
      { classes: ['team-townsfolk', 'role-savant'], icon: 'https://botc.app/assets/savant_g-n6x1YgAZ.webp', name: 'Savant', ability: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.' },
      { classes: ['team-townsfolk', 'role-philosopher', 'second'], icon: 'https://botc.app/assets/philosopher_g-DOk3eWqe.webp', name: 'Philosopher', ability: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.' },
      { classes: ['team-townsfolk', 'role-huntsman', 'second'], icon: 'https://botc.app/assets/huntsman_g-1Nv97uqA.webp', name: 'Huntsman', ability: 'Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]' },
      { classes: ['team-townsfolk', 'role-fisherman', 'second'], icon: 'https://botc.app/assets/fisherman_g-D4SVpSql.webp', name: 'Fisherman', ability: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.' },
      { classes: ['team-townsfolk', 'role-slayer', 'second'], icon: 'https://botc.app/assets/slayer_g-BO_75tK_.webp', name: 'Slayer', ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.' },
      { classes: ['team-townsfolk', 'role-sage', 'second'], icon: 'https://botc.app/assets/sage_g-BQUVfu9h.webp', name: 'Sage', ability: 'If the Demon kills you, you learn that it is 1 of 2 players.' },
      { classes: ['team-townsfolk', 'role-cannibal', 'second'], icon: 'https://botc.app/assets/cannibal_g-eP3mwaD2.webp', name: 'Cannibal', ability: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.' },
    ],
  },
  {
    className: 'outsider',
    label: 'Outsiders',
    roles: [
      { classes: ['team-outsider', 'role-drunk'], icon: 'https://botc.app/assets/drunk_g--QNmv0ZY.webp', name: 'Drunk', ability: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.' },
      { classes: ['team-outsider', 'role-mutant'], icon: 'https://botc.app/assets/mutant_g-CUe36x-i.webp', name: 'Mutant', ability: 'If you are “mad” about being an Outsider, you might be executed.' },
      { classes: ['team-outsider', 'role-damsel'], icon: 'https://botc.app/assets/damsel_g-NwMWC09c.webp', name: 'Damsel', ability: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.' },
      { classes: ['team-outsider', 'role-klutz', 'second'], icon: 'https://botc.app/assets/klutz_g-DRcV_Rgl.webp', name: 'Klutz', ability: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.' },
      { classes: ['team-outsider', 'role-golem', 'second'], icon: 'https://botc.app/assets/golem_g-HC-xAVh8.webp', name: 'Golem', ability: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.' },
    ],
  },
  {
    className: 'minion',
    label: 'Minions',
    roles: [
      { classes: ['team-minion', 'role-baron'], icon: 'https://botc.app/assets/baron_e-CH4q2C6-.webp', name: 'Baron', ability: 'There are extra Outsiders in play. [+2 Outsiders]' },
      { classes: ['team-minion', 'role-cerenovus'], icon: 'https://botc.app/assets/cerenovus_e-ARmVZpWA.webp', name: 'Cerenovus', ability: 'Each night, choose a player & a good character: they are “mad” they are this character tomorrow, or might be executed.' },
      { classes: ['team-minion', 'role-scarletwoman', 'second'], icon: 'https://botc.app/assets/scarletwoman_e-BP5Fv_Ne.webp', name: 'Scarlet Woman', ability: "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)" },
      { classes: ['team-minion', 'role-marionette', 'second'], icon: 'https://botc.app/assets/marionette_e-BVmqAITW.webp', name: 'Marionette', ability: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]' },
    ],
  },
  {
    className: 'demon',
    label: 'Demons',
    roles: [
      { classes: ['team-demon', 'role-nodashii'], icon: 'https://botc.app/assets/nodashii_e-Dt8UO6rj.webp', name: 'No Dashii', ability: 'Each night*, choose a player to die. The 2 players neighboring you are poisoned.' },
    ],
  },
];

const PREVIEW_JINXES = [
  {
    icons: [
      'https://botc.app/assets/scarletwoman_e-BP5Fv_Ne.webp',
      'https://botc.app/assets/fanggu_e-6DavSWxL.webp',
    ],
    name: 'Scarlet Woman & Fang Gu',
    ability: 'If both would be Demons, Scarlet Woman remains a Minion.',
  },
  {
    icons: [
      'https://botc.app/assets/marionette_e-BVmqAITW.webp',
      'https://botc.app/assets/balloonist_g-Dlfqy_E5.webp',
    ],
    name: 'Marionette & Balloonist',
    ability: 'If the Marionette thinks they are the Balloonist, Outsider count may change.',
  },
  {
    icons: [
      'https://botc.app/assets/marionette_e-BVmqAITW.webp',
      'https://botc.app/assets/huntsman_g-1Nv97uqA.webp',
    ],
    name: 'Marionette & Huntsman',
    ability: 'If the Marionette thinks they are the Huntsman, the Damsel is added.',
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
  return `<li class="${escapeHtml(role.classes.join(' '))}">
    <span class="icon" style="background-image:url('${escapeHtml(role.icon)}')"></span>
    <div class="name" title="${escapeHtml(role.name)}">${escapeHtml(role.name)}</div>
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
  return `<li class="jinx">
    ${jinx.icons.map(icon => `<span class="icon" style="background-image:url('${escapeHtml(icon)}')"></span>`).join('')}
    <div class="name">${escapeHtml(jinx.name)}</div>
    <span class="ability">${escapeHtml(jinx.ability)}</span>
  </li>`;
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
<aside class="character tab">
  <div class="label" role="tab">Characters</div>
  <div class="container" role="tabpanel" id="tab-character" tabindex="-1">
    <section>
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
    () => buildPreviewHtml(css),
    [css]
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
