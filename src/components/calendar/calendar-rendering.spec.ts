import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import IgcCalendarComponent from './calendar.js';
import { getCalendarDOM, getDayViewDOM, getDOMDate } from './helpers.spec.js';
import { CalendarDay } from './model.js';
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
        <h5 part="header-title">
          <slot name="title">Select date</slot>
        </h5>
	      <h2 part="header-date">
          <slot>
            ${headerDate}
          </slot>
        </h2>
      </div>
      <div part="content">
        <div part="days-view-container">
          <div part="navigation">
            <div part="picker-dates">
              <button part="months-navigation"></button>
              <span class="aria-off-screen"></span>
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
      expect(first(titleSlot.assignedElements()).textContent).to.equal('Title');
    });

    it('should render header-date slot', async () => {
      calendar = await createCalendarElement(
        html`<igc-calendar><p slot="header-date">Header date</p></igc-calendar>`
      );

      const dateSlot =
        getCalendarDOM(calendar).header.date.querySelector('slot')!;

      expect(dateSlot.assignedElements()).lengthOf(1);
      expect(first(dateSlot.assignedElements()).textContent).to.equal(
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

    it('should change orientation', async () => {
      const dom = getCalendarDOM(calendar);

      expect(
        getComputedStyle(dom.content).getPropertyValue('flex-direction')
      ).to.equal('row');

      calendar.orientation = 'vertical';
      await elementUpdated(calendar);

      expect(
        getComputedStyle(dom.content).getPropertyValue('flex-direction')
      ).to.equal('column');
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

      expect(first(daysViewDOM.weekLabels)).attribute(
        'aria-label',
        'Wednesday'
      );
    });

    it('should change on `weekDayFormat`', async () => {
      const daysViewDOM = getDayViewDOM(getCalendarDOM(calendar).views.days);

      calendar.formatOptions = { weekday: 'short' };
      calendar.weekStart = 'sunday';
      await elementUpdated(calendar);

      expect(first(daysViewDOM.weekLabels).innerText).to.equal('Sun');

      calendar.formatOptions = { weekday: 'long' };
      await elementUpdated(calendar);

      expect(first(daysViewDOM.weekLabels).innerText).to.equal('Sunday');

      calendar.formatOptions = { weekday: 'narrow' };
      await elementUpdated(calendar);

      expect(first(daysViewDOM.weekLabels).innerText).to.equal('S');
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
  });
});

function createCalendarElement(template?: TemplateResult) {
  return fixture<IgcCalendarComponent>(
    template ?? html`<igc-calendar></igc-calendar>`
  );
}
