const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const rateLimit = require('express-rate-limit');

const { generateCSS }            = require('./cssGenerator');
const { encodeSettings, decodeSettings, DEFAULTS } = require('./hashUtils');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Rate limiting ────────────────────────────────────────────────────────────
// CSS generation and API endpoints — generous for normal use, blocks abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(cors());
app.use(express.json());

// ── CSS endpoint (for @import) ───────────────────────────────────────────────
// GET /css/:hash  — decode hash → generate CSS → return as text/css
app.get('/css/:hash', apiLimiter, (req, res) => {
  const settings = decodeSettings(req.params.hash);
  const css = generateCSS(settings);
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(css);
});

// ── API endpoints ────────────────────────────────────────────────────────────
// POST /api/encode  — body: settings obj → { hash, importUrl, css }
app.post('/api/encode', apiLimiter, (req, res) => {
  const settings = { ...DEFAULTS, ...req.body };
  const hash = encodeSettings(settings);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const importUrl = `${baseUrl}/css/${hash}`;
  const css = generateCSS(settings);
  res.json({ hash, importUrl, css });
});

// GET /api/decode/:hash  — hash → settings
app.get('/api/decode/:hash', apiLimiter, (req, res) => {
  const settings = decodeSettings(req.params.hash);
  res.json(settings);
});

// GET /api/defaults  — return default settings
app.get('/api/defaults', (_req, res) => {
  res.json(DEFAULTS);
});

// ── Serve React client (production build) ───────────────────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA catch-all — any unmatched route serves index.html
app.use((_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`BotC-CSS server running on http://localhost:${PORT}`);
});
