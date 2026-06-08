import styles from './ToggleControl.module.css';

export default function ToggleControl({ label, checked, onChange }) {
  return (
    <label className={styles.control}>
      <span className={styles.label}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className={styles.thumb} />
        <span className={styles.text}>{checked ? 'ON' : 'OFF'}</span>
      </button>
    </label>
  );
}
