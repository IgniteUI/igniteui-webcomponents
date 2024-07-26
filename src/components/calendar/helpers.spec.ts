import type IgcCalendarComponent from './calendar.js';
import IgcDaysViewComponent from './days-view/days-view.js';
import type { CalendarDay } from './model.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import IgcYearsViewComponent from './years-view/years-view.js';

export function getDayViewDOM(element: IgcDaysViewComponent) {
  const root = element.shadowRoot!;
  return {
    dates: {
      get all() {
        return Array.from(
          root.querySelectorAll('span[part~="date-inner"]')
        ) as HTMLElement[];
      },
      get disabled() {
        return Array.from(
          root.querySelectorAll('span[part*="date-inner disabled"]')
        ) as HTMLElement[];
      },
    },
  };
}

export function getCalendarDOM(element: IgcCalendarComponent) {
  const root = element.shadowRoot!;
  return {
    get active() {
      return root.activeElement;
    },
    views: {
      get days() {
        return root.querySelector(IgcDaysViewComponent.tagName)!;
      },
      get months() {
        return root.querySelector(IgcMonthsViewComponent.tagName)!;
      },
      get years() {
        return root.querySelector(IgcYearsViewComponent.tagName)!;
      },
    },
    navigation: {
      get months() {
        return root.querySelector(
          '[part="months-navigation"]'
        ) as HTMLButtonElement;
      },
      get years() {
        return root.querySelector(
          '[part="years-navigation"]'
        ) as HTMLButtonElement;
      },
      get previous() {
        return Array.from(
          root.querySelectorAll('[part="navigation-button"]')
        ).at(0)! as HTMLButtonElement;
      },
      get next() {
        return Array.from(
          root.querySelectorAll('[part="navigation-button"]')
        ).at(-1)! as HTMLButtonElement;
      },
    },
  };
}

export function getDOMDate(date: CalendarDay, view: IgcDaysViewComponent) {
  return getDayViewDOM(view).dates.all.find((day) =>
    day.matches(`[data-value='${date.timestamp}']`)
  )!;
}
