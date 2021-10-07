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

  describe('', async () => {
    beforeEach(async () => {
      el = await createCalendarElement();
    });

    it('passes the a11y audit', async () => {
      expect(el).shadowDom.to.be.accessible();
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
            <div>
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
            'size',
            'exportparts',
          ],
          ignoreChildren: ['span', 'button'],
        }
      );
    });

    it('successfully enable hideOutsideDays', async () => {
      el.hideOutsideDays = true;
      expect(el.hideOutsideDays).to.equal(true);
      await elementUpdated(el);

      const daysViewEl = el.shadowRoot?.querySelector(
        'igc-days-view'
      ) as Element;
      const content = daysViewEl.shadowRoot?.querySelector(
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

    it('successfully enables and disables hasHeader', async () => {
      el.hasHeader = false;
      expect(el.hasHeader).to.equal(false);

      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `
      <div part="content">
      </div>
      `,
        { ignoreChildren: ['div'], ignoreAttributes: ['style'] }
      );

      el.hasHeader = true;
      expect(el.hasHeader).to.equal(true);

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
        `
      <igc-calendar header-orientation="horizontal"></igc-calendar>
      `,
        { ignoreAttributes: ['size'] }
      );

      el.headerOrientation = 'vertical';
      expect(el.headerOrientation).to.equal('vertical');

      await elementUpdated(el);

      expect(el).dom.to.equal(
        `
      <igc-calendar header-orientation="vertical"></igc-calendar>
      `,
        { ignoreAttributes: ['size'] }
      );
    });

    it('successfully changes size', async () => {
      expect(el).dom.to.equal(
        `
      <igc-calendar size="large"></igc-calendar>
      `,
        { ignoreAttributes: ['header-orientation'] }
      );

      el.size = 'medium';
      expect(el.size).to.equal('medium');

      await elementUpdated(el);

      expect(el).dom.to.equal(
        `
      <igc-calendar size="medium"></igc-calendar>
      `,
        { ignoreAttributes: ['header-orientation'] }
      );

      el.size = 'small';
      expect(el.size).to.equal('small');

      await elementUpdated(el);

      expect(el).dom.to.equal(
        `
      <igc-calendar size="small"></igc-calendar>
      `,
        { ignoreAttributes: ['header-orientation'] }
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
      const daysView = el.shadowRoot?.querySelector(
        'div[part=days-view-container]'
      ) as Element;
      expect(daysView).to.not.be.null;

      el.activeView = 'months';

      await elementUpdated(el);

      const monthsView = el.shadowRoot?.querySelector(
        'igc-months-view[part=months-view]'
      ) as Element;
      expect(monthsView).to.not.be.null;

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

      const daysViewEl = el.shadowRoot?.querySelector(
        'igc-days-view[part="days-view"]'
      ) as Element;
      let weekNumber = daysViewEl.shadowRoot?.querySelector(
        'span[part="week-number"]'
      ) as Element;
      expect(weekNumber).to.not.be.null;

      el.showWeekNumbers = false;
      expect(el.showWeekNumbers).to.be.false;
      await elementUpdated(el);

      weekNumber = daysViewEl.shadowRoot?.querySelector(
        'span[part="week-number"]'
      ) as Element;

      expect(weekNumber).to.be.null;
    });

    it('successfully switches weekStart', async () => {
      el.weekStart = 'wednesday';
      expect(el.weekStart).to.equal('wednesday');
      await elementUpdated(el);

      const daysViewEl = el.shadowRoot?.querySelector(
        'igc-days-view[part="days-view"]'
      ) as Element;
      const weekDay = daysViewEl.shadowRoot?.querySelector(
        'span[part="label"]'
      ) as Element;
      const attr = weekDay.getAttribute('aria-label');
      expect(attr).to.equal('Wednesday');
    });

    it('successfully changes weekDayFormat', async () => {
      el.formatOptions = {
        weekday: 'short',
      };

      expect(el.formatOptions.weekday).to.equal('short');
      await elementUpdated(el);

      const daysViewEl = el.shadowRoot?.querySelector(
        'igc-days-view[part="days-view"]'
      ) as Element;
      const weekDay = daysViewEl.shadowRoot?.querySelector(
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
      expect(month).lightDom.to.equal(`7`);

      el.formatOptions = {
        month: '2-digit',
      };

      expect(el.formatOptions.month).to.equal('2-digit');
      await elementUpdated(el);

      expect(month).lightDom.to.equal(`07`);

      el.formatOptions = {
        month: 'long',
      };

      expect(el.formatOptions.month).to.equal('long');
      await elementUpdated(el);

      expect(month).lightDom.to.equal(`July`);

      el.formatOptions = {
        month: 'short',
      };

      expect(el.formatOptions.month).to.equal('short');
      await elementUpdated(el);

      expect(month).lightDom.to.equal(`Jul`);

      el.formatOptions = {
        month: 'narrow',
      };

      expect(el.formatOptions.month).to.equal('narrow');
      await elementUpdated(el);

      expect(month).lightDom.to.equal(`J`);
    });

    it('successfully changes title', async () => {
      el.title = 'New Title';
      expect(el.title).to.equal('New Title');
      await elementUpdated(el);

      expect(el).dom.to.equal(
        `
      <igc-calendar title="New Title"></igc-calendar>
      `,
        { ignoreAttributes: ['header-orientation', 'size'] }
      );
    });

    const createCalendarElement = (template = '<igc-calendar/>') => {
      return fixture<IgcCalendarComponent>(html`${unsafeStatic(template)}`);
    };
  });
});
