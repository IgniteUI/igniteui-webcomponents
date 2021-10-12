import {
  expect,
  fixture,
  html,
  unsafeStatic,
  elementUpdated,
} from '@open-wc/testing';
import { IgcCalendarComponent } from './calendar';
import '../../../igniteui-webcomponents';

describe('Calendar Rendering', () => {
  let el: IgcCalendarComponent;

  describe('Days view', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      el.activeView = 'days';
      el.size = 'large';
      await elementUpdated(el);
    });

    it('passes the a11y audit', async () => {
      expect(el).shadowDom.to.be.accessible();
    });

    it('successfully switches next month by pressing PageDown', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentMonth = el.activeDate.getMonth();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true })
      );
      await elementUpdated(el);

      const nextMonth = el.activeDate.getMonth();
      expect(nextMonth).to.equal(currentMonth + 1);
    });

    it('successfully switches next year by pressing Shift + PageDown', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentYear = el.activeDate.getFullYear();

      daysView?.dispatchEvent(
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

    it('successfully switches previous month by pressing PageUp', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentMonth = el.activeDate.getMonth();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true })
      );
      await elementUpdated(el);

      const nextMonth = el.activeDate.getMonth();
      expect(nextMonth).to.equal(currentMonth - 1);
    });

    it('successfully switches previous year by pressing Shift + PageUp', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentYear = el.activeDate.getFullYear();

      daysView?.dispatchEvent(
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

    it('successfully switches next day by pressing ArrowRight', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentDay = el.activeDate.getDate();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
      await elementUpdated(el);

      const nextDay = el.activeDate.getDate();
      expect(nextDay).to.equal(currentDay + 1);
    });

    it('successfully switches previous day by pressing ArrowLeft', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentDay = el.activeDate.getDate();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      );
      await elementUpdated(el);

      const previousDay = el.activeDate.getDate();
      expect(previousDay).to.equal(currentDay - 1);
    });

    it('successfully switches previous week by pressing ArrowUp', async () => {
      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentTime = daysView?.activeDate.getTime();
      const lastWeekTime = new Date(
        currentTime! - 7 * 24 * 60 * 60 * 1000
      ).getDate();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      );
      await elementUpdated(el);

      const activeDate = daysView?.activeDate.getDate();
      expect(activeDate).to.equal(lastWeekTime);
    });

    it('successfully switches next week by pressing ArrowDown', async () => {
      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const currentTime = daysView?.activeDate.getTime();
      const lastWeekTime = new Date(
        currentTime! + 7 * 24 * 60 * 60 * 1000
      ).getDate();

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      await elementUpdated(el);

      const activeDate = daysView?.activeDate.getDate();
      expect(activeDate).to.equal(lastWeekTime);
    });

    it('successfully switches first day of month by pressing Home', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      expect(el.activeDate.getDate()).to.equal(17);

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      expect(el.activeDate.getDate()).to.equal(1);
    });

    it('successfully switches first day of month by pressing End', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      expect(el.activeDate.getDate()).to.equal(17);

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      expect(el.activeDate.getDate()).to.equal(31);
    });

    it('successfully focuses date by pressing Enter', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const day = daysView?.shadowRoot?.querySelector(
        'span[part="date-inner single"]'
      ) as HTMLElement;

      day.focus();
      await elementUpdated(el);

      day.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
      await elementUpdated(el);

      expect((el.value as Date).getUTCDate()).to.equal(1);
    });

    it('successfully focuses date by pressing space', async () => {
      el.activeDate = new Date(2021, 6, 17);

      const daysView = el.shadowRoot?.querySelector('igc-days-view');
      const day = daysView?.shadowRoot?.querySelector(
        'span[part="date-inner single"]'
      ) as HTMLElement;
      expect(el.value).to.be.undefined;

      day.focus();
      await elementUpdated(el);

      day.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      );
      await elementUpdated(el);

      expect((el.value as Date).getUTCDate()).to.equal(1);
    });
  });

  describe('Months view', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      el.activeView = 'months';
      el.size = 'large';
      await elementUpdated(el);
    });

    it('successfully switches to first month by pressing Home', async () => {
      const daysView = el.shadowRoot?.querySelector('igc-months-view');

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      const month = el.activeDate.getMonth();
      expect(month).to.equal(0);
    });

    it('successfully switches to last month by pressing End', async () => {
      const daysView = el.shadowRoot?.querySelector('igc-months-view');

      daysView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      const month = el.activeDate.getMonth();
      expect(month).to.equal(11);
    });

    it('successfully switches to previous month by pressing PageUp', async () => {
      const btn = el.shadowRoot?.querySelector(
        'button[part="years-navigation"]'
      );
      const year = Number(btn?.textContent?.trim());

      await switchMonth(el, 'PageUp');

      const previousYear = Number(btn?.textContent?.trim());

      expect(previousYear).to.equal(year - 1);
    });

    it('successfully switches to next month by pressing PageDown', async () => {
      const btn = el.shadowRoot?.querySelector(
        'button[part="years-navigation"]'
      );
      const year = Number(btn?.textContent?.trim());

      await switchMonth(el, 'PageDown');

      const nextYear = Number(btn?.textContent?.trim());

      expect(nextYear).to.equal(year + 1);
    });

    it('successfully switches month by pressing ArrowRight', async () => {
      await switchMonth(el, 'ArrowRight');

      const month = el.activeDate.getMonth();
      expect(month).to.equal(1);
    });

    it('successfully switches month by pressing ArrowLeft', async () => {
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
      const monthsView = el.shadowRoot?.querySelector('igc-months-view');

      expect(el.activeView).to.equal('months');

      const month = monthsView?.shadowRoot?.querySelectorAll(
        'span[part="month-inner"]'
      )[0] as HTMLElement;
      month.focus();
      await elementUpdated(el);

      month.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('days');
    });

    it('successfully focuses month by pressing space', async () => {
      const monthsView = el.shadowRoot?.querySelector('igc-months-view');

      expect(el.activeView).to.equal('months');

      const month = monthsView?.shadowRoot?.querySelectorAll(
        'span[part="month-inner"]'
      )[0] as HTMLElement;
      month.focus();
      await elementUpdated(el);

      month.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('days');
    });

    const switchMonth = async (el: IgcCalendarComponent, btn: string) => {
      const monthsView = el.shadowRoot?.querySelector('igc-months-view');

      // focus first month
      monthsView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      monthsView?.dispatchEvent(
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
    });

    it('successfully switches to first year by pressing Home', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;

      yearsView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      );
      await elementUpdated(el);

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches to last year by pressing Home', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const yearsEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      );
      const lastYear = yearsEl![yearsEl!.length - 1];

      yearsView?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      );
      await elementUpdated(el);

      const year = el.activeDate.getFullYear();
      expect(lastYear).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing ArrowRight', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[1];

      await switchYear(yearsView, 'ArrowRight');

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing ArrowLeft', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const yearsEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      );
      const lastYear = yearsEl![yearsEl!.length - 1];

      await switchYear(yearsView, 'ArrowLeft');

      const year = el.activeDate.getFullYear();
      expect(lastYear).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing ArrowUp', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'ArrowUp');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear - 3);
    });

    it('successfully switches year by pressing ArrowDown', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[3];

      await switchYear(yearsView, 'ArrowDown');

      const year = el.activeDate.getFullYear();
      expect(firstYearEl).lightDom.to.equal(`${year}`);
    });

    it('successfully switches year by pressing PageUp', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'PageUp');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear - 15);
    });

    it('successfully switches year by pressing PageDown', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;
      const firstYearEl = yearsView.shadowRoot?.querySelector(
        'span[part="year-inner"]'
      ) as Element;
      const firstYear = Number(firstYearEl.textContent?.trim());

      await switchYear(yearsView, 'PageDown');

      const year = el.activeDate.getFullYear();
      expect(year).to.equal(firstYear + 15);
    });

    it('successfully focuses year by pressing Enter', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;

      expect(el.activeView).to.equal('years');

      const year = yearsView?.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[0] as HTMLElement;
      year.focus();
      await elementUpdated(el);

      year.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('months');
    });

    it('successfully focuses year by pressing space', async () => {
      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view'
      ) as Element;

      expect(el.activeView).to.equal('years');

      const year = yearsView?.shadowRoot?.querySelectorAll(
        'span[part="year-inner"]'
      )[0] as HTMLElement;
      year.focus();
      await elementUpdated(el);

      year.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      await elementUpdated(el);

      expect(el.activeView).to.equal('months');
    });
  });

  const createCalendarElement = (template = '<igc-calendar/>') => {
    return fixture<IgcCalendarComponent>(html`${unsafeStatic(template)}`);
  };

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
