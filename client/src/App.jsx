import { useState, useCallback } from 'react';
import ColorControl  from './components/ColorControl';
import ToggleControl from './components/ToggleControl';
import SelectControl from './components/SelectControl';
import RangeControl  from './components/RangeControl';
import Preview       from './components/Preview';
import ShareUrl      from './components/ShareUrl';
import styles        from './App.module.css';

const DEFAULT_SETTINGS = {
  bg1: '#f4e8d0',
  bg2: '#e8dcc8',
  bg3: '#f4e8d0',
  bc:  '#8b6f47',
  tc:  '#000000',
  ff:  '',
  fs:  14,
  m:   true,
  w:   270,
};

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

export default function App() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [activeTab, setActiveTab] = useState('colors');

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return (
    <div className={styles.app}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoArea}>
            <span className={styles.logoIcon}>🧙</span>
            <div>
              <h1 className={styles.title}>BotC-CSS Customiser</h1>
              <p className={styles.subtitle}>Style your Blood on the Clocktower sidebar</p>
            </div>
          </div>
          <a
            href="https://botc.app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerLink}
          >
            botc.app ↗
          </a>
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
                <h2 className={styles.sectionTitle}>Background</h2>
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

                <div className={styles.gradientPreviewSwatch}
                  style={{ background: `linear-gradient(135deg, ${settings.bg1} 0%, ${settings.bg2} 50%, ${settings.bg3} 100%)` }}
                />

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

          <div className={styles.controlsFooter}>
            <button className={styles.resetBtn} onClick={reset}>
              ↺ Reset to defaults
            </button>
          </div>
        </aside>

        {/* ── Preview + Share panel ── */}
        <main className={styles.main}>
          <Preview settings={settings} />
          <ShareUrl settings={settings} />
        </main>
      </div>
    </div>
  );
}
