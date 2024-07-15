import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { IgcCalendarComponent, defineComponents } from '../../index.js';
import type IgcDaysViewComponent from './days-view/days-view.js';
import type IgcMonthsViewComponent from './months-view/months-view.js';

describe('Calendar Rendering', () => {
  before(() => {
    defineComponents(IgcCalendarComponent);
  });

  let el: IgcCalendarComponent;
  let daysView: IgcDaysViewComponent;

  describe('', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
      daysView = el.shadowRoot?.querySelector(
        'igc-days-view'
      ) as IgcDaysViewComponent;
    });

    it('passes the a11y audit', async () => {
      await expect(el).shadowDom.to.be.accessible();
    });

    it('renders calendar successfully', async () => {
      expect(el).shadowDom.to.equal(
        `
      <div part="header">
        <h5 part="header-title">
          <slot name="title">Select date</slot>
        </h5>
	      <h2 part="header-date">Selected date</h2>
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
        {
          ignoreAttributes: [
            'style',
            'aria-label',
            'aria-live',
            'collection',
            'name',
            'role',
            'exportparts',
          ],
          ignoreChildren: ['span', 'button'],
        }
      );
    });

    it('successfully enable hideOutsideDays', async () => {
      el.activeDate = new Date(2022, 3, 10);
      el.hideOutsideDays = true;
      expect(el.hideOutsideDays).to.equal(true);
      await elementUpdated(el);

      const content = daysView.shadowRoot?.querySelector(
        'div[part="days-row"]'
      ) as Element;
      const datePart = content.children[0].getAttribute('part');

      expect(datePart).to.contain('hidden');
    });

    it('successfully changes orientation', async () => {
      const content = el.shadowRoot?.querySelector(
        'div[part=content]'
      ) as Element;
      const computedStyles = window.getComputedStyle(content);

      expect(computedStyles.getPropertyValue('flex-direction')).to.equal('row');

      el.orientation = 'vertical';
      expect(el.orientation).to.equal('vertical');
      await elementUpdated(el);

      expect(computedStyles.getPropertyValue('flex-direction')).to.equal(
        'column'
      );
    });

    it('successfully enables and disables hideHeader', async () => {
      el.hideHeader = true;
      expect(el.hideHeader).to.equal(true);

      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `
      <div part="content">
      </div>
      `,
        { ignoreChildren: ['div'], ignoreAttributes: ['style'] }
      );

      el.hideHeader = false;
      expect(el.hideHeader).to.equal(false);

      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `
      <div part="header">
      </div>
      <div part="content">
      </div>
      `,
        { ignoreChildren: ['div'], ignoreAttributes: ['style'] }
      );
    });

    it('successfully changes header orientation', async () => {
      expect(el).dom.to.equal(
        '<igc-calendar header-orientation="horizontal"></igc-calendar>'
      );

      el.headerOrientation = 'vertical';
      expect(el.headerOrientation).to.equal('vertical');

      await elementUpdated(el);

      expect(el).dom.to.equal(
        '<igc-calendar header-orientation="vertical"></igc-calendar>'
      );
    });

    it('successfully adds a month', async () => {
      const content = el.shadowRoot?.querySelector(
        'div[part=content]'
      ) as Element;
      expect(content.children.length).to.equal(1);

      el.visibleMonths = 3;
      expect(el.visibleMonths).to.equal(3);
      await elementUpdated(el);

      expect(content.children.length).to.equal(3);
    });

    it('successfully changes active view', async () => {
      expect(daysView).to.not.be.null;

      let monthsView = el.shadowRoot?.querySelector(
        'igc-months-view'
      ) as IgcMonthsViewComponent;

      expect(monthsView).to.be.null;

      el.activeView = 'months';
      await elementUpdated(el);

      monthsView = el.shadowRoot?.querySelector(
        'igc-months-view'
      ) as IgcMonthsViewComponent;

      expect(monthsView).to.not.be.null;

      daysView = el.shadowRoot?.querySelector(
        'igc-days-view'
      ) as IgcDaysViewComponent;

      expect(daysView).to.be.null;

      el.activeView = 'years';
      await elementUpdated(el);

      const yearsView = el.shadowRoot?.querySelector(
        'igc-years-view[part=years-view]'
      ) as Element;
      expect(yearsView).to.not.be.null;
    });

    it('successfully changes selection', async () => {
      let headerPart = el.shadowRoot?.querySelector(
        'div[part="header"]'
      ) as Element;
      expect(headerPart).to.not.be.null;
      expect(el.selection).to.equal('single');

      el.selection = 'multiple';
      expect(el.selection).to.equal('multiple');

      await elementUpdated(el);

      headerPart = el.shadowRoot?.querySelector(
        'div[part="header"]'
      ) as Element;

      expect(headerPart).to.be.null;

      el.selection = 'range';
      expect(el.selection).to.equal('range');

      await elementUpdated(el);

      headerPart = el.shadowRoot?.querySelector(
        'div[part="header"]'
      ) as Element;
      expect(headerPart).to.not.be.null;
    });

    it('successfully shows week numbers', async () => {
      el.showWeekNumbers = true;
      expect(el.showWeekNumbers).to.be.true;
      await elementUpdated(el);

      let weekNumber = daysView.shadowRoot?.querySelector(
        'span[part="week-number"]'
      ) as Element;
      expect(weekNumber).to.not.be.null;

      el.showWeekNumbers = false;
      expect(el.showWeekNumbers).to.be.false;
      await elementUpdated(el);

      weekNumber = daysView.shadowRoot?.querySelector(
        'span[part="week-number"]'
      ) as Element;

      expect(weekNumber).to.be.null;
    });

    it('successfully switches weekStart', async () => {
      el.weekStart = 'wednesday';
      expect(el.weekStart).to.equal('wednesday');
      await elementUpdated(el);

      const weekDay = daysView.shadowRoot?.querySelector(
        'span[part="label"]'
      ) as Element;
      const attr = weekDay.getAttribute('aria-label');
      expect(attr).to.equal('Wednesday');
    });

    it('successfully changes weekDayFormat', async () => {
      el.formatOptions = {
        weekday: 'short',
      };
      el.weekStart = 'sunday';

      expect(el.formatOptions.weekday).to.equal('short');
      await elementUpdated(el);

      const weekDay = daysView.shadowRoot?.querySelector(
        'span[part="label-inner"]'
      ) as Element;
      expect(weekDay).lightDom.to.equal('Sun');

      el.formatOptions = {
        weekday: 'long',
      };

      expect(el.formatOptions.weekday).to.equal('long');
      await elementUpdated(el);

      expect(weekDay).lightDom.to.equal('Sunday');

      el.formatOptions = {
        weekday: 'narrow',
      };

      expect(el.formatOptions.weekday).to.equal('narrow');
      await elementUpdated(el);

      expect(weekDay).lightDom.to.equal('S');
    });

    it('successfully changes monthFormat', async () => {
      el.activeDate = new Date(2021, 6, 17);

      el.formatOptions = {
        month: 'numeric',
      };

      expect(el.formatOptions.month).to.equal('numeric');
      await elementUpdated(el);

      const month = el.shadowRoot?.querySelector(
        'button[part="months-navigation"]'
      ) as Element;
      expect(month).lightDom.to.equal('7');

      el.formatOptions = {
        month: '2-digit',
      };

      expect(el.formatOptions.month).to.equal('2-digit');
      await elementUpdated(el);

      expect(month).lightDom.to.equal('07');

      el.formatOptions = {
        month: 'long',
      };

      expect(el.formatOptions.month).to.equal('long');
      await elementUpdated(el);

      expect(month).lightDom.to.equal('July');

      el.formatOptions = {
        month: 'short',
      };

      expect(el.formatOptions.month).to.equal('short');
      await elementUpdated(el);

      expect(month).lightDom.to.equal('Jul');

      el.formatOptions = {
        month: 'narrow',
      };

      expect(el.formatOptions.month).to.equal('narrow');
      await elementUpdated(el);

      expect(month).lightDom.to.equal('J');
    });

    it('successfully changes title', async () => {
      el.title = 'New Title';
      expect(el.title).to.equal('New Title');
      await elementUpdated(el);

      expect(el).dom.to.equal(
        '<igc-calendar title="New Title"></igc-calendar>',
        { ignoreAttributes: ['header-orientation'] }
      );
    });

    it('successfully changes active date through attribute', async () => {
      el.setAttribute('active-date', '2022-02-02');
      await elementUpdated(el);

      const activeDateElement = () =>
        el
          .shadowRoot!.querySelector('igc-days-view')
          ?.shadowRoot!.querySelector('[tabindex="0"]');

      expect(el.activeDate.getFullYear()).to.equal(2022);
      expect(el.activeDate.getMonth()).to.equal(1);
      expect(el.activeDate.getDate()).to.equal(2);
      expect(activeDateElement()?.textContent?.trim()).to.equal('2');

      const today = new Date();

      el.setAttribute('active-date', '');
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(today.getFullYear());
      expect(el.activeDate.getMonth()).to.equal(today.getMonth());
      expect(el.activeDate.getDate()).to.equal(today.getDate());
      expect(activeDateElement()?.textContent?.trim()).to.equal(
        `${today.getDate()}`
      );
    });

    it('navigates to the initially set active date regardless of any value(s) set', async () => {
      // set as attribute in template and element has value set
      const activeDate = new Date('08/06/2023');
      const valueDate = new Date('06/06/2023');
      el = await fixture<IgcCalendarComponent>(
        html`<igc-calendar .activeDate="${activeDate}" .value=${valueDate} />`
      );
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(activeDate.getFullYear());
      expect(el.activeDate.getMonth()).to.equal(activeDate.getMonth());
      expect(el.activeDate.getDate()).to.equal(activeDate.getDate());

      let headerDate = el.shadowRoot?.querySelector(
        '[part=header-date]'
      ) as Element;
      expect(headerDate.textContent).to.equal('Tue, Jun 6');

      let buttonMonthsNav = el.shadowRoot
        ?.querySelector('[part=navigation]')
        ?.querySelector('button[part=months-navigation]') as Element;

      expect(buttonMonthsNav.textContent).to.contain('August');

      // set through code and element has values set
      const valueDates = [new Date('06/06/2023'), new Date('06/09/2023')];

      el = await fixture<IgcCalendarComponent>(
        html`<igc-calendar .values="${valueDates}" .selection="${'range'}" />`
      );
      el.activeDate = activeDate;
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(activeDate.getFullYear());
      expect(el.activeDate.getMonth()).to.equal(activeDate.getMonth());
      expect(el.activeDate.getDate()).to.equal(activeDate.getDate());

      headerDate = el.shadowRoot?.querySelector(
        '[part=header-date]'
      ) as Element;

      expect(headerDate.textContent)
        .to.contain('Jun 6')
        .and.to.contain('-')
        .and.to.contain('Jun 9');

      buttonMonthsNav = el.shadowRoot
        ?.querySelector('[part=navigation]')
        ?.querySelector('button[part=months-navigation]') as Element;

      expect(buttonMonthsNav.textContent).to.contain('August');
    });

    it('navigates to the current date if no initial active date is set and no value(s) are set', async () => {
      const today = new Date();
      el = await fixture<IgcCalendarComponent>(html`<igc-calendar />`);
      await elementUpdated(el);
      expect(el.activeDate.getFullYear()).to.equal(today.getFullYear());
      expect(el.activeDate.getMonth()).to.equal(today.getMonth());
      expect(el.activeDate.getDate()).to.equal(today.getDate());
    });

    it("navigates to the date set as value initially, selection 'single', no activeDate explicitly set", async () => {
      const valueDate = new Date('08/06/2023');
      el = await fixture<IgcCalendarComponent>(
        html`<igc-calendar .value="${valueDate}" />`
      );
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(valueDate.getFullYear());
      expect(el.activeDate.getMonth()).to.equal(valueDate.getMonth());
      expect(el.activeDate.getDate()).to.equal(valueDate.getDate());

      const headerDate = el.shadowRoot?.querySelector(
        '[part=header-date]'
      ) as Element;
      expect(headerDate.textContent).to.equal('Sun, Aug 6');
    });

    it("navigates to the first date of the initially set values, selection 'range', no activeDate explicitly set", async () => {
      const valueDates = [new Date('08/06/2023'), new Date('08/09/2023')];
      el = await fixture<IgcCalendarComponent>(
        html`<igc-calendar .values="${valueDates}" .selection="${'range'}" />`
      );
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(valueDates[0].getFullYear());
      expect(el.activeDate.getMonth()).to.equal(valueDates[0].getMonth());
      expect(el.activeDate.getDate()).to.equal(valueDates[0].getDate());

      const headerDate = el.shadowRoot?.querySelector(
        '[part=header-date]'
      ) as Element;
      expect(headerDate.textContent)
        .to.contain('Aug 6')
        .and.to.contain('-')
        .and.to.contain('Aug 9');
    });

    it("navigates to the first date of the initially set values as attribute, selection 'multiple', no activeDate explicitly set", async () => {
      const valueDates = [new Date('08/06/2023'), new Date('08/09/2023')];
      el = await fixture<IgcCalendarComponent>(
        html`<igc-calendar
          .values="${valueDates}"
          .selection="${'multiple'}"
        />`
      );
      await elementUpdated(el);

      expect(el.activeDate.getFullYear()).to.equal(valueDates[0].getFullYear());
      expect(el.activeDate.getMonth()).to.equal(valueDates[0].getMonth());
      expect(el.activeDate.getDate()).to.equal(valueDates[0].getDate());

      const buttonMonthsNav = el.shadowRoot
        ?.querySelector('[part=navigation]')
        ?.querySelector('button[part=months-navigation]') as Element;
      expect(buttonMonthsNav.textContent).to.contain('August');
    });
  });
});

function createCalendarElement() {
  return fixture<IgcCalendarComponent>(html`<igc-calendar></igc-calendar>`);
}
