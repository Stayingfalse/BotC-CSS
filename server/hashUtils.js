/**
 * Encode settings object to a URL-safe base64 string.
 * Only non-default values are encoded to keep the hash as short as possible.
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

function encodeSettings(settings) {
  const delta = {};
  for (const [key, defaultVal] of Object.entries(DEFAULTS)) {
    const val = settings[key];
    if (val !== undefined && val !== defaultVal) {
      delta[key] = val;
    }
  }
  const json = JSON.stringify(delta);
  // Base64url encode (URL-safe, no padding)
  return Buffer.from(json).toString('base64url');
}

function decodeSettings(hash) {
  try {
    const json = Buffer.from(hash, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

module.exports = { encodeSettings, decodeSettings, DEFAULTS };
