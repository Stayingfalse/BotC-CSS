import styles from './ColorControl.module.css';

export default function ColorControl({ label, value, onChange }) {
  return (
    <label className={styles.control}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <input
          type="color"
          className={styles.swatch}
          value={value}
          onChange={e => onChange(e.target.value)}
          title={label}
        />
        <input
          type="text"
          className={styles.hex}
          value={value}
          onChange={e => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          spellCheck={false}
          maxLength={7}
        />
      </div>
    </label>
  );
}
