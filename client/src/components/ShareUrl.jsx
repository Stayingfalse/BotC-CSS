import { useState, useMemo, useCallback } from 'react';
import { buildCSS, buildHash } from '../cssUtils';
import styles from './ShareUrl.module.css';

export default function ShareUrl({ settings }) {
  const [activeView, setActiveView] = useState('import');
  const [copiedKey, setCopiedKey]   = useState(null);

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
