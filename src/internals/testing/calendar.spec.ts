import type IgcCalendarComponent from '../../components/calendar/calendar.js';
import IgcDaysViewComponent from '../../components/calendar/days-view/days-view.js';
import IgcMonthsViewComponent from '../../components/calendar/months-view/months-view.js';
import IgcYearsViewComponent from '../../components/calendar/years-view/years-view.js';
import type { CalendarDay } from '../date/model.js';
import { firstOf, lastOf } from '../utils/arrays.js';

export function getDayViewDOM(element: IgcDaysViewComponent) {
  const root = element.shadowRoot!;
  return {
    get weekLabels() {
      return Array.from(
        root.querySelectorAll<HTMLSpanElement>('span[part="label"]')
      );
    },
    get weekNumbers() {
      return Array.from(
        root.querySelectorAll<HTMLElement>('[part~="week-number"]')
      );
    },
    dayRows: {
      get all() {
        return Array.from(
          root.querySelectorAll<HTMLElement>('[part="days-row"]')
        );
      },
      get first() {
        return firstOf(
          Array.from(root.querySelectorAll<HTMLElement>('[part="days-row"]'))
        );
      },
      get last() {
        return lastOf(
          Array.from(root.querySelectorAll<HTMLElement>('[part="days-row"]'))
        );
      },
    },
    dates: {
      get active() {
        return root.querySelector<HTMLElement>('[tabindex="0"]')!;
      },
      get all() {
        return Array.from(
          root.querySelectorAll<HTMLElement>('span[part~="date-inner"]')
        );
      },
      get disabled() {
        return Array.from(
          root.querySelectorAll<HTMLElement>(
            'span[part~="date-inner"][part~="disabled"]'
          )
        );
      },
      get current() {
        return root.querySelector('span[part~="current"]')!;
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
    header: {
      get container() {
        return root.querySelector<HTMLElement>('[part="header"]')!;
      },
      get date() {
        return root.querySelector<HTMLElement>('[part="header-date"]')!;
      },
      get title() {
        return root.querySelector<HTMLElement>('[part="header-title"]')!;
      },
    },
    get content() {
      return root.querySelector<HTMLElement>('[part~="content"]')!;
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
        return root.querySelector<HTMLButtonElement>(
          '[part="months-navigation"]'
        )!;
      },
      get years() {
        return root.querySelector<HTMLButtonElement>(
          '[part="years-navigation"]'
        )!;
      },
      get previous() {
        return firstOf(
          Array.from(
            root.querySelectorAll<HTMLButtonElement>(
              '[part="navigation-button"]'
            )
          )
        );
      },
      get next() {
        return lastOf(
          Array.from(
            root.querySelectorAll<HTMLButtonElement>(
              '[part="navigation-button"]'
            )
          )
        );
      },
    },
  };
}

export function getDOMDate(date: CalendarDay, view: IgcDaysViewComponent) {
  return getDayViewDOM(view).dates.all.find((day) =>
    day.matches(`[data-value='${date.timestamp}']`)
  )!;
}
