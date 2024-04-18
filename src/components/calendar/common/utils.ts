import type { WeekDays } from './calendar.model.js';

const weekDaysMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DATE_BOUND = 8640000000000000;

export const MAX_DATE = new Date(DATE_BOUND);

export const MIN_DATE = new Date(-DATE_BOUND);

export const isDate = (value: any): value is Date => value instanceof Date;

export const areEqualDates = (
  date1: Date,
  date2: Date,
  datePartOnly = true
) => {
  return datePartOnly
    ? date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    : date1.getTime() === date2.getTime();
};

export const setDateSafe = (date: Date, value: number) => {
  date.setDate(value);
  if (date.getDate() !== value) {
    date.setDate(0);
  }
};

export const isEqual = (obj1: any, obj2: any): boolean => {
  if (isDate(obj1) && isDate(obj2)) {
    return obj1.getTime() === obj2.getTime();
  }
  return obj1 === obj2;
};

export const isValidDate = (value: any): value is Date => {
  if (isDate(value)) {
    return !isNaN(value.getTime());
  }

  return false;
};

export const validateDate = (value: Date) => {
  return isValidDate(value) ? value : new Date();
};

export const getDateOnly = (date: Date) => {
  const validDate = validateDate(date);
  return new Date(
    validDate.getFullYear(),
    validDate.getMonth(),
    validDate.getDate()
  );
};

export const getWeekDayNumber = (day: WeekDays) => {
  return weekDaysMap[day];
};

export const calculateYearsRangeStart = (date: Date, rangeCount: number) => {
  const year = date.getFullYear();
  const startYear = Math.floor(year / rangeCount) * rangeCount;

  return startYear;
};
