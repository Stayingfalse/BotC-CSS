import styles from './RangeControl.module.css';

export default function RangeControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className={styles.control}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}{unit}</span>
      </div>
      <input
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className={styles.bounds}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
