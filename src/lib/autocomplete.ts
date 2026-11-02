export function filterSuggestions(
  values: readonly string[],
  search: string,
  limit = 5,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase();

  if (normalizedSearch.length < 2) {
    return [];
  }

  return values
    .filter((value) =>
      value.toLocaleLowerCase().includes(normalizedSearch),
    )
    .slice(0, limit);
}
