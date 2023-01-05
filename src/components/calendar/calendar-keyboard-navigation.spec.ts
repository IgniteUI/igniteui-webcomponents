import { expect, elementUpdated } from '@open-wc/testing';
import { IgcCalendarComponent } from '../../index.js';
import { createCalendarElement } from './calendar-rendering.spec';

describe('Calendar Rendering', () => {
  before(() => {
    IgcCalendarComponent.register();
  });

  let el: IgcCalendarComponent;
  let daysView: Element;
  let monthsView: Element;
  let yearsView: Element;

  describe('Days view', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      el.activeView = 'days';
      el.size = 'large';
      el.activeDate = new Date(2021, 6, 17);

      await elementUpdated(el);

      daysView = el.shadowRoot?.querySelector('igc-days-view') as Element;
    });

    it('passes the a11y audit', async () => {
      await expect(daysView).shadowDom.to.be.accessible();
    });

    it('successfully switches to next month by pressing PageDown', async () => {
      const currentMonth = el.activeDate.getMonth();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true })
      );
      await elementUpdated(el);

      const nextMonth = el.activeDate.getMonth();
      expect(nextMonth).to.equal(currentMonth + 1);
    });

    it('successfully switches to next year by pressing Shift + PageDown', async () => {
      const currentYear = el.activeDate.getFullYear();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'PageDown',
          bubbles: true,
          shiftKey: true,
        })
      );
      await elementUpdated(el);

      const nextYear = el.activeDate.getFullYear();
      expect(nextYear).to.equal(currentYear + 1);
    });

    it('successfully switches to previous month by pressing PageUp', async () => {
      const currentMonth = el.activeDate.getMonth();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true })
      );
      await elementUpdated(el);

      const nextMonth = el.activeDate.getMonth();
      expect(nextMonth).to.equal(currentMonth - 1);
    });

    it('successfully switches to previous year by pressing Shift + PageUp', async () => {
      const currentYear = el.activeDate.getFullYear();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'PageUp',
          bubbles: true,
          shiftKey: true,
        })
      );
      await elementUpdated(el);

      const nextYear = el.activeDate.getFullYear();
      expect(nextYear).to.equal(currentYear - 1);
    });

    it('successfully switches to next day by pressing ArrowRight', async () => {
      const currentDay = el.activeDate.getDate();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
      await elementUpdated(el);

      const nextDay = el.activeDate.getDate();
      expect(nextDay).to.equal(currentDay + 1);
    });

    it('successfully switches to previous day by pressing ArrowLeft', async () => {
      const currentDay = el.activeDate.getDate();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      );
      await elementUpdated(el);

      const previousDay = el.activeDate.getDate();
      expect(previousDay).to.equal(currentDay - 1);
    });

    it('successfully switches to previous week by pressing ArrowUp', async () => {
      const currentTime = el.activeDate.getTime();

      const lastWeekDate = new Date(
        currentTime! - 7 * 24 * 60 * 60 * 1000
      ).getDate();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );
      await elementUpdated(el);

      const activeDate = el.activeDate.getDate();

      expect(activeDate).to.equal(lastWeekDate);
    });

    it('successfully switches to next week by pressing ArrowDown', async () => {
      const currentTime = el.activeDate.getTime();

      const nextWeekDate = new Date(
        currentTime! + 7 * 24 * 60 * 60 * 1000
      ).getDate();

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      await elementUpdated(el);

      const activeDate = el.activeDate.getDate();
      expect(activeDate).to.equal(nextWeekDate);
    });

    it('successfully switches to first day of month by pressing Home', async () => {
      expect(el.activeDate.getDate()).to.equal(17);

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      expect(el.activeDate.getDate()).to.equal(1);
    });

    it('successfully switches to last day of month by pressing End', async () => {
      expect(el.activeDate.getDate()).to.equal(17);

      daysView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      expect(el.activeDate.getDate()).to.equal(31);
    });

    it('successfully focuses date by pressing Enter', async () => {
      const firstDay = daysView.shadowRoot?.querySelectorAll(
        'span[part="date-inner single"]'
      )[0] as HTMLElement;

      firstDay.focus();
      await elementUpdated(el);

      firstDay.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
      await elementUpdated(el);

      const timeZoneOffset = (el.value as Date).getTimezoneOffset() * 60000;

      const newDate = new Date((el.value as any) - timeZoneOffset);

      expect(newDate.getDate()).to.equal(1);
    });

    it('successfully focuses date by pressing Space', async () => {
      const firstDay = daysView.shadowRoot?.querySelectorAll(
        'span[part="date-inner single"]'
      )[0] as HTMLElement;

      firstDay.focus();
      await elementUpdated(el);

      firstDay.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      );
      await elementUpdated(el);

      const timeZoneOffset = (el.value as Date).getTimezoneOffset() * 60000;

      const newDate = new Date((el.value as any) - timeZoneOffset);

      expect(newDate.getDate()).to.equal(1);
    });
  });

  describe('Months view', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      el.activeView = 'months';
      el.size = 'large';

      await elementUpdated(el);

      monthsView = el.shadowRoot?.querySelector('igc-months-view') as Element;
    });

    it('successfully switches to first month by pressing Home', async () => {
      monthsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      const month = el.activeDate.getMonth();
      expect(month).to.equal(0);
    });

    it('successfully switches to last month by pressing End', async () => {
      monthsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      const month = el.activeDate.getMonth();
      expect(month).to.equal(11);
    });

    it('successfully switches to previous year by pressing PageUp', async () => {
      const btn = el.shadowRoot?.querySelector(
        'button[part="years-navigation"]'
      );
      const year = Number(btn?.textContent?.trim());

      await switchMonth(el, 'PageUp');

      const previousYear = Number(btn?.textContent?.trim());

      expect(previousYear).to.equal(year - 1);
    });

    it('successfully switches to next year by pressing PageDown', async () => {
      const btn = el.shadowRoot?.querySelector(
        'button[part="years-navigation"]'
      );
      const year = Number(btn?.textContent?.trim());

      await switchMonth(el, 'PageDown');

      const nextYear = Number(btn?.textContent?.trim());

      expect(nextYear).to.equal(year + 1);
    });

    it('successfully switches to next month by pressing ArrowRight', async () => {
      await switchMonth(el, 'ArrowRight');

      const month = el.activeDate.getMonth();
      expect(month).to.equal(1);
    });

    it('successfully switches to previous month by pressing ArrowLeft', async () => {
      await switchMonth(el, 'ArrowLeft');

      const month = el.activeDate.getMonth();
      expect(month).to.equal(11);
    });

    it('successfully switches month by pressing ArrowDown', async () => {
      await switchMonth(el, 'ArrowDown');

      const month = el.activeDate.getMonth();
      expect(month).to.equal(3);
    });

    it('successfully switches month by pressing ArrowUp', async () => {
      await switchMonth(el, 'ArrowUp');

      const month = el.activeDate.getMonth();
      expect(month).to.equal(9);
    });

    it('successfully focuses month by pressing Enter', async () => {
      expect(el.activeView).to.equal('months');

      const month = monthsView.shadowRoot?.querySelectorAll(
        'span[part="month-inner"]'
      )[0] as HTMLElement;
      month.focus();
      await elementUpdated(el);

      month.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('days');
    });

    it('successfully focuses month by pressing Space', async () => {
      expect(el.activeView).to.equal('months');

      const month = monthsView.shadowRoot?.querySelectorAll(
        'span[part="month-inner"]'
      )[0] as HTMLElement;
      month.focus();
      await elementUpdated(el);

      month.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('days');
    });

    const switchMonth = async (el: IgcCalendarComponent, btn: string) => {
      // focus first month
      monthsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      monthsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: btn, bubbles: true })
      );
      await elementUpdated(el);
    };
  });

  describe('Years view', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      el.activeView = 'years';
      el.size = 'large';

      await elementUpdated(el);

      yearsView = el.shadowRoot?.querySelector('igc-years-view') as Element;
    });

    it('successfully switches to first year by pressing Home', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;

      yearsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches to last year by pressing End', async () => {
      const yearsEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      );
      const lastYear = yearsEl![yearsEl!.length - 1];

      yearsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      const year = el.activeDate.getFullYear();
      expect(lastYear).lightDom.to.equal(`${year}`);
    });

    it('successfully switches to next year by pressing ArrowRight', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[1];

      await switchYear(yearsView, 'ArrowRight');

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches to previous year by pressing ArrowLeft', async () => {
      const yearsEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      );
      const lastYear = yearsEl![yearsEl!.length - 1];

      await switchYear(yearsView, 'ArrowLeft');

      const year = el.activeDate.getFullYear();
      expect(lastYear).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing ArrowUp', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'ArrowUp');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear - 3);
    });

    it('successfully switches year by pressing ArrowDown', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[3];

      await switchYear(yearsView, 'ArrowDown');

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing PageUp', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'PageUp');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear - 15);
    });

    it('successfully switches year by pressing PageDown', async () => {
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'PageDown');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear + 15);
    });

    it('successfully focuses year by pressing Enter', async () => {
      expect(el.activeView).to.equal('years');

      const year = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[0] as HTMLElement;
      year.focus();
      await elementUpdated(el);

      year.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('months');
    });

    it('successfully focuses year by pressing Space', async () => {
      expect(el.activeView).to.equal('years');

      const year = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[0] as HTMLElement;
      year.focus();
      await elementUpdated(el);

      year.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('months');
    });
  });

  const switchYear = async (yearsView: Element, btn: string) => {
    // focus first year
    yearsView.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );
    await elementUpdated(el);

    yearsView.dispatchEvent(
      new KeyboardEvent('keydown', { key: btn, bubbles: true })
    );
    await elementUpdated(el);
  };
});
