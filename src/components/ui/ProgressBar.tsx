import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
