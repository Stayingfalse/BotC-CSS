import { useState, useCallback } from 'react';
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

const SCRIPT_GALLERY = [
  {
    id: 'botc-sidebar',
    icon: '🧙',
    name: 'BotC Sidebar',
    description: 'Customize the Blood on the Clocktower sidebar CSS with live preview and shareable imports.',
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

export default function App() {
  const [settings, setSettings] = useState({ ...DEFAULTS });
  const [activeTab, setActiveTab] = useState('colors');
  const [selectedScript, setSelectedScript] = useState(null);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS });
  }, []);

  const chooseBackgroundMode = useCallback((mode) => {
    setSettings(prev => ({ ...prev, bm: mode }));
  }, []);

  const applyPreset = useCallback((presetId) => {
    setSettings(prev => ({ ...prev, bm: 'preset', bp: presetId }));
  }, []);

  const openScript = useCallback((scriptId) => {
    if (scriptId === 'botc-sidebar') {
      setSelectedScript(scriptId);
      setActiveTab('colors');
    }
  }, []);

  const backgroundPreview = resolveBackgroundStyle(settings);

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
              <h1 className={styles.title}>BotC-CSS Customiser</h1>
              <p className={styles.subtitle}>Style your Blood on the Clocktower sidebar script</p>
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
              </section>
            )}
          </div>

          <ShareUrl settings={settings} />

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
