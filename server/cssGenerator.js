/**
 * Generate the BotC sidebar CSS from a settings object.
 *
 * Settings:
 *   bg1  {string}  Gradient start colour  (default #f4e8d0)
 *   bg2  {string}  Gradient mid colour    (default #e8dcc8)
 *   bg3  {string}  Gradient end colour    (default #f4e8d0)
 *   bm   {string}  Background mode: single | gradient | preset
 *   bs   {string}  Single background colour
 *   bp   {string}  Preset background id
 *   bc   {string}  Border / divider colour (default #8b6f47)
 *   tc   {string}  Name text colour        (default #000000)
 *   ff   {string}  Font-family             (default '')
 *   fs   {number}  Name font-size (px)     (default 14)
 *   tt   {boolean} Uppercase names         (default true)
 *   ls   {number}  Letter spacing (px)     (default 0)
 *   m    {boolean} Show jagged-edge mask   (default true)
 *   io   {number}  Icon opacity (%)        (default 50)
 *   is   {number}  Icon size (px)          (default 200)
 *   mt   {string}  Motion type: spin | rock | hybrid | random
 *   mw   {string}  Motion trigger: off | always | hover | not-hover
 *   ms   {number}  Motion speed multiplier (0.2..3)
 *   me   {string}  Motion easing
 *   w    {number}  Sidebar width (px)      (default 270)
 *   pt   {number}  Top padding (px)        (default 40)
 *   pl   {number}  Left padding (px)       (default 30)
 *   bw   {number}  Border width (px)       (default 3)
 *   preview {boolean} Replace fixed with relative for iframe preview
 */
const DEFAULTS = {
  bg1: '#f4e8d0',
  bg2: '#e8dcc8',
  bg3: '#f4e8d0',
  bm: 'gradient',
  bs: '#f4e8d0',
  bp: 'parchment',
  bc: '#8b6f47',
  tc: '#000000',
  ff: '',
  fs: 14,
  tt: true,
  ls: 0,
  m: true,
  io: 50,
  is: 200,
  mt: 'spin',
  mw: 'off',
  ms: 1,
  me: 'ease-in-out',
  w: 270,
  pt: 40,
  pl: 30,
  bw: 3,
};

const BACKGROUND_PRESETS = {
  rainbow6: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 20%, #ffff00 40%, #00ff00 60%, #0000ff 80%, #8b00ff 100%)',
  pastelRainbow6: 'linear-gradient(135deg, #ffadad 0%, #ffd6a5 20%, #fdffb6 40%, #caffbf 60%, #a0c4ff 80%, #bdb2ff 100%)',
  parchment: 'linear-gradient(135deg, #f4e8d0 0%, #e8dcc8 55%, #d9c8ab 100%)',
  twilight: 'linear-gradient(135deg, #332f63 0%, #6c3f93 50%, #f18f88 100%)',
  moonlit: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #bfdbfe 100%)',
  evergreen: 'linear-gradient(135deg, #14332a 0%, #2f6f56 55%, #b7d6b0 100%)',
  emberglow: 'linear-gradient(135deg, #361500 0%, #8f250c 50%, #ffb347 100%)',
  velvet: 'linear-gradient(135deg, #240046 0%, #5a189a 55%, #ff99c8 100%)',
};

function pickHexColor(value, fallback) {
  const normalised = String(value ?? '').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalised) ? normalised : fallback;
}

function pickNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function pickBoolean(value, fallback) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return fallback;
}

function pickFontFamily(value, fallback) {
  const normalised = String(value ?? '').trim();
  if (!normalised) return '';
  return /^[a-zA-Z0-9\s'",-]+$/.test(normalised) ? normalised : fallback;
}

function pickOption(value, fallback, allowed) {
  const normalised = String(value ?? '').trim();
  return allowed.includes(normalised) ? normalised : fallback;
}

function buildMotionCss({ motionType, motionWhen, motionEase, spinDuration, rockDuration, hybridDuration }) {
  if (motionWhen === 'off') return '';

  const applyWhen = (animationValue, listFilter = '') => {
    const listSelector = `.team li${listFilter}`;
    const iconSelector = `${listSelector} .icon`;
    const nameSelector = `${listSelector} .name`;

    if (motionWhen === 'hover') {
      return `${listSelector}:hover .icon,
  ${listSelector}:hover .name {
    animation: ${animationValue} !important;
  }`;
    }

    if (motionWhen === 'not-hover') {
      return `${listSelector}:not(:hover) .icon,
  ${listSelector}:not(:hover) .name {
    animation: ${animationValue} !important;
  }`;
    }

    return `${iconSelector},
  ${nameSelector} {
    animation: ${animationValue} !important;
  }`;
  };

  if (motionType === 'random') {
    return `${applyWhen(`${rockDuration}s botcTokenRock ${motionEase} infinite`) }

  ${applyWhen(`${spinDuration}s botcTokenSpin linear infinite`, ':nth-child(even)') }`;
  }

  if (motionType === 'spin') {
    return applyWhen(`${spinDuration}s botcTokenSpin ${motionEase} infinite`);
  }

  if (motionType === 'rock') {
    return applyWhen(`${rockDuration}s botcTokenRock ${motionEase} infinite`);
  }

  return applyWhen(`${hybridDuration}s botcTokenHybrid ${motionEase} infinite`);
}

function resolveBackgroundStyle(settings) {
  const mode = settings.bm ?? DEFAULTS.bm;

  if (mode === 'single') {
    return pickHexColor(settings.bs, DEFAULTS.bs);
  }

  if (mode === 'preset') {
    return BACKGROUND_PRESETS[settings.bp] ?? BACKGROUND_PRESETS[DEFAULTS.bp];
  }

  const start = pickHexColor(settings.bg1, DEFAULTS.bg1);
  const middle = pickHexColor(settings.bg2, DEFAULTS.bg2);
  const end = pickHexColor(settings.bg3, DEFAULTS.bg3);
  return `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
}

function generateCSS(settings) {
  const {
    bg1 = '#f4e8d0',
    bg2 = '#e8dcc8',
    bg3 = '#f4e8d0',
    bm  = 'gradient',
    bs  = '#f4e8d0',
    bp  = 'parchment',
    bc  = '#8b6f47',
    tc  = '#000000',
    ff  = '',
    fs  = 14,
    tt  = true,
    ls  = 0,
    m   = true,
    io  = 50,
    is  = 200,
    mt  = 'spin',
    mw  = 'off',
    ms  = 1,
    me  = 'ease-in-out',
    w   = 270,
    pt  = 40,
    pl  = 30,
    bw  = 3,
    preview = false,
  } = settings;
  const background = resolveBackgroundStyle({ bg1, bg2, bg3, bm, bs, bp });
  const borderColor = pickHexColor(bc, DEFAULTS.bc);
  const textColor = pickHexColor(tc, DEFAULTS.tc);
  const fontFamily = pickFontFamily(ff, DEFAULTS.ff);
  const fontFamilyRule = fontFamily ? `font-family: ${fontFamily} !important;` : '';
  const positionRule   = preview ? 'position: relative !important;' : 'position: fixed !important;';
  const heightRules    = preview
    ? ''
    : `  min-height: 100vh !important;\n  max-height: 100vh !important;`;
  const fontSize = pickNumber(fs, DEFAULTS.fs, 10, 22);
  const letterSpacing = pickNumber(ls, DEFAULTS.ls, 0, 4);
  const useUppercase = pickBoolean(tt, DEFAULTS.tt);
  const showMask = pickBoolean(m, DEFAULTS.m);
  const iconOpacity = pickNumber(io, DEFAULTS.io, 0, 100) / 100;
  const iconSize = pickNumber(is, DEFAULTS.is, 120, 260);
  const motionType = pickOption(mt, DEFAULTS.mt, ['spin', 'rock', 'hybrid', 'random']);
  const motionWhen = pickOption(mw, DEFAULTS.mw, ['off', 'always', 'hover', 'not-hover']);
  const motionEase = pickOption(me, DEFAULTS.me, ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
  const motionSpeed = pickNumber(ms, DEFAULTS.ms, 0.2, 3);
  const spinDuration = (30 / motionSpeed).toFixed(2);
  const rockDuration = (2 / motionSpeed).toFixed(2);
  const hybridDuration = (18 / motionSpeed).toFixed(2);
  const motionCss = buildMotionCss({ motionType, motionWhen, motionEase, spinDuration, rockDuration, hybridDuration });
  const sidebarWidth = pickNumber(w, DEFAULTS.w, 200, 400);
  const topPadding = pickNumber(pt, DEFAULTS.pt, 0, 80);
  const leftPadding = pickNumber(pl, DEFAULTS.pl, 0, 60);
  const borderWidth = pickNumber(bw, DEFAULTS.bw, 0, 8);
  const dividerThickness = borderWidth === 0 ? 0 : Math.max(1, Math.round(borderWidth));
  const hoverIconOpacity = iconOpacity === 0 ? 0 : Math.max(0.08, Math.min(0.4, iconOpacity * 0.45));

  const clipPath = showMask
    ? `clip-path: polygon(0% 0%, 1% 0.5%, 2% 1%, 2.5% 1.2%, 3% 1.5%, 3.5% 2%, 4% 2.5%, 3.5% 3%, 4% 3.5%, 4.5% 4%, 5% 4.5%, 5.5% 5%, 6% 5.5%, 5.5% 6%, 6% 6.5%, 6.5% 7%, 7% 7.5%, 7.5% 8%, 7% 8.5%, 7.5% 9%, 6.5% 9.5%, 7% 10%, 7.5% 10.5%, 8% 11%, 7.5% 12%, 7% 12.5%, 7.5% 13%, 8% 14%, 8.5% 15%, 9% 16%, 8.5% 17%, 8% 18%, 8.5% 19%, 9% 20%, 9.5% 21%, 10% 23%, 9.5% 25%, 9% 27%, 9.5% 29%, 10% 30%, 10.5% 31%, 11% 32%, 10.5% 35%, 10% 37%, 10.5% 39%, 11% 40%, 11.5% 41%, 12% 42%, 11.5% 45%, 11% 47%, 11.5% 49%, 10.5% 50%, 10% 52%, 9.5% 54%, 9% 57%, 9.5% 59%, 8.5% 60%, 8% 62%, 7.5% 64%, 7% 67%, 7.5% 69%, 6.5% 70%, 6% 72%, 5.5% 74%, 5% 77%, 5.5% 79%, 4.5% 80%, 4% 82%, 3.5% 84%, 3% 87%, 3.5% 89%, 2.5% 90%, 2% 92%, 1.5% 94%, 1% 96%, 0.5% 98%, 0% 100%, 100% 100%, 100% 0%) !important;`
    : '';

  return `/* ============================================================
 * BotC-CSS — Stations Docked Right (Large Token Display)
 * Generated by https://github.com/Stayingfalse/BotC-CSS
 * ============================================================ */

aside.character.tab:not(.character-open):not(.positioned) {
  ${positionRule}
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: ${sidebarWidth}px !important;
${heightRules}
  display: flex !important;
  flex-direction: column !important;
  padding: ${topPadding}px 0 0 ${leftPadding}px !important;
  margin: 0 !important;
  overflow: visible !important;
  box-sizing: border-box !important;

  footer { display: none !important; }

  &::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: ${background} !important;
    border-left: ${borderWidth}px solid ${borderColor} !important;
    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.3) !important;
    z-index: -1 !important;
    ${clipPath}
  }

  .container {
    all: unset !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
    padding: 10px 5px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }

  section {
    all: unset !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }

  .team {
    all: unset !important;
    display: contents !important;

    &:not(.demon):not(.jinxes):after,
    &.jinxes:before {
      content: "" !important;
      display: block !important;
      width: 90% !important;
      height: ${dividerThickness}px !important;
      min-height: ${dividerThickness}px !important;
      margin: 8px auto !important;
      background: linear-gradient(to right, transparent, ${borderColor} 20%, ${borderColor} 80%, transparent) !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    }

    aside { display: none !important; }

    ul {
      all: unset !important;
      display: contents !important;
    }

    li {
      all: unset !important;
      display: flex !important;
      align-items: center !important;
      width: 100% !important;
      box-sizing: border-box !important;
      position: relative !important;
      overflow: visible !important;
      flex: 1 !important;
      min-height: 3.5vh !important;
      padding: 10px !important;
      transition: all 0.3s ease !important;
    }
  }

  .icon {
    display: inline-block !important;
    position: absolute !important;
    width: ${iconSize}px !important;
    height: 95% !important;
    right: 0 !important;
    bottom: 50% !important;
    background-position: 110% center !important;
    background-size: 100% !important;
    background-repeat: no-repeat !important;
    opacity: ${iconOpacity} !important;
    pointer-events: none !important;
    z-index: 0 !important;
    overflow: visible !important;
    transition: opacity 0.3s ease !important;
  }

  .almanac { display: none !important; }

  .jinx .icon { display: none !important; }

  .role {
    all: unset !important;
    display: block !important;
    width: 100% !important;
    position: static !important;
    padding-left: 5px !important;
    overflow: visible !important;
    z-index: 1 !important;
  }

  .name {
    all: unset !important;
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    font-size: ${fontSize}px !important;
    color: ${textColor} !important;
    font-weight: bold !important;
    text-transform: ${useUppercase ? 'uppercase' : 'none'} !important;
    letter-spacing: ${letterSpacing}px !important;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8) !important;
    ${fontFamilyRule}
    transition: color 0.3s ease, text-shadow 0.3s ease !important;
  }

  .label, [role="tab"] { display: none !important; }

  .ability {
    all: unset !important;
    display: none !important;
  }

  li:hover:not(.bootlegger li) {
    background: rgba(0, 0, 0, 0.85) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
    z-index: 10000 !important;
    flex: none !important;
    min-height: auto !important;
    padding-right: 15px !important;
    max-width: 100% !important;

    .ability {
      all: unset !important;
      display: block !important;
      position: static !important;
      margin-top: 6px !important;
      color: white !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      text-align: left !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      animation: fadeIn 0.3s ease !important;
    }

    .name {
      color: white !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
    }

    .icon {
      opacity: ${hoverIconOpacity} !important;
      top: 60% !important;
      bottom: auto !important;
      transform: translateY(-50%) !important;
      height: 80% !important;
    }
  }

  .bootlegger {
    ul {
      all: unset !important;
      display: flex !important;
      flex-direction: column !important;
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 10px !important;
      min-height: 35px !important;
      flex: 1 !important;
      transition: all 0.3s ease !important;
    }

    li:first-child {
      all: unset !important;
      display: block !important;
      width: 100% !important;
      position: relative !important;
      font-size: 0 !important;
      color: transparent !important;
      min-height: 35px !important;
    }

    li:not(:first-child) { display: none !important; }

    &:hover {
      ul {
        background: rgba(0, 0, 0, 0.5) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        z-index: 10000 !important;
        flex: none !important;
        min-height: auto !important;
        padding-right: 15px !important;
        max-width: 100% !important;
      }

      li {
        display: list-item !important;
        position: static !important;
        list-style-type: disc !important;
        list-style-position: inside !important;
        width: 100% !important;
        padding: 4px 0 !important;
        color: white !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        margin-left: 15px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
        max-width: calc(100% - 15px) !important;
        box-sizing: border-box !important;
        animation: fadeIn 0.3s ease !important;
        min-height: auto !important;

        .icon {
          opacity: ${iconOpacity === 0 ? 0 : Math.max(0.03, Math.min(0.12, iconOpacity * 0.25))} !important;
          top: 50% !important;
          bottom: auto !important;
          transform: translateY(-50%) !important;
          height: 80% !important;
          z-index: -1 !important;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes botcTokenSpin {
  0% { rotate: 0deg; }
  50% { rotate: 1046deg; } /* ~3 full turns, then bounce back to origin */
  100% { rotate: 0deg; }
}

@keyframes botcTokenRock {
  0% { rotate: 0deg; }
  25% { rotate: 45deg; }
  75% { rotate: -45deg; }
  100% { rotate: 0deg; }
}

@keyframes botcTokenHybrid {
  0% { rotate: 0deg; }
  20% { rotate: 210deg; }
  40% { rotate: 480deg; }
  65% { rotate: 340deg; }
  85% { rotate: 560deg; }
  100% { rotate: 360deg; }
}

${motionCss}
`;
}

module.exports = { generateCSS };
