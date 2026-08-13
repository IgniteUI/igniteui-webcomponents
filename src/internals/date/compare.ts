/** Compares two dates, optionally ignoring their time or their date portion. */
function compareDates(
  value: Date,
  boundary: Date,
  comparator: (a: number, b: number) => boolean,
  includeTime: boolean,
  includeDate: boolean
): boolean {
  if (includeTime && includeDate) {
    return comparator(value.getTime(), boundary.getTime());
  }

  const v = new Date(value.getTime());
  const b = new Date(boundary.getTime());

  if (!includeTime) {
    v.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
  }
  if (!includeDate) {
    v.setFullYear(0, 0, 0);
    b.setFullYear(0, 0, 0);
  }

  return comparator(v.getTime(), b.getTime());
}

export function isDateExceedingMax(
  value: Date,
  maxValue: Date,
  includeTime = true,
  includeDate = true
): boolean {
  return compareDates(
    value,
    maxValue,
    (a, b) => a > b,
    includeTime,
    includeDate
  );
}

export function isDateLessThanMin(
  value: Date,
  minValue: Date,
  includeTime = true,
  includeDate = true
): boolean {
  return compareDates(
    value,
    minValue,
    (a, b) => a < b,
    includeTime,
    includeDate
  );
}
