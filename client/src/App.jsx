import { useState, useCallback, useEffect } from 'react';
import ColorControl        from './components/ColorControl';
import ToggleControl       from './components/ToggleControl';
import SelectControl       from './components/SelectControl';
import RangeControl        from './components/RangeControl';
import Preview             from './components/Preview';
import TokenMotionPreview  from './components/TokenMotionPreview';
import ShareUrl            from './components/ShareUrl';
import { DEFAULTS, BACKGROUND_PRESETS, resolveBackgroundStyle } from './cssUtils';
import { TOKEN_MOTION_DEFAULTS, buildTokenMotionHash, buildTokenMotionCSS, parseTokenMotionInput } from './tokenMotionUtils';
import styles from './App.module.css';

// ── Sidebar control options ────────────────────────────────────────────────────
const FONT_OPTIONS = [
  { value: '',                  label: 'Default (inherit)' },
  { value: 'Georgia, serif',    label: 'Georgia' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: "'Palatino Linotype', Palatino, serif", label: 'Palatino' },
  { value: 'Garamond, serif',   label: 'Garamond' },
  { value: "'Book Antiqua', Palatino, serif", label: 'Book Antiqua' },
  { value: "'Cinzel', serif",   label: 'Cinzel (decorative)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'MedievalSharp', fantasy", label: 'Fantasy' },
];

const BACKGROUND_MODE_OPTIONS = [
  { value: 'single',   label: 'Single colour' },
  { value: 'gradient', label: '3 custom colours' },
  { value: 'preset',   label: 'Preset gradient' },
];

// ── Token motion control options ───────────────────────────────────────────────
const MOTION_TYPE_OPTIONS = [
  { value: 'spin',   label: 'Spin' },
  { value: 'rock',   label: 'Rock' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'random', label: 'Random (mixed)' },
];

const MOTION_WHEN_OPTIONS = [
  { value: 'off',       label: 'Off' },
  { value: 'always',    label: 'Always' },
  { value: 'hover',     label: 'On hover' },
  { value: 'not-hover', label: 'When not hovered' },
];

const MOTION_EASE_OPTIONS = [
  { value: 'linear',      label: 'Linear' },
  { value: 'ease',        label: 'Ease' },
  { value: 'ease-in',     label: 'Ease in' },
  { value: 'ease-out',    label: 'Ease out' },
  { value: 'ease-in-out', label: 'Ease in/out' },
];

// ── Script gallery entries ─────────────────────────────────────────────────────
const SCRIPT_GALLERY = [
  {
    id: 'botc-sidebar',
    icon: '🧙',
    name: 'BotC Sidebar',
    description: 'Customize the Blood on the Clocktower sidebar CSS with live preview and shareable imports.',
    status: 'Available now',
  },
  {
    id: 'token-motion',
    icon: '🌀',
    name: 'Player Token Motion',
    description: 'Add spin, rock, hybrid, or random animation to player tokens on the grimoire board.',
    status: 'Available now',
  },
  {
    id: 'coming-soon-1',
    icon: '🧪',
    name: 'Character Sheet Theme',
    description: 'Planned style pack for character sheet and notes screens.',
    status: 'Coming soon',
    disabled: true,
  },
  {
    id: 'coming-soon-2',
    icon: '🎭',
    name: 'Storyteller Tools',
    description: 'Planned style pack for storyteller panels and controls.',
    status: 'Coming soon',
    disabled: true,
  },
];

// ── Storage keys (one per tool) ────────────────────────────────────────────────
const SIDEBAR_STORAGE_KEY = 'botc-css-sidebar-settings';
const MOTION_STORAGE_KEY  = 'botc-css-token-motion-settings';

// ── URL routing ────────────────────────────────────────────────────────────────
const HOME_ROUTE = '/';

function normalisePathname(pathname) {
  const normalised = `/${String(pathname ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '')}`;
  return normalised === '/' ? HOME_ROUTE : normalised;
}

function resolveRoute(pathname) {
  const route = normalisePathname(pathname);
  if (route === '/botc-sidebar')   return { selectedScript: 'botc-sidebar',  activeTab: 'colors',  pathname: route };
  if (route === '/token-motion')   return { selectedScript: 'token-motion',  activeTab: 'motion',  pathname: route };
  return { selectedScript: null, activeTab: 'colors', pathname: HOME_ROUTE };
}

function resolveScriptRoute(scriptId) {
  if (scriptId === 'botc-sidebar') return { selectedScript: 'botc-sidebar', activeTab: 'colors', pathname: '/botc-sidebar' };
  if (scriptId === 'token-motion') return { selectedScript: 'token-motion', activeTab: 'motion', pathname: '/token-motion' };
  return { selectedScript: null, activeTab: 'colors', pathname: HOME_ROUTE };
}

// ── Settings helpers ───────────────────────────────────────────────────────────
function normaliseSidebarSettings(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { ...DEFAULTS };
  const next = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (candidate[key] !== undefined) next[key] = candidate[key];
  }
  return next;
}

function normaliseMotionSettings(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { ...TOKEN_MOTION_DEFAULTS };
  const next = { ...TOKEN_MOTION_DEFAULTS };
  for (const key of Object.keys(TOKEN_MOTION_DEFAULTS)) {
    if (candidate[key] !== undefined) next[key] = candidate[key];
  }
  return next;
}

function readStoredSettings(storageKey, normalise, defaults) {
  if (typeof window === 'undefined') return { ...defaults };
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return { ...defaults };
    return normalise(JSON.parse(stored));
  } catch {
    return { ...defaults };
  }
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const initialRoute = typeof window === 'undefined'
    ? resolveRoute(HOME_ROUTE)
    : resolveRoute(window.location.pathname);

  // Sidebar tool state
  const [sidebarSettings, setSidebarSettings] = useState(
    () => readStoredSettings(SIDEBAR_STORAGE_KEY, normaliseSidebarSettings, DEFAULTS)
  );
  const [activeTab, setActiveTab] = useState(initialRoute.activeTab);

  // Token motion tool state
  const [motionSettings, setMotionSettings] = useState(
    () => readStoredSettings(MOTION_STORAGE_KEY, normaliseMotionSettings, TOKEN_MOTION_DEFAULTS)
  );

  // Navigation
  const [selectedScript, setSelectedScript] = useState(initialRoute.selectedScript);

  // ── Sidebar callbacks ────────────────────────────────────────────────────────
  const updateSidebar = useCallback((key, value) => {
    setSidebarSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSidebar = useCallback(() => {
    setSidebarSettings({ ...DEFAULTS });
  }, []);

  const loadSidebarSettings = useCallback((nextSettings) => {
    setSidebarSettings(normaliseSidebarSettings(nextSettings));
  }, []);

  const chooseBackgroundMode = useCallback((mode) => {
    setSidebarSettings(prev => ({ ...prev, bm: mode }));
  }, []);

  const applyPreset = useCallback((presetId) => {
    setSidebarSettings(prev => ({ ...prev, bm: 'preset', bp: presetId }));
  }, []);

  // ── Token motion callbacks ───────────────────────────────────────────────────
  const updateMotion = useCallback((key, value) => {
    setMotionSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetMotion = useCallback(() => {
    setMotionSettings({ ...TOKEN_MOTION_DEFAULTS });
  }, []);

  const loadMotionSettings = useCallback((nextSettings) => {
    setMotionSettings(normaliseMotionSettings(nextSettings));
  }, []);

  // ── URL navigation ───────────────────────────────────────────────────────────
  const navigateToScript = useCallback((scriptId, { pushHistory = true } = {}) => {
    const route = resolveScriptRoute(scriptId);
    setSelectedScript(route.selectedScript);
    setActiveTab(route.activeTab);

    if (!pushHistory || typeof window === 'undefined') return;
    const currentPath = normalisePathname(window.location.pathname);
    if (currentPath !== route.pathname) {
      window.history.pushState({}, '', route.pathname);
    }
  }, []);

  // ── Persist settings to localStorage ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebarSettings)); } catch { /* ignore */ }
  }, [sidebarSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(MOTION_STORAGE_KEY, JSON.stringify(motionSettings)); } catch { /* ignore */ }
  }, [motionSettings]);

  // ── Browser back / forward ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handlePopState = () => {
      const route = resolveRoute(window.location.pathname);
      setSelectedScript(route.selectedScript);
      setActiveTab(route.activeTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const backgroundPreview = resolveBackgroundStyle(sidebarSettings);

  // ── Gallery view ─────────────────────────────────────────────────────────────
  if (!selectedScript) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logoArea}>
              <span className={styles.logoIcon}>🧙</span>
              <div>
                <h1 className={styles.title}>BotC-CSS Script Gallery</h1>
                <p className={styles.subtitle}>Pick a script to launch its customizer.</p>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.galleryMain}>
          <section className={styles.galleryIntro}>
            <h2>Choose a CSS script</h2>
            <p>This homepage is ready for multiple style scripts as the collection grows.</p>
          </section>

          <div className={styles.galleryGrid}>
            {SCRIPT_GALLERY.map(script => (
              <article key={script.id} className={`${styles.galleryCard} ${script.disabled ? styles.galleryCardDisabled : ''}`}>
                <div className={styles.galleryIcon}>{script.icon}</div>
                <h3>{script.name}</h3>
                <p>{script.description}</p>
                <div className={styles.galleryFooter}>
                  <span className={styles.galleryStatus}>{script.status}</span>
                  <button
                    type="button"
                    disabled={script.disabled}
                    className={styles.launchBtn}
                    onClick={() => navigateToScript(script.id)}
                  >
                    {script.disabled ? 'Soon' : 'Open customizer'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className={styles.galleryNotices}>
            <article className={styles.galleryNoticeCard}>
              <h3>Disclaimer</h3>
              <p>
                This site is in no way affiliated with The Pandemonium Institute (TPI) or Blood on the Clocktower.
                It is a fan-made passion project to share custom styling finds with the community.
              </p>
            </article>
            <article className={styles.galleryNoticeCard}>
              <h3>Shared by Potato from The Grimoire</h3>
              <p>
                This site was created and shared by Potato, a community member of The Grimoire. If you want to ask
                questions or join games, come hang out in the Discord.
              </p>
              <a
                href="https://join.thegrim.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.galleryNoticeLink}
              >
                Join The Grimoire Discord ↗
              </a>
            </article>
          </section>
        </main>
      </div>
    );
  }

  // ── Shared customizer header / back button ────────────────────────────────────
  const customizerTitle    = selectedScript === 'token-motion' ? 'Player Token Motion' : 'BotC-CSS Customiser';
  const customizerSubtitle = selectedScript === 'token-motion'
    ? 'Animate player tokens on the grimoire board — independent of the sidebar script'
    : 'Style your Blood on the Clocktower sidebar script';

  // ── Token Motion customizer ───────────────────────────────────────────────────
  if (selectedScript === 'token-motion') {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logoArea}>
              <span className={styles.logoIcon}>🌀</span>
              <div>
                <h1 className={styles.title}>{customizerTitle}</h1>
                <p className={styles.subtitle}>{customizerSubtitle}</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.headerBackBtn}
                onClick={() => navigateToScript(null)}
              >
                ← Script gallery
              </button>
              <a
                href="https://botc.app"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.headerLink}
              >
                botc.app ↗
              </a>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.controls}>
            <div className={styles.controlsBody}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Motion Type</h2>
                <p className={styles.hint}>
                  Choose how player tokens animate on the grimoire board.
                </p>
                <SelectControl
                  label="Motion type"
                  value={motionSettings.mt}
                  options={MOTION_TYPE_OPTIONS}
                  onChange={v => updateMotion('mt', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Trigger</h2>
                <p className={styles.hint}>
                  When should the animation play? Hover over a token in the preview to test.
                </p>
                <SelectControl
                  label="When"
                  value={motionSettings.mw}
                  options={MOTION_WHEN_OPTIONS}
                  onChange={v => updateMotion('mw', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Speed &amp; Easing</h2>
                <RangeControl
                  label="Speed"
                  value={motionSettings.ms}
                  min={0.2}
                  max={3}
                  step={0.1}
                  unit="x"
                  onChange={v => updateMotion('ms', Number(v))}
                />
                <SelectControl
                  label="Easing"
                  value={motionSettings.me}
                  options={MOTION_EASE_OPTIONS}
                  onChange={v => updateMotion('me', v)}
                />
              </section>
            </div>

            <ShareUrl
              settings={motionSettings}
              onLoadSettings={loadMotionSettings}
              buildHashFn={buildTokenMotionHash}
              buildCSSFn={buildTokenMotionCSS}
              cssPath="/token-motion-css"
              parseInputFn={parseTokenMotionInput}
            />

            <div className={styles.controlsFooter}>
              <button className={styles.resetBtn} onClick={resetMotion}>
                ↺ Reset to defaults
              </button>
            </div>
          </aside>

          <main className={styles.main}>
            <TokenMotionPreview settings={motionSettings} />
          </main>
        </div>
      </div>
    );
  }

  // ── BotC Sidebar customizer ───────────────────────────────────────────────────
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoArea}>
            <span className={styles.logoIcon}>🧙</span>
            <div>
              <h1 className={styles.title}>{customizerTitle}</h1>
              <p className={styles.subtitle}>{customizerSubtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerBackBtn}
              onClick={() => navigateToScript(null)}
            >
              ← Script gallery
            </button>
            <a
              href="https://botc.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerLink}
            >
              botc.app ↗
            </a>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.controls}>
          <nav className={styles.tabs}>
            {[
              { id: 'colors',  label: '🎨 Colours' },
              { id: 'type',    label: '✍️ Typography' },
              { id: 'layout',  label: '📐 Layout' },
              { id: 'effects', label: '✨ Effects' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={styles.controlsBody}>
            {activeTab === 'colors' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Background Colour Style</h2>
                <SelectControl
                  label="Mode"
                  value={sidebarSettings.bm}
                  options={BACKGROUND_MODE_OPTIONS}
                  onChange={chooseBackgroundMode}
                />

                <div className={styles.gradientPreviewSwatch}
                  style={{ background: backgroundPreview }}
                />

                {sidebarSettings.bm === 'single' && (
                  <>
                    <p className={styles.hint}>Use one solid background colour.</p>
                    <ColorControl
                      label="Background"
                      value={sidebarSettings.bs}
                      onChange={v => updateSidebar('bs', v)}
                    />
                  </>
                )}

                {sidebarSettings.bm === 'gradient' && (
                  <>
                    <p className={styles.hint}>Use a custom 3-stop gradient.</p>
                    <div className={styles.gradientRow}>
                      <ColorControl
                        label="Start"
                        value={sidebarSettings.bg1}
                        onChange={v => updateSidebar('bg1', v)}
                      />
                      <ColorControl
                        label="Middle"
                        value={sidebarSettings.bg2}
                        onChange={v => updateSidebar('bg2', v)}
                      />
                      <ColorControl
                        label="End"
                        value={sidebarSettings.bg3}
                        onChange={v => updateSidebar('bg3', v)}
                      />
                    </div>
                  </>
                )}

                {sidebarSettings.bm === 'preset' && (
                  <>
                    <p className={styles.hint}>Choose from preset gradients, including rainbow and parchment styles.</p>
                    <div className={styles.presetGrid}>
                      {BACKGROUND_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`${styles.presetBtn} ${sidebarSettings.bp === preset.id ? styles.presetBtnActive : ''}`}
                          onClick={() => applyPreset(preset.id)}
                        >
                          <span className={styles.presetLabel}>{preset.label}</span>
                          <span className={styles.presetSwatch} style={{ background: preset.css }} />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Accent Colour</h2>
                <p className={styles.hint}>Used for the side border and section dividers.</p>
                <ColorControl
                  label="Border / Divider"
                  value={sidebarSettings.bc}
                  onChange={v => updateSidebar('bc', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Text</h2>
                <ColorControl
                  label="Character name colour"
                  value={sidebarSettings.tc}
                  onChange={v => updateSidebar('tc', v)}
                />
              </section>
            )}

            {activeTab === 'type' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Font Family</h2>
                <SelectControl
                  label="Character name font"
                  value={sidebarSettings.ff}
                  options={FONT_OPTIONS}
                  onChange={v => updateSidebar('ff', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Font Size</h2>
                <RangeControl
                  label="Character name size"
                  value={sidebarSettings.fs}
                  min={10}
                  max={22}
                  step={1}
                  unit="px"
                  onChange={v => updateSidebar('fs', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Text Style</h2>
                <ToggleControl
                  label="Uppercase character names"
                  checked={sidebarSettings.tt}
                  onChange={v => updateSidebar('tt', v)}
                />
                <RangeControl
                  label="Letter spacing"
                  value={sidebarSettings.ls}
                  min={0}
                  max={4}
                  step={0.1}
                  unit="px"
                  onChange={v => updateSidebar('ls', Number(v))}
                />
              </section>
            )}

            {activeTab === 'layout' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Sidebar Width</h2>
                <RangeControl
                  label="Width"
                  value={sidebarSettings.w}
                  min={200}
                  max={400}
                  step={10}
                  unit="px"
                  onChange={v => updateSidebar('w', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Sidebar Padding</h2>
                <RangeControl
                  label="Top padding"
                  value={sidebarSettings.pt}
                  min={0}
                  max={80}
                  step={5}
                  unit="px"
                  onChange={v => updateSidebar('pt', Number(v))}
                />
                <RangeControl
                  label="Left inset"
                  value={sidebarSettings.pl}
                  min={0}
                  max={60}
                  step={5}
                  unit="px"
                  onChange={v => updateSidebar('pl', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Border / Divider</h2>
                <RangeControl
                  label="Thickness"
                  value={sidebarSettings.bw}
                  min={0}
                  max={8}
                  step={1}
                  unit="px"
                  onChange={v => updateSidebar('bw', Number(v))}
                />
              </section>
            )}

            {activeTab === 'effects' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Torn-Edge Mask</h2>
                <p className={styles.hint}>
                  The jagged left edge that makes the sidebar look like torn parchment.
                </p>
                <ToggleControl
                  label="Show torn-edge mask"
                  checked={sidebarSettings.m}
                  onChange={v => updateSidebar('m', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Background Artwork</h2>
                <RangeControl
                  label="Token icon opacity"
                  value={sidebarSettings.io}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={v => updateSidebar('io', Number(v))}
                />
                <RangeControl
                  label="Token icon size"
                  value={sidebarSettings.is}
                  min={120}
                  max={260}
                  step={10}
                  unit="px"
                  onChange={v => updateSidebar('is', Number(v))}
                />
              </section>
            )}
          </div>

          <ShareUrl settings={sidebarSettings} onLoadSettings={loadSidebarSettings} />

          <div className={styles.controlsFooter}>
            <button className={styles.resetBtn} onClick={resetSidebar}>
              ↺ Reset to defaults
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <Preview settings={sidebarSettings} />
        </main>
      </div>
    </div>
  );
}
