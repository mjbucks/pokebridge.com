export function combinations<T>(items: T[], size: number): T[][] {
  if (size <= 0 || size > items.length) return [];
  if (size === items.length) return [items.slice()];

  const results: T[][] = [];
  const combo: T[] = [];

  function backtrack(start: number) {
    if (combo.length === size) {
      results.push(combo.slice());
      return;
    }
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }

  backtrack(0);
  return results;
}
