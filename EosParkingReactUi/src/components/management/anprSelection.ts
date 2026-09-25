export const selectAnprRowAfterRefresh = <T>(
  previousRows: T[],
  nextRows: T[],
  selectedKey: string | null,
  reset: boolean,
  rowKey: (row: T) => string,
) => {
  if (nextRows.length === 0) return null;
  if (reset) return nextRows[0];

  const previousFirstKey = previousRows[0] ? rowKey(previousRows[0]) : null;
  const nextFirstKey = rowKey(nextRows[0]);
  if (selectedKey && selectedKey === previousFirstKey && nextFirstKey !== previousFirstKey) return nextRows[0];

  return nextRows.find((row) => rowKey(row) === selectedKey) ?? nextRows[0];
};
