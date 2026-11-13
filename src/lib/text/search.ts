/**
 * Normaliza um texto para comparação em buscas: ignora acentos,
 * maiúsculas e espaços nas pontas.
 */
export function toSearchKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function matchesSearch(value: string, search: string) {
  return toSearchKey(value).includes(toSearchKey(search));
}

/**
 * Sugestões de autocomplete: só busca a partir de 2 caracteres e
 * devolve no máximo `limit` itens.
 */
export function filterSuggestions(values: readonly string[], search: string, limit = 5) {
  if (toSearchKey(search).length < 2) {
    return [];
  }

  return values.filter((value) => matchesSearch(value, search)).slice(0, limit);
}

/** Filtra itens pelo nome; busca vazia devolve a lista inteira. */
export function filterByName<TItem extends { name: string }>(
  items: readonly TItem[],
  search: string,
) {
  if (!toSearchKey(search)) {
    return [...items];
  }

  return items.filter((item) => matchesSearch(item.name, search));
}
