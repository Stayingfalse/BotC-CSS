import { useState, useMemo, useCallback } from 'react';
import { buildCSS, buildHash, parseSettingsInput } from '../cssUtils';
import styles from './ShareUrl.module.css';

export default function ShareUrl({ settings, onLoadSettings }) {
  const [activeView, setActiveView] = useState('import');
  const [copiedKey, setCopiedKey]   = useState(null);
  const [loadInput, setLoadInput] = useState('');
  const [loadStatus, setLoadStatus] = useState('');

  const hash      = useMemo(() => buildHash(settings), [settings]);
  const css       = useMemo(() => buildCSS(settings), [settings]);
  const importUrl = useMemo(() => {
    const base = window.location.origin;
    return `${base}/css/${hash}`;
  }, [hash]);

  const copy = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — do nothing
    }
  }, []);

  const loadSettingsFromInput = useCallback(() => {
    const parsed = parseSettingsInput(loadInput);
    if (!parsed || !onLoadSettings) {
      setLoadStatus('Could not read settings from that value.');
      return;
    }
    onLoadSettings(parsed);
    setLoadStatus('Settings loaded.');
  }, [loadInput, onLoadSettings]);

  return (
    <div className={styles.wrapper}>
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeView === 'import' ? styles.tabActive : ''}`}
          onClick={() => setActiveView('import')}
        >
          @import URL
        </button>
        <button
          className={`${styles.tab} ${activeView === 'css' ? styles.tabActive : ''}`}
          onClick={() => setActiveView('css')}
        >
          Full CSS
        </button>
      </nav>

      {activeView === 'import' && (
        <div className={styles.panel}>
          <p className={styles.description}>
            Add this line to your userstyle / Stylus sheet. It stays in sync — any future
            tweaks you save here will update automatically.
          </p>

          <div className={styles.urlRow}>
            <code className={styles.url}>{`@import url('${importUrl}');`}</code>
            <button
              className={`${styles.copyBtn} ${copiedKey === 'import' ? styles.copied : ''}`}
              onClick={() => copy(`@import url('${importUrl}');`, 'import')}
            >
              {copiedKey === 'import' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <p className={styles.hashInfo}>
            <span className={styles.hashLabel}>Short hash:</span>
            <code className={styles.hashValue}>{hash}</code>
            <button
              className={`${styles.copyBtnSm} ${copiedKey === 'hash' ? styles.copied : ''}`}
              onClick={() => copy(hash, 'hash')}
            >
              {copiedKey === 'hash' ? '✓' : 'Copy'}
            </button>
          </p>

          <div className={styles.loadRow}>
            <input
              type="text"
              className={styles.loadInput}
              value={loadInput}
              placeholder="Paste hash, @import line, or /css URL"
              onChange={(event) => {
                setLoadInput(event.target.value);
                setLoadStatus('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  loadSettingsFromInput();
                }
              }}
            />
            <button
              type="button"
              className={styles.loadBtn}
              onClick={loadSettingsFromInput}
            >
              Load settings
            </button>
          </div>
          {loadStatus && (
            <p
              className={`${styles.loadStatus} ${
                loadStatus.startsWith('Could') ? styles.loadStatusError : styles.loadStatusOk
              }`}
            >
              {loadStatus}
            </p>
          )}
        </div>
      )}

      {activeView === 'css' && (
        <div className={styles.panel}>
          <div className={styles.cssHeader}>
            <p className={styles.description}>
              Paste this directly into your Stylus / userstyle editor.
            </p>
            <button
              className={`${styles.copyBtn} ${copiedKey === 'css' ? styles.copied : ''}`}
              onClick={() => copy(css, 'css')}
            >
              {copiedKey === 'css' ? '✓ Copied!' : 'Copy CSS'}
            </button>
          </div>
          <pre className={styles.cssBlock}>{css}</pre>
        </div>
      )}
    </div>
  );
}
