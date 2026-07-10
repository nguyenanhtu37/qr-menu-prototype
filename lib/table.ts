export const MIN_TABLE_ID = 1;
export const MAX_TABLE_ID = 10;

export function parseTableIdParam(
  value: string | string[] | undefined,
): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return null;
  }

  const tableId = Number(rawValue);

  if (!Number.isInteger(tableId)) {
    return null;
  }

  if (tableId < MIN_TABLE_ID || tableId > MAX_TABLE_ID) {
    return null;
  }

  return tableId;
}
