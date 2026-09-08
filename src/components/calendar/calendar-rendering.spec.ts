import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  getCalendarDOM,
  getDayViewDOM,
  getDOMDate,
} from '#internals/testing/calendar.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import IgcCalendarComponent from './calendar.js';
import { type DateRangeDescriptor, DateRangeType } from './types.js';

describe('Calendar Rendering', () => {
  before(() => {
    defineComponents(IgcCalendarComponent);
  });

  let calendar: IgcCalendarComponent;

  describe('DOM', () => {
    beforeEach(async () => {
      calendar = await createCalendarElement();
    });

    it('passes the a11y audit', async () => {
      await expect(calendar).dom.to.be.accessible();
      await expect(calendar).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit when a week of hidden days is rendered - issue #1636', async () => {
      const aprilFirst2025 = new CalendarDay({ year: 2025, month: 3, date: 1 });
      calendar.activeDate = aprilFirst2025.native;
      calendar.visibleMonths = 2;
      await elementUpdated(calendar);

      await expect(calendar).dom.to.be.accessible();
      await expect(calendar).shadowDom.to.be.accessible();
    });

    it('renders the calendar successfully', async () => {
      const today = CalendarDay.today.native;
      const day = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(
        today
      );
      const month = new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
      }).format(today);

      const headerDate = `${day}, ${month}`;

      const ignoreAttributes = [
        'style',
        'aria-label',
        'aria-live',
        'collection',
        'name',
        'role',
        'exportparts',
      ];
      const ignoreChildren = ['span', 'button'];

      expect(calendar).shadowDom.to.equal(
        `
      <div part="header">
        <div part="header-title">
          <slot name="title">Select Date</slot>
        </div>
        <div part="header-date">
          <slot>
            ${headerDate}
          </slot>
        </div>
      </div>
      <span class="aria-off-screen"></span>
      <div part="content">
        <div part="days-view-container">
          <div part="navigation">
            <div part="picker-dates">
              <button part="months-navigation"></button>
              <button part="years-navigation"></button>
            </div>
            <div part="navigation-buttons">
              <button part="navigation-button">
                <igc-icon></igc-icon>
              </button>
              <button part="navigation-button">
                <igc-icon></igc-icon>
              </button>
            </div>
          </div>
          <igc-days-view part="days-view"></igc-days-view>
        </div>
      </div>
      `,
        { ignoreAttributes, ignoreChildren }
      );
    });

    it('should render title slot', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar><p slot="title">Title</p></igc-calendar>`
      );

      const titleSlot =
        getCalendarDOM(calendar).header.title.querySelector('slot')!;

      expect(titleSlot.assignedElements()).lengthOf(1);
      expect(firstOf(titleSlot.assignedElements()).textContent).to.equal(
        'Title'
      );
    });

    it('should render header-date slot', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar><p slot="header-date">Header date</p></igc-calendar>`
      );

      const dateSlot =
        getCalendarDOM(calendar).header.date.querySelector('slot')!;

      expect(dateSlot.assignedElements()).lengthOf(1);
      expect(firstOf(dateSlot.assignedElements()).textContent).to.equal(
        'Header date'
      );
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      calendar = await createCalendarElement();
    });

    it('should successfully enable `hideOutsideDays`', async () => {
      calendar.activeDate = new Date(2022, 3, 10);
      calendar.hideOutsideDays = true;
      await elementUpdated(calendar);

      const { first, last } = getDayViewDOM(
        getCalendarDOM(calendar).views.days
      ).dayRows;

      expect(first.children.item(0)?.part.contains('hidden')).to.be.true;
      expect(last.children.item(6)?.part.contains('hidden')).to.be.true;
    });

    it('should set vertical orientation part', async () => {
      calendar.orientation = 'vertical';
      await elementUpdated(calendar);

      const dom = getCalendarDOM(calendar);
      expect(dom.content).to.exist;
      expect(dom.content.part.contains('content-vertical')).to.be.true;
    });

    it('successfully enables and disables `hideHeader`', async () => {
      calendar.hideHeader = true;
      await elementUpdated(calendar);
      expect(getCalendarDOM(calendar).header.container).to.be.null;

      calendar.hideHeader = false;
      await elementUpdated(calendar);
      expect(getCalendarDOM(calendar).header.container).not.to.be.null;
    });

    it('should change header orientation', async () => {
      expect(calendar).dom.to.equal(
        '<igc-calendar header-orientation="horizontal"></igc-calendar>'
      );

      calendar.headerOrientation = 'vertical';
      await elementUpdated(calendar);

      expect(calendar).dom.to.equal(
        '<igc-calendar header-orientation="vertical"></igc-calendar>'
      );
    });

    it('should display more than one month', async () => {
      const dom = getCalendarDOM(calendar);

      expect(dom.content.children).lengthOf(1);

      calendar.visibleMonths = 3;
      await elementUpdated(calendar);

      expect(dom.content.children).lengthOf(3);
    });

    it('should expose a single live region for the active period', async () => {
      const liveRegions = () =>
        Array.from(
          calendar.shadowRoot!.querySelectorAll<HTMLElement>('[aria-live]')
        );

      calendar.activeDate = new CalendarDay({
        year: 2025,
        month: 2,
        date: 15,
      }).native;
      calendar.visibleMonths = 3;
      await elementUpdated(calendar);

      expect(liveRegions()).lengthOf(1);
      expect(firstOf(liveRegions()).innerText).to.equal('March 2025');

      calendar.activeView = 'months';
      await elementUpdated(calendar);

      expect(liveRegions()).lengthOf(1);
      expect(firstOf(liveRegions()).innerText).to.equal('2025');

      // The years view announces through its visible years range instead
      calendar.activeView = 'years';
      await elementUpdated(calendar);

      const regions = liveRegions();

      expect(regions).lengthOf(1);
      expect(firstOf(regions).part.contains('years-range')).to.be.true;
    });

    it('should expose a single tab stop with more than one visible month', async () => {
      calendar.visibleMonths = 3;
      await elementUpdated(calendar);

      const views = Array.from(
        calendar.shadowRoot!.querySelectorAll('igc-days-view')
      );
      const tabStops = views.flatMap((view) =>
        Array.from(view.shadowRoot!.querySelectorAll('[tabindex="0"]'))
      );

      expect(views).lengthOf(3);
      expect(tabStops).lengthOf(1);
    });

    it('should render the correct active view', async () => {
      const { views } = getCalendarDOM(calendar);

      expect(views.days).not.to.be.null;
      expect(views.months).to.be.null;
      expect(views.years).to.be.null;

      calendar.activeView = 'months';
      await elementUpdated(calendar);

      expect(views.days).to.be.null;
      expect(views.months).not.to.be.null;
      expect(views.years).to.be.null;

      calendar.activeView = 'years';
      await elementUpdated(calendar);

      expect(views.days).to.be.null;
      expect(views.months).to.be.null;
      expect(views.years).not.to.be.null;
    });

    it('should render header container based on selection', async () => {
      const { header } = getCalendarDOM(calendar);

      expect(calendar.selection).to.equal('single');
      expect(header.container).not.to.be.null;

      calendar.selection = 'multiple';
      await elementUpdated(calendar);

      expect(header.container).to.be.null;

      calendar.selection = 'range';
      await elementUpdated(calendar);

      expect(header.container).not.to.be.null;
    });

    it('should render week numbers', async () => {
      const dayViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      expect(dayViewDOM.weekNumbers).empty;

      calendar.showWeekNumbers = true;
      await elementUpdated(calendar);

      expect(dayViewDOM.weekNumbers).not.empty;
    });

    it('should render labels based on `weekStart`', async () => {
      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      calendar.weekStart = 'wednesday';
      await elementUpdated(calendar);

      expect(firstOf(daysViewDOM.weekLabels)).attribute(
        'aria-label',
        'Wednesday'
      );
    });

    it('should align the days grid with the initial `week-start`', async () => {
      // March 2025 starts on a Saturday -> a Monday based week starts on Feb 24th
      const march = new CalendarDay({ year: 2025, month: 2, date: 15 });

      calendar = await createCalendarElement(
        html`<igc-calendar
          week-start="monday"
          .activeDate=${march.native}
        ></igc-calendar>`
      );

      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      expect(firstOf(daysViewDOM.weekLabels)).attribute('aria-label', 'Monday');
      expect(firstOf(daysViewDOM.dates.all).dataset.value).to.equal(
        `${new CalendarDay({ year: 2025, month: 1, date: 24 }).timestamp}`
      );
    });

    it('should align the days grid when `weekStart` changes at runtime', async () => {
      calendar.activeDate = new CalendarDay({
        year: 2025,
        month: 2,
        date: 15,
      }).native;
      await elementUpdated(calendar);

      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);
      const firstDateValue = () =>
        firstOf(daysViewDOM.dates.all).dataset.value!;

      // Default `sunday` -> Feb 23rd
      expect(firstDateValue()).to.equal(
        `${new CalendarDay({ year: 2025, month: 1, date: 23 }).timestamp}`
      );

      // March 1st 2025 is a Saturday and starts the first week of the grid
      calendar.weekStart = 'saturday';
      await elementUpdated(calendar);

      expect(firstOf(daysViewDOM.weekLabels)).attribute(
        'aria-label',
        'Saturday'
      );
      expect(firstDateValue()).to.equal(
        `${new CalendarDay({ year: 2025, month: 2, date: 1 }).timestamp}`
      );
    });

    it('should change on `weekDayFormat`', async () => {
      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      calendar.formatOptions = { weekday: 'short' };
      calendar.weekStart = 'sunday';
      await elementUpdated(calendar);

      expect(firstOf(daysViewDOM.weekLabels).innerText).to.equal('Sun');

      calendar.formatOptions = { weekday: 'long' };
      await elementUpdated(calendar);

      expect(firstOf(daysViewDOM.weekLabels).innerText).to.equal('Sunday');

      calendar.formatOptions = { weekday: 'narrow' };
      await elementUpdated(calendar);

      expect(firstOf(daysViewDOM.weekLabels).innerText).to.equal('S');
    });

    it('should change on `monthFormat`', async () => {
      const dom = getCalendarDOM(calendar);

      calendar.activeDate = new Date(2021, 6, 17);
      calendar.formatOptions = {
        month: 'numeric',
      };
      await elementUpdated(calendar);
      expect(dom.navigation.months.innerText).to.equal('7');

      calendar.formatOptions = {
        month: '2-digit',
      };
      await elementUpdated(calendar);
      expect(dom.navigation.months.innerText).to.equal('07');

      calendar.formatOptions = {
        month: 'long',
      };
      await elementUpdated(calendar);
      expect(dom.navigation.months.innerText).to.equal('July');
    });

    it('should accept active date through attribute', async () => {
      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      const today = CalendarDay.today;
      const date = new CalendarDay({ year: 2022, month: 1, date: 2 });

      calendar.setAttribute('active-date', '2022-02-02');
      await elementUpdated(calendar);

      expect(CalendarDay.from(calendar.activeDate).equalTo(date)).to.be.true;
      expect(daysViewDOM.dates.active.innerText).to.equal('2');

      calendar.setAttribute('active-date', '');
      await elementUpdated(calendar);

      expect(CalendarDay.from(calendar.activeDate).equalTo(today)).to.be.true;
      expect(daysViewDOM.dates.active.innerText).to.equal(`${today.date}`);
    });

    it('navigates to the initially set active date regardless of any value(s) set, single selection', async () => {
      const activeDate = new CalendarDay({ year: 2023, month: 7, date: 6 });
      const valueDate = activeDate.set({ month: 5 });

      calendar = await createCalendarElement(
        html`<igc-calendar
          .activeDate=${activeDate.native}
          .value=${valueDate.native}
        ></igc-calendar>`
      );

      const dom = getCalendarDOM(calendar);

      expect(CalendarDay.from(calendar.activeDate).equalTo(activeDate)).to.be
        .true;
      expect(dom.header.date.innerText).to.equal('Tue, Jun 6');
      expect(dom.navigation.months.innerText).to.equal('August');
    });

    it('navigates to the initially set active date regardless of any value(s) set, range selection', async () => {
      const activeDate = new CalendarDay({ year: 2023, month: 7, date: 6 });
      const valuesDate = [
        activeDate.set({ month: 5 }).native,
        activeDate.set({ month: 5, date: 9 }).native,
      ];

      calendar = await createCalendarElement(
        html`<igc-calendar
          selection="range"
          .activeDate=${activeDate.native}
          .values=${valuesDate}
        ></igc-calendar>`
      );

      const dom = getCalendarDOM(calendar);

      expect(CalendarDay.from(calendar.activeDate).equalTo(activeDate)).to.be
        .true;
      expect(dom.header.date.innerText.replaceAll('\n', '')).to.equal(
        'Jun 6 - Jun 9'
      );
      expect(dom.navigation.months.innerText).to.equal('August');
    });

    it('navigates to the current date if no initial active date is set and no value(s) are set', async () => {
      expect(CalendarDay.from(calendar.activeDate).equalTo(CalendarDay.today))
        .to.be.true;
    });

    it("navigates to the date set as value initially, selection 'single', no activeDate explicitly set", async () => {
      const date = new CalendarDay({ year: 2023, month: 7, date: 6 });
      calendar = await createCalendarElement(
        html`<igc-calendar .value=${date.native}></igc-calendar>`
      );

      expect(CalendarDay.from(calendar.activeDate).equalTo(date)).to.be.true;
      expect(getCalendarDOM(calendar).header.date.innerText).to.equal(
        'Sun, Aug 6'
      );
    });

    it("navigates to the first date of the initially set values, selection 'range', no activeDate explicitly set", async () => {
      const start = new CalendarDay({ year: 2023, month: 7, date: 6 });
      const end = start.set({ date: 9 });

      calendar = await createCalendarElement(
        html`<igc-calendar
          selection="range"
          .values=${[start.native, end.native]}
        ></igc-calendar>`
      );

      expect(CalendarDay.from(calendar.activeDate).equalTo(start)).to.be.true;
      expect(
        getCalendarDOM(calendar).header.date.innerText.replaceAll('\n', '')
      ).to.equal('Aug 6 - Aug 9');
    });

    it("navigates to the first date of the initially set values as attribute, selection 'multiple', no activeDate explicitly set", async () => {
      const first = new CalendarDay({ year: 2023, month: 7, date: 6 });
      const last = first.set({ date: 9 });

      calendar = await createCalendarElement(
        html`<igc-calendar
          selection="multiple"
          .values=${[first.native, last.native]}
        ></igc-calendar>`
      );

      expect(CalendarDay.from(calendar.activeDate).equalTo(first)).to.be.true;
      expect(getCalendarDOM(calendar).navigation.months.innerText).to.equal(
        'August'
      );
    });

    it('issue #1278', async () => {
      const today = new CalendarDay({ year: 2024, month: 6, date: 25 });
      calendar.activeDate = today.native;
      await elementUpdated(calendar);

      const calendarDOM = getCalendarDOM(calendar);

      const julySpecials = [
        new CalendarDay({ year: 2024, month: 6, date: 22 }),
        new CalendarDay({ year: 2024, month: 6, date: 23 }),
      ];
      const augustSpecials = [
        new CalendarDay({ year: 2024, month: 7, date: 1 }),
        new CalendarDay({ year: 2024, month: 7, date: 2 }),
      ];

      const specialDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Specific,
          dateRange: [
            ...julySpecials.map((d) => d.native),
            ...augustSpecials.map((d) => d.native),
          ],
        },
      ];

      calendar.specialDates = specialDates;
      await elementUpdated(calendar);

      for (const date of julySpecials) {
        const dateDOM = getDOMDate(date, calendarDOM.views.days);

        expect(dateDOM.part.contains('special')).to.be.true;
        expect(dateDOM.part.contains('inactive')).to.be.false;
      }

      for (const date of augustSpecials) {
        const dateDOM = getDOMDate(date, calendarDOM.views.days);

        expect(dateDOM.part.contains('special')).to.be.false;
        expect(dateDOM.part.contains('inactive')).to.be.true;
      }

      // Move active date to August
      calendar.activeDate = today.set({ month: 7 }).native;
      await elementUpdated(calendar);

      for (const date of augustSpecials) {
        const dateDOM = getDOMDate(date, calendarDOM.views.days);

        expect(dateDOM.part.contains('special')).to.be.true;
        expect(dateDOM.part.contains('inactive')).to.be.false;
      }
    });

    it('issue #2035 - Incorrect ISO 8601 week numbering', async () => {
      const date = new CalendarDay({ year: 2025, month: 11, date: 31 });

      calendar.activeDate = date.native;
      calendar.weekStart = 'wednesday';
      calendar.showWeekNumbers = true;
      await elementUpdated(calendar);

      const calendarDOM = getCalendarDOM(calendar);
      const daysViewDOM = getDayViewDOM(calendarDOM.views.days);
      const lastWeekNumber = lastOf(daysViewDOM.weekNumbers);

      expect(lastWeekNumber.innerText).to.equal('1');
    });
  });

  describe('Locale', () => {
    // July 2025 starts on a Tuesday
    const july = new CalendarDay({ year: 2025, month: 6, date: 15 });
    const sunday = new CalendarDay({ year: 2025, month: 5, date: 29 });
    const monday = new CalendarDay({ year: 2025, month: 5, date: 30 });
    const saturday = new CalendarDay({ year: 2025, month: 5, date: 28 });

    const daysViewDOM = () =>
      getDayViewDOM(getCalendarDOM(calendar).views.days);
    const firstDateValue = () =>
      firstOf(daysViewDOM().dates.all).dataset.value!;
    const firstLabel = () =>
      firstOf(daysViewDOM().weekLabels).getAttribute('aria-label');

    it('derives the week start from the locale when `week-start` is not set', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar
          locale="bg"
          .activeDate=${july.native}
        ></igc-calendar>`
      );

      expect(calendar.weekStart).to.equal('monday');
      expect(firstLabel()).to.equal('понеделник');
      expect(firstDateValue()).to.equal(`${monday.timestamp}`);
    });

    it('re-aligns the days grid when the locale changes at runtime', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar .activeDate=${july.native}></igc-calendar>`
      );

      expect(calendar.weekStart).to.equal('sunday');
      expect(firstDateValue()).to.equal(`${sunday.timestamp}`);

      calendar.locale = 'de';
      await elementUpdated(calendar);

      expect(calendar.weekStart).to.equal('monday');
      expect(firstDateValue()).to.equal(`${monday.timestamp}`);

      calendar.locale = 'ar-EG';
      await elementUpdated(calendar);

      expect(calendar.weekStart).to.equal('saturday');
      expect(firstLabel()).to.equal('السبت');
      expect(firstDateValue()).to.equal(`${saturday.timestamp}`);
    });

    it('prefers an explicit `week-start` over the locale', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar
          locale="bg"
          week-start="sunday"
          .activeDate=${july.native}
        ></igc-calendar>`
      );

      expect(calendar.weekStart).to.equal('sunday');
      expect(firstDateValue()).to.equal(`${sunday.timestamp}`);

      // Returns to the locale value
      calendar.weekStart = undefined;
      await elementUpdated(calendar);

      expect(calendar.weekStart).to.equal('monday');
      expect(firstDateValue()).to.equal(`${monday.timestamp}`);
    });

    it('falls back to sunday in engines without `Intl.Locale.prototype.getWeekInfo()`', async () => {
      const prototype = Intl.Locale.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        prototype,
        'getWeekInfo'
      );

      expect(Reflect.deleteProperty(prototype, 'getWeekInfo')).to.be.true;

      try {
        calendar = await createCalendarElement(
          html`<igc-calendar locale="bg"></igc-calendar>`
        );
        expect(calendar.weekStart).to.equal('sunday');
      } finally {
        if (descriptor) {
          Object.defineProperty(prototype, 'getWeekInfo', descriptor);
        }
      }
    });

    it('renders the header date in the field order of the locale', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar locale="ja" .value=${july.native}></igc-calendar>`
      );
      const dom = getCalendarDOM(calendar);
      const lines = () =>
        Array.from(dom.header.date.querySelector('slot')!.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent!.trim())
          .filter(Boolean);

      expect(dom.header.date.textContent!.trim()).to.equal('7月15日(火)');

      // The month/day line precedes the weekday line
      calendar.headerOrientation = 'vertical';
      await elementUpdated(calendar);

      expect(dom.header.date.querySelector('br')).to.exist;
      expect(lines()).to.eql(['7月15日', '火']);

      calendar.locale = 'en';
      await elementUpdated(calendar);

      expect(lines()).to.eql(['Tue', 'Jul 15']);
    });

    it('orders the month and year navigation buttons per locale', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar
          locale="ja"
          .activeDate=${july.native}
        ></igc-calendar>`
      );
      const dom = getCalendarDOM(calendar);
      const pickers = () =>
        Array.from(dom.navigation.months.parentElement!.children).map(
          (element) => element.getAttribute('part')
        );

      expect(pickers()).to.eql(['years-navigation', 'months-navigation']);
      expect(dom.navigation.months.textContent!.trim()).to.equal('7月');
      expect(dom.navigation.years.textContent!.trim()).to.equal('2025年');

      calendar.locale = 'en';
      await elementUpdated(calendar);

      expect(pickers()).to.eql(['months-navigation', 'years-navigation']);
      expect(dom.navigation.months.textContent!.trim()).to.equal('July');
      expect(dom.navigation.years.textContent!.trim()).to.equal('2025');
    });
  });
});

function createCalendarElement(template?: TemplateResult) {
  return fixture<IgcCalendarComponent>(
    template ?? html`<igc-calendar></igc-calendar>`
  );
}
