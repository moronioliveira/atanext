import type { ChangeEvent, FocusEvent } from "react";
import styles from "./meeting.module.css";

type AutocompleteFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
  suggestions: string[];
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onFocus: (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelect: (value: string) => void;
};

export function AutocompleteField({
  label,
  value,
  multiline = false,
  suggestions,
  onChange,
  onFocus,
  onSelect,
}: AutocompleteFieldProps) {
  return (
    <label className={styles.roleField}>
      <span>{label}</span>
      {multiline && (
        <small className={styles.fieldHint}>
          Use uma linha para cada informação.
        </small>
      )}
      <div className={styles.autocompleteWrap}>
        {multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            placeholder="Digite uma informação por linha"
            aria-label={label}
            rows={3}
          />
        ) : (
          <input
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            placeholder="Digite para buscar um membro"
            aria-label={label}
          />
        )}
        {!multiline && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onMouseDown={() => onSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
