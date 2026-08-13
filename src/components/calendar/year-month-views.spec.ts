import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import IgcMonthsViewComponent from './months-view/months-view.js';
import IgcYearsViewComponent from './years-view/years-view.js';

describe('Year and month calendar views', () => {
  before(() => {
    defineComponents(IgcMonthsViewComponent, IgcYearsViewComponent);
  });

  /** A value far enough from today that no cell is rendered as `current`. */
  const value = new CalendarDay({ year: 2001, month: 6, date: 1 });

  function cellsOf(view: IgcMonthsViewComponent | IgcYearsViewComponent) {
    return Array.from(
      view.shadowRoot!.querySelectorAll<HTMLElement>('[role="gridcell"]')
    );
  }

  function rowsOf(view: IgcMonthsViewComponent | IgcYearsViewComponent) {
    return Array.from(
      view.shadowRoot!.querySelectorAll<HTMLElement>('[role="row"]')
    );
  }

  describe('Months view', () => {
    let view: IgcMonthsViewComponent;

    beforeEach(async () => {
      view = await fixture<IgcMonthsViewComponent>(
        html`<igc-months-view .value=${value.native}></igc-months-view>`
      );
    });

    it('passes the a11y audit', async () => {
      await expect(view).shadowDom.to.be.accessible();
    });

    it('renders a grid of 12 months in rows of 3', () => {
      const rows = rowsOf(view);

      expect(view.role).to.equal('grid');
      expect(rows).lengthOf(4);
      expect(cellsOf(view)).lengthOf(12);

      for (const row of rows) {
        expect(row.part.value).to.equal('months-row');
        expect(row.children).lengthOf(3);
      }
    });

    it('renders the expected parts and ARIA state on a cell', () => {
      const cells = cellsOf(view);
      const [january, july] = [firstOf(cells), cells[6]];

      // The selected month
      expect(july.part.value).to.equal('month-inner selected');
      expect(july.parentElement!.part.value).to.equal('month selected');
      expect(july).to.have.attribute('aria-selected', 'true');
      expect(july).to.have.attribute('aria-label', 'July 2001');
      expect(july).to.have.attribute('tabindex', '0');
      expect(july).to.have.attribute('data-value', '6');
      expect(july.innerText).to.equal('July');

      expect(january.part.value).to.equal('month-inner');
      expect(january.parentElement!.part.value).to.equal('month');
      expect(january).to.have.attribute('aria-selected', 'false');
      expect(january).to.have.attribute('aria-label', 'January 2001');
      expect(january).to.have.attribute('tabindex', '-1');
      expect(january).to.have.attribute('data-value', '0');
    });

    it('marks the current month', async () => {
      const today = CalendarDay.today;
      view.value = today.native;
      await elementUpdated(view);

      const current = cellsOf(view)[today.month];

      expect(current.part.contains('current')).to.be.true;
      expect(current.parentElement!.part.contains('current')).to.be.true;
    });

    it('exposes a single tab stop', () => {
      expect(cellsOf(view).filter((cell) => cell.tabIndex === 0)).lengthOf(1);
    });

    it('follows `monthFormat` and `locale`', async () => {
      view.monthFormat = 'short';
      await elementUpdated(view);
      expect(firstOf(cellsOf(view)).innerText).to.equal('Jan');

      view.locale = 'de';
      view.monthFormat = 'long';
      await elementUpdated(view);
      expect(firstOf(cellsOf(view)).innerText).to.equal('Januar');
    });

    it('emits `igcChange` with the activated month', async () => {
      const eventSpy = spy(view, 'emitEvent');

      simulateClick(cellsOf(view)[2]);
      await elementUpdated(view);

      expect(eventSpy).calledOnceWith('igcChange', {
        detail: value.set({ month: 2 }).native,
      });
      expect(view.value).to.eql(value.set({ month: 2 }).native);
    });
  });

  describe('Years view', () => {
    let view: IgcYearsViewComponent;

    beforeEach(async () => {
      view = await fixture<IgcYearsViewComponent>(
        html`<igc-years-view .value=${value.native}></igc-years-view>`
      );
    });

    it('passes the a11y audit', async () => {
      await expect(view).shadowDom.to.be.accessible();
    });

    it('renders a page of years in rows of 3', () => {
      const rows = rowsOf(view);
      const cells = cellsOf(view);

      expect(view.role).to.equal('grid');
      expect(rows).lengthOf(5);
      expect(cells).lengthOf(view.yearsPerPage);

      for (const row of rows) {
        expect(row.part.value).to.equal('years-row');
      }

      // The page containing 2001 with the default 15 years per page
      expect(firstOf(cells).innerText).to.equal('1995');
      expect(lastOf(cells).innerText).to.equal('2009');
    });

    it('renders the expected parts and ARIA state on a cell', () => {
      const cells = cellsOf(view);
      const selected = cells[6];

      expect(selected.innerText).to.equal('2001');
      expect(selected.part.value).to.equal('year-inner selected');
      expect(selected.parentElement!.part.value).to.equal('year selected');
      expect(selected).to.have.attribute('aria-selected', 'true');
      expect(selected).to.have.attribute('tabindex', '0');
      expect(selected).to.have.attribute('data-value', '2001');

      // The visible year is the whole label, so no redundant aria-label is rendered
      expect(selected).to.not.have.attribute('aria-label');

      expect(firstOf(cells).part.value).to.equal('year-inner');
      expect(firstOf(cells)).to.have.attribute('tabindex', '-1');
    });

    it('marks the current year', async () => {
      const today = CalendarDay.today;
      view.value = today.native;
      await elementUpdated(view);

      const current = cellsOf(view).find(
        (cell) => cell.dataset.value === `${today.year}`
      )!;

      expect(current.part.contains('current')).to.be.true;
    });

    it('follows `yearsPerPage`', async () => {
      view.yearsPerPage = 9;
      await elementUpdated(view);

      const cells = cellsOf(view);

      expect(cells).lengthOf(9);
      expect(rowsOf(view)).lengthOf(3);
      expect(firstOf(cells).innerText).to.equal('1998');
      expect(lastOf(cells).innerText).to.equal('2006');
    });

    it('emits `igcChange` with the activated year', async () => {
      const eventSpy = spy(view, 'emitEvent');

      simulateClick(firstOf(cellsOf(view)));
      await elementUpdated(view);

      expect(eventSpy).calledOnceWith('igcChange', {
        detail: value.set({ year: 1995 }).native,
      });
      expect(view.value).to.eql(value.set({ year: 1995 }).native);
    });
  });
});
