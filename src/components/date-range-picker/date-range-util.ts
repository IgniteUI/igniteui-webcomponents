import { convertToDates } from '../calendar/helpers.js';

export type DateRangePredefinedType =
  | 'last7Days'
  | 'last30Days'
  | 'currentMonth'
  | 'yearToDate';

export function selectDateRange(
  rangeType: DateRangePredefinedType
): [Date, Date] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (rangeType) {
    case 'last7Days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;

    case 'last30Days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      break;

    case 'currentMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;

    case 'yearToDate':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;

    default:
      throw new Error('Invalid date range type');
  }

  return [startDate, endDate];
}

export function convertToDateRangeObject(
  value:
    | string
    | { start?: Date | string | null; end?: Date | string | null }
    | null
    | undefined
): { start: Date | null; end: Date | null } | null {
  if (typeof value === 'string') {
    const dates = convertToDates(value);
    return {
      start: dates?.[0] ?? null,
      end: dates?.[1] ?? null,
    };
  }

  if (value && typeof value === 'object') {
    const start =
      value.start instanceof Date
        ? value.start
        : (convertToDates([value.start ?? ''])?.[0] ?? null);

    const end =
      value.end instanceof Date
        ? value.end
        : (convertToDates([value.end ?? ''])?.[0] ?? null);

    return { start, end };
  }

  return null;
}
