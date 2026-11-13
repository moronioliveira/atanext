import styles from "./Spinner.module.css";

type SpinnerProps = {
  size?: number;
  label?: string;
};

/** Indicador de carregamento. Com `label`, é anunciado por leitores de tela. */
export function Spinner({ size = 20, label }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
