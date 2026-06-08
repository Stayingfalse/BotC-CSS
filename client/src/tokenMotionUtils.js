/**
 * Client-side utilities for the Token Motion tool.
 * Completely separate from cssUtils.js (BotC Sidebar).
 *
 * Targets #app .player .token — the circular player tokens in the BotC grimoire,
 * NOT the character list in the sidebar script view.
 */

export const TOKEN_MOTION_DEFAULTS = {
  mt: 'spin',
  mw: 'hover',
  ms: 1,
  me: 'ease-in-out',
};

// ── Hash encoding ─────────────────────────────────────────────────────────────
export function buildTokenMotionHash(settings) {
  const delta = {};
  for (const [key, defaultVal] of Object.entries(TOKEN_MOTION_DEFAULTS)) {
    const val = settings[key];
    if (val !== undefined && val !== defaultVal) {
      delta[key] = val;
    }
  }
  const json = JSON.stringify(delta);
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeTokenMotionHash(hash) {
  try {
    const trimmed = String(hash).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;
    const base64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const settings = { ...TOKEN_MOTION_DEFAULTS };
    for (const [key, value] of Object.entries(parsed)) {
      if (Object.prototype.hasOwnProperty.call(TOKEN_MOTION_DEFAULTS, key)) {
        settings[key] = value;
      }
    }
    return settings;
  } catch {
    return null;
  }
}

const TOKEN_MOTION_PATH_REGEX = /\/token-motion-css\/([A-Za-z0-9_-]+)/;
const IMPORT_URL_REGEX = /@import\s+url\((?:"([^"]+)"|'([^']+)'|([^)"']+))\)/i;

function extractHashFromUrl(urlText) {
  try {
    const url = new URL(urlText);
    const pathMatch = url.pathname.match(TOKEN_MOTION_PATH_REGEX);
    return pathMatch?.[1] ?? null;
  } catch {
    const fallbackMatch = String(urlText).match(TOKEN_MOTION_PATH_REGEX);
    return fallbackMatch?.[1] ?? null;
  }
}

export function parseTokenMotionInput(input) {
  const text = String(input).trim();
  if (!text) return null;

  const importMatch = text.match(IMPORT_URL_REGEX);
  const fromImport = (importMatch?.[1] ?? importMatch?.[2] ?? importMatch?.[3] ?? '').trim();

  const fromUrl = extractHashFromUrl(fromImport || text);
  if (fromUrl) return decodeTokenMotionHash(fromUrl);

  return decodeTokenMotionHash(text);
}

// ── CSS generation ────────────────────────────────────────────────────────────

function pickNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function pickOption(value, fallback, allowed) {
  const normalised = String(value ?? '').trim();
  return allowed.includes(normalised) ? normalised : fallback;
}

function buildMotionCss({ motionType, motionWhen, motionEase, spinDuration, rockDuration, hybridDuration }) {
  if (motionWhen === 'off') return '';

  const applyWhen = (animationValue, playerFilter = '') => {
    if (motionWhen === 'hover') {
      return `#app .player${playerFilter}:hover .token {
  animation: ${animationValue};
}`;
    }

    if (motionWhen === 'not-hover') {
      return `#app .player${playerFilter}:not(:hover) .token {
  animation: ${animationValue};
}`;
    }

    // 'always'
    return `#app .player${playerFilter} .token {
  animation: ${animationValue};
}`;
  };

  if (motionType === 'random') {
    return `${applyWhen(`${spinDuration}s botcTokenSpin ${motionEase} infinite`, ':nth-child(odd)')}

${applyWhen(`${rockDuration}s botcTokenRock ${motionEase} infinite`, ':nth-child(even)')}`;
  }

  if (motionType === 'spin') {
    return applyWhen(`${spinDuration}s botcTokenSpin ${motionEase} infinite`);
  }

  if (motionType === 'rock') {
    return applyWhen(`${rockDuration}s botcTokenRock ${motionEase} infinite`);
  }

  return applyWhen(`${hybridDuration}s botcTokenHybrid ${motionEase} infinite`);
}

export function buildTokenMotionCSS(settings) {
  const {
    mt = TOKEN_MOTION_DEFAULTS.mt,
    mw = TOKEN_MOTION_DEFAULTS.mw,
    ms = TOKEN_MOTION_DEFAULTS.ms,
    me = TOKEN_MOTION_DEFAULTS.me,
  } = settings;

  const motionType  = pickOption(mt, TOKEN_MOTION_DEFAULTS.mt, ['spin', 'rock', 'hybrid', 'random']);
  const motionWhen  = pickOption(mw, TOKEN_MOTION_DEFAULTS.mw, ['off', 'always', 'hover', 'not-hover']);
  const motionEase  = pickOption(me, TOKEN_MOTION_DEFAULTS.me, ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
  const motionSpeed = pickNumber(ms, TOKEN_MOTION_DEFAULTS.ms, 0.2, 3);

  const spinDuration   = (30 / motionSpeed).toFixed(2);
  const rockDuration   = (2  / motionSpeed).toFixed(2);
  const hybridDuration = (18 / motionSpeed).toFixed(2);

  const motionCss = buildMotionCss({ motionType, motionWhen, motionEase, spinDuration, rockDuration, hybridDuration });

  return `/* ============================================================
 * BotC-CSS — Player Token Motion (Grimoire)
 * Applies animation to player tokens on the BotC online grimoire board.
 * Generated by https://github.com/Stayingfalse/BotC-CSS
 * ============================================================ */

@keyframes botcTokenSpin {
  0%   { rotate: 0deg; }
  50%  { rotate: 1046deg; }
  100% { rotate: 0deg; }
}

@keyframes botcTokenRock {
  0%   { rotate: 0deg; }
  25%  { rotate: 45deg; }
  75%  { rotate: -45deg; }
  100% { rotate: 0deg; }
}

@keyframes botcTokenHybrid {
  0%   { rotate: 0deg; }
  20%  { rotate: 210deg; }
  40%  { rotate: 480deg; }
  65%  { rotate: 340deg; }
  85%  { rotate: 560deg; }
  100% { rotate: 360deg; }
}

${motionCss}
`;
}
