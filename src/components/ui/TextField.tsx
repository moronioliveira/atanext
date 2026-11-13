"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import styles from "./TextField.module.css";

type FieldFrameProps = {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
};

type InputFieldProps = FieldFrameProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaFieldProps = FieldFrameProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export type TextFieldProps = InputFieldProps | TextareaFieldProps;

/**
 * Campo com label, dica e mensagem de erro já ligados por `aria-*`.
 * Use `multiline` para textos de várias linhas.
 */
export function TextField(props: TextFieldProps) {
  const generatedId = useId();
  const { label, hint, error, hideLabel = false, id = generatedId, className } = props;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const controlClassName = `${styles.control} ${error ? styles.invalid : ""} ${className ?? ""}`;

  return (
    <div className={styles.field}>
      <label className={hideLabel ? "sr-only" : styles.label} htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
      {renderControl(props, { id, describedBy, invalid: Boolean(error), controlClassName })}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type ControlOptions = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  controlClassName: string;
};

function renderControl(props: TextFieldProps, options: ControlOptions) {
  const accessibility = {
    id: options.id,
    "aria-describedby": options.describedBy,
    "aria-invalid": options.invalid || undefined,
    className: options.controlClassName,
  };

  if (props.multiline) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, hint, error, hideLabel, multiline, className, ...textareaProps } = props;

    return <textarea rows={3} {...textareaProps} {...accessibility} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { label, hint, error, hideLabel, multiline, className, ...inputProps } = props;

  return <input {...inputProps} {...accessibility} />;
}
