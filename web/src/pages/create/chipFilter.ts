export type ChipEntries<T extends Record<string, readonly string[]>> = Array<
  [keyof T, readonly string[]]
>;

const normalizeQuery = (query: string) => query.trim().toLowerCase();

export function filterChipGroups<T extends Record<string, readonly string[]>>(
  groups: T,
  query: string
): ChipEntries<T> {
  const normalized = normalizeQuery(query);
  return (Object.entries(groups) as ChipEntries<T>)
    .map(([category, chips]) => {
      if (!normalized) {
        return [category, chips] as [keyof T, readonly string[]];
      }
      const filtered = chips.filter((chip) =>
        chip.toLowerCase().includes(normalized)
      );
      return [category, filtered] as [keyof T, readonly string[]];
    })
    .filter(([, chips]) => chips.length > 0);
}

