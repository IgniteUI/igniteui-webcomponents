import { WeekDays } from './calendar';

const weekDaysMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const isDate = (value: any): value is Date => value instanceof Date;

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
