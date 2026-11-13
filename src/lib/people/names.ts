import { meetingRoles } from "@/data/meeting-roles";
import type { RoleKey, SundaySchedule } from "@/types/meeting";

export const PERSON_NAME_MIN_LENGTH = 2;
export const PERSON_NAME_MAX_LENGTH = 160;

/** Funções cujos nomes entram automaticamente na lista de membros ao salvar. */
export const personRoleKeys: readonly RoleKey[] = meetingRoles
  .filter((role) => role.registersPeople)
  .map((role) => role.key);

/*
 * Limites usados para reconhecer um nome de pessoa dentro de um campo.
 * Trechos maiores ou com números (frases, datas, cargos) são ignorados.
 */
const AUTO_NAME_MAX_LENGTH = 80;
const AUTO_NAME_MAX_WORDS = 8;
const NAME_SEPARATORS = /[&/;\n]+/;
const PARENTHESES_CONTENT = /\([^)]*\)?/g;
const EDGE_PUNCTUATION = /^[-–,.\s]+|[-–,.\s]+$/g;
const HAS_DIGIT = /\d/;
const HAS_LETTER = /\p{L}/u;

export function normalizePersonName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

/** Mensagem de erro em português, ou `null` quando o nome é válido. */
export function validatePersonName(name: string) {
  if (name.length < PERSON_NAME_MIN_LENGTH || name.length > PERSON_NAME_MAX_LENGTH) {
    return "Informe um nome válido, entre 2 e 160 caracteres.";
  }

  return null;
}

function looksLikePersonName(candidate: string) {
  const wordCount = candidate.split(" ").length;

  return (
    candidate.length >= PERSON_NAME_MIN_LENGTH &&
    candidate.length <= AUTO_NAME_MAX_LENGTH &&
    wordCount <= AUTO_NAME_MAX_WORDS &&
    HAS_LETTER.test(candidate) &&
    !HAS_DIGIT.test(candidate)
  );
}

/**
 * Extrai os nomes de um campo, removendo o conteúdo entre parênteses e
 * separando várias pessoas por "&", "/", ";" ou quebra de linha.
 * Ex.: "Ana Souza (Coral) & João Lima" → ["Ana Souza", "João Lima"].
 */
export function extractPersonNames(value: string) {
  return value
    .replace(PARENTHESES_CONTENT, " ")
    .split(NAME_SEPARATORS)
    .map((part) => normalizePersonName(part).replace(EDGE_PUNCTUATION, ""))
    .filter(looksLikePersonName);
}

/**
 * Reúne os nomes de todos os domingos, sem repetir nomes que diferem
 * apenas por maiúsculas e minúsculas.
 */
export function collectPersonNames(sundays: readonly SundaySchedule[]) {
  const namesByKey = new Map<string, string>();

  for (const sunday of sundays) {
    for (const roleKey of personRoleKeys) {
      for (const name of extractPersonNames(sunday[roleKey] ?? "")) {
        const key = name.toLocaleLowerCase("pt-BR");

        if (!namesByKey.has(key)) {
          namesByKey.set(key, name);
        }
      }
    }
  }

  return [...namesByKey.values()];
}

/** Ordena membros pelo nome, em ordem alfabética do português. */
export function sortPeopleByName<TPerson extends { name: string }>(people: readonly TPerson[]) {
  return [...people].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}
