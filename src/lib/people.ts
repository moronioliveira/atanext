import type { RoleKey, SundaySchedule } from "@/types/meeting";

export const PERSON_NAME_MIN_LENGTH = 2;
export const PERSON_NAME_MAX_LENGTH = 160;

/**
 * Campos do domingo cujos nomes são adicionados automaticamente à lista
 * de membros da ala quando o planejamento é salvo.
 */
export const personRoleKeys: readonly RoleKey[] = [
  "presidida",
  "dirigida",
  "reconhecimentos",
  "regente",
  "organista",
  "primeiraOracao",
  "primeiroOrador",
  "segundoOrador",
  "ultimoOrador",
  "ultimaOracao",
];

/*
 * Limites usados para reconhecer um nome de pessoa dentro de um campo.
 * Trechos maiores ou com números (frases, datas, cargos) são ignorados.
 */
const AUTO_NAME_MAX_LENGTH = 80;
const AUTO_NAME_MAX_WORDS = 8;
const NAME_SEPARATORS = /[&/;\n]+/;
const PARENTHESES_CONTENT = /\([^)]*\)?/g;
const HAS_DIGIT = /\d/;
const HAS_LETTER = /\p{L}/u;
const EDGE_PUNCTUATION = /^[-–,.\s]+|[-–,.\s]+$/g;

export function normalizePersonName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export function validatePersonName(name: string) {
  if (
    name.length < PERSON_NAME_MIN_LENGTH ||
    name.length > PERSON_NAME_MAX_LENGTH
  ) {
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

function toSearchKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

/**
 * Filtra a lista de membros ignorando maiúsculas e acentos.
 */
export function filterPeopleByName<TPerson extends { name: string }>(
  people: readonly TPerson[],
  search: string,
) {
  const searchKey = toSearchKey(search.trim());

  if (!searchKey) {
    return [...people];
  }

  return people.filter((person) =>
    toSearchKey(person.name).includes(searchKey),
  );
}
