"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { TextField } from "@/components/ui/TextField";
import { filterSuggestions, toSearchKey } from "@/lib/text";
import type { MeetingRole } from "@/types/meeting";
import styles from "./Planner.module.css";

const placeholders: Record<MeetingRole["input"], string> = {
  person: "Digite para buscar um membro",
  hymn: "Digite o número ou o nome do hino",
  text: "Uma informação por linha",
};

type RoleFieldProps = {
  role: MeetingRole;
  value: string;
  /** Opções do autocomplete (membros ou hinos). Ignorado em campos de texto. */
  options: readonly string[];
  onChange: (value: string) => void;
};

/**
 * Campo de uma função do domingo. Membros e hinos usam autocomplete
 * acessível (setas, Enter e Esc); textos livres usam várias linhas.
 */
export function RoleField({ role, value, options, onChange }: RoleFieldProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  if (role.input === "text") {
    return (
      <TextField
        multiline
        label={role.label}
        placeholder={placeholders.text}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  const suggestions = open
    ? filterSuggestions(options, value).filter(
        (option) => toSearchKey(option) !== toSearchKey(value),
      )
    : [];
  const expanded = suggestions.length > 0;
  const activeOptionId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  function choose(option: string) {
    onChange(option);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!expanded) {
      if (event.key === "ArrowDown") {
        setOpen(true);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={styles.combobox}>
      <TextField
        label={role.label}
        placeholder={placeholders[role.input]}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded ? activeOptionId : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {expanded && (
        <ul className={styles.suggestions} id={listId} role="listbox" aria-label={role.label}>
          {suggestions.map((option, index) => (
            <li
              key={option}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={styles.suggestion}
              onMouseDown={(event) => {
                // Evita que o campo perca o foco antes da escolha.
                event.preventDefault();
                choose(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
