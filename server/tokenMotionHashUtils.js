/**
 * Encode / decode settings for the Token Motion tool.
 * Completely separate from the BotC Sidebar hash schema.
 */
const DEFAULTS = {
  mt: 'spin',
  mw: 'hover',
  ms: 1,
  me: 'ease-in-out',
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
