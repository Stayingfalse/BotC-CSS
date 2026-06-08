import { useState, useCallback, useEffect } from 'react';
import ColorControl  from './components/ColorControl';
import ToggleControl from './components/ToggleControl';
import SelectControl from './components/SelectControl';
import RangeControl  from './components/RangeControl';
import Preview       from './components/Preview';
import ShareUrl      from './components/ShareUrl';
import { DEFAULTS, BACKGROUND_PRESETS, resolveBackgroundStyle } from './cssUtils';
import styles        from './App.module.css';

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
  { value: 'single', label: 'Single colour' },
  { value: 'gradient', label: '3 custom colours' },
  { value: 'preset', label: 'Preset gradient' },
];

const MOTION_TYPE_OPTIONS = [
  { value: 'spin', label: 'Spin' },
  { value: 'rock', label: 'Rock' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'random', label: 'Random (mixed)' },
];

const MOTION_WHEN_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'always', label: 'Always' },
  { value: 'hover', label: 'On hover' },
  { value: 'not-hover', label: 'When not hovered' },
];

const MOTION_EASE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease in' },
  { value: 'ease-out', label: 'Ease out' },
  { value: 'ease-in-out', label: 'Ease in/out' },
];

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
    name: 'Token Motion Customiser',
    description: 'Jump straight to token animation controls for spin, rock, hybrid, and random effects.',
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

const SETTINGS_STORAGE_KEY = 'botc-css-settings';

function normaliseSettings(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ...DEFAULTS };
  }
  const next = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (candidate[key] !== undefined) {
      next[key] = candidate[key];
    }
  }
  return next;
}

function readStoredSettings() {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return { ...DEFAULTS };
    return normaliseSettings(JSON.parse(stored));
  } catch {
    return { ...DEFAULTS };
  }
}

export default function App() {
  const [settings, setSettings] = useState(() => readStoredSettings());
  const [activeTab, setActiveTab] = useState('colors');
  const [selectedScript, setSelectedScript] = useState(null);
  const isTokenMotionCustomizer = selectedScript === 'token-motion';

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
  }, []);

  const loadSettings = useCallback((nextSettings) => {
    setSettings(normaliseSettings(nextSettings));
  }, []);

  const chooseBackgroundMode = useCallback((mode) => {
    setSettings(prev => ({ ...prev, bm: mode }));
  }, []);

  const applyPreset = useCallback((presetId) => {
    setSettings(prev => ({ ...prev, bm: 'preset', bp: presetId }));
  }, []);

  const openScript = useCallback((scriptId) => {
    if (scriptId === 'botc-sidebar') {
      setSelectedScript('botc-sidebar');
      setActiveTab('colors');
    } else if (scriptId === 'token-motion') {
      setSelectedScript('token-motion');
      setActiveTab('effects');
    }
  }, []);

  const backgroundPreview = resolveBackgroundStyle(settings);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage unavailable — keep session-only state
    }
  }, [settings]);

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
                    onClick={() => openScript(script.id)}
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

  return (
    <div className={styles.app}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoArea}>
            <span className={styles.logoIcon}>🧙</span>
            <div>
              <h1 className={styles.title}>{isTokenMotionCustomizer ? 'Token Motion Customiser' : 'BotC-CSS Customiser'}</h1>
              <p className={styles.subtitle}>
                {isTokenMotionCustomizer
                  ? 'Tune token animation controls for your sidebar style'
                  : 'Style your Blood on the Clocktower sidebar script'}
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerBackBtn}
              onClick={() => setSelectedScript(null)}
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

      {/* ── Main layout ── */}
      <div className={styles.layout}>
        {/* ── Controls panel ── */}
        <aside className={styles.controls}>
          <nav className={styles.tabs}>
            {[
              { id: 'colors',   label: '🎨 Colours' },
              { id: 'type',     label: '✍️ Typography' },
              { id: 'layout',   label: '📐 Layout' },
              { id: 'effects',  label: '✨ Effects' },
            ]
              .filter(tab => !isTokenMotionCustomizer || tab.id === 'effects')
              .map(tab => (
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
                  value={settings.bm}
                  options={BACKGROUND_MODE_OPTIONS}
                  onChange={chooseBackgroundMode}
                />

                <div className={styles.gradientPreviewSwatch}
                  style={{ background: backgroundPreview }}
                />

                {settings.bm === 'single' && (
                  <>
                    <p className={styles.hint}>Use one solid background colour.</p>
                    <ColorControl
                      label="Background"
                      value={settings.bs}
                      onChange={v => update('bs', v)}
                    />
                  </>
                )}

                {settings.bm === 'gradient' && (
                  <>
                    <p className={styles.hint}>Use a custom 3-stop gradient.</p>
                    <div className={styles.gradientRow}>
                      <ColorControl
                        label="Start"
                        value={settings.bg1}
                        onChange={v => update('bg1', v)}
                      />
                      <ColorControl
                        label="Middle"
                        value={settings.bg2}
                        onChange={v => update('bg2', v)}
                      />
                      <ColorControl
                        label="End"
                        value={settings.bg3}
                        onChange={v => update('bg3', v)}
                      />
                    </div>
                  </>
                )}

                {settings.bm === 'preset' && (
                  <>
                    <p className={styles.hint}>Choose from preset gradients, including rainbow and parchment styles.</p>
                    <div className={styles.presetGrid}>
                      {BACKGROUND_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`${styles.presetBtn} ${settings.bp === preset.id ? styles.presetBtnActive : ''}`}
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
                  value={settings.bc}
                  onChange={v => update('bc', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Text</h2>
                <ColorControl
                  label="Character name colour"
                  value={settings.tc}
                  onChange={v => update('tc', v)}
                />
              </section>
            )}

            {activeTab === 'type' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Font Family</h2>
                <SelectControl
                  label="Character name font"
                  value={settings.ff}
                  options={FONT_OPTIONS}
                  onChange={v => update('ff', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Font Size</h2>
                <RangeControl
                  label="Character name size"
                  value={settings.fs}
                  min={10}
                  max={22}
                  step={1}
                  unit="px"
                  onChange={v => update('fs', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Text Style</h2>
                <ToggleControl
                  label="Uppercase character names"
                  checked={settings.tt}
                  onChange={v => update('tt', v)}
                />
                <RangeControl
                  label="Letter spacing"
                  value={settings.ls}
                  min={0}
                  max={4}
                  step={0.1}
                  unit="px"
                  onChange={v => update('ls', Number(v))}
                />
              </section>
            )}

            {activeTab === 'layout' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Sidebar Width</h2>
                <RangeControl
                  label="Width"
                  value={settings.w}
                  min={200}
                  max={400}
                  step={10}
                  unit="px"
                  onChange={v => update('w', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Sidebar Padding</h2>
                <RangeControl
                  label="Top padding"
                  value={settings.pt}
                  min={0}
                  max={80}
                  step={5}
                  unit="px"
                  onChange={v => update('pt', Number(v))}
                />
                <RangeControl
                  label="Left inset"
                  value={settings.pl}
                  min={0}
                  max={60}
                  step={5}
                  unit="px"
                  onChange={v => update('pl', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Border / Divider</h2>
                <RangeControl
                  label="Thickness"
                  value={settings.bw}
                  min={0}
                  max={8}
                  step={1}
                  unit="px"
                  onChange={v => update('bw', Number(v))}
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
                  checked={settings.m}
                  onChange={v => update('m', v)}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Background Artwork</h2>
                <RangeControl
                  label="Token icon opacity"
                  value={settings.io}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={v => update('io', Number(v))}
                />
                <RangeControl
                  label="Token icon size"
                  value={settings.is}
                  min={120}
                  max={260}
                  step={10}
                  unit="px"
                  onChange={v => update('is', Number(v))}
                />

                <h2 className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>Token Motion</h2>
                <p className={styles.hint}>
                  Use the preview pane to test hover-triggered motion styles.
                </p>
                <SelectControl
                  label="Motion type"
                  value={settings.mt}
                  options={MOTION_TYPE_OPTIONS}
                  onChange={v => update('mt', v)}
                />
                <SelectControl
                  label="When"
                  value={settings.mw}
                  options={MOTION_WHEN_OPTIONS}
                  onChange={v => update('mw', v)}
                />
                <RangeControl
                  label="Speed"
                  value={settings.ms}
                  min={0.2}
                  max={3}
                  step={0.1}
                  unit="x"
                  onChange={v => update('ms', Number(v))}
                />
                <SelectControl
                  label="Easing"
                  value={settings.me}
                  options={MOTION_EASE_OPTIONS}
                  onChange={v => update('me', v)}
                />
              </section>
            )}
          </div>

          <ShareUrl settings={settings} onLoadSettings={loadSettings} />

          <div className={styles.controlsFooter}>
            <button className={styles.resetBtn} onClick={reset}>
              ↺ Reset to defaults
            </button>
          </div>
        </aside>

        {/* ── Preview panel ── */}
        <main className={styles.main}>
          <Preview settings={settings} />
        </main>
      </div>
    </div>
  );
}
