import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import IgcCalendarComponent from '../calendar/calendar.js';
import { CalendarDay } from '../calendar/model.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDateRangePickerComponent from './date-range-picker.js';

describe('Date range picker', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let _dateTimeInput: IgcDateTimeInputComponent;
  let calendar: IgcCalendarComponent;
  const date_1 = new CalendarDay({ year: 2025, month: 2, date: 19 });
  const date_2 = date_1.set({ date: 22 });
  const date_1_str = date_1.native.toISOString();
  const date_2_str = date_2.native.toISOString();

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
    );
    _dateTimeInput = picker.renderRoot.querySelector(
      IgcDateTimeInputComponent.tagName
    )!;

    calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;
  });

  describe('Rendering and initialization', () => {
    it('is defined', async () => {
      expect(picker).is.not.undefined;
    });

    it('is accessible (closed state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state) - default dropdown mode', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state) - dialog mode', async () => {
      picker.open = true;
      picker.mode = 'dialog';
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('should not render title slot elements in dropdown mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dropdown">
          <p slot="title">Custom title</p>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.be.null;
    });

    it('should render title slot elements in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dialog">
          <p slot="title">Custom title</p>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.not.be.null;
    });

    it('should be successfully initialized with value', async () => {
      const expectedValue = [new Date(2024, 2, 19), new Date(2025, 2, 20)];
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );
      _dateTimeInput = picker.renderRoot.querySelector(
        IgcDateTimeInputComponent.tagName
      )!;

      expect(picker.value).not.to.be.null;
      expect(picker.value).to.deep.equal(expectedValue);
    });

    it('should be successfully initialized in open state in dropdown mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker open></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dropdown');
      await picker.show();

      const popover = picker.renderRoot.querySelector('igc-popover');
      expect(popover).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.have.tagName('igc-focus-trap');
    });

    it('should be successfully initialized in open state in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker open mode="dialog"></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dialog');
      await picker.show();

      const dialog = picker.renderRoot.querySelector('igc-dialog');
      expect(dialog).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.equal(dialog);
    });
  });
  describe('Selection via the calendar', () => {
    it('should select a single date in dropdown mode and emit igcChange', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.open = true;
      await elementUpdated(picker);

      calendar.values = `${date_1_str}`;

      expect(eventSpy).calledWith('igcChange');
      expect(picker.value?.length).to.equal(2);
      expect(picker.value?.[0]).to.deep.equal(date_1);
      expect(picker.value?.[1]).to.deep.equal(date_1);
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(false);
    });

    it('should select a range of dates in dropdown mode and emit igcChange', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.open = true;
      await elementUpdated(picker);

      calendar.values = `${date_1_str}, ${date_2_str}`;

      expect(eventSpy).calledWith('igcChange');
      expect(picker.value?.length).to.equal(2);
      expect(picker.value?.[0]).to.deep.equal(date_1);
      expect(picker.value?.[1]).to.deep.equal(date_2);
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(false);
    });

    it('should select a range of dates in dialog mode and emit igcChange when done is clicked', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.mode = 'dialog';
      await elementUpdated(picker);
      picker.open = true;
      await elementUpdated(picker);

      calendar.values = `${date_1_str}, ${date_2_str}`;

      expect(eventSpy).not.to.be.calledWith('igcChange');
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(true);

      const doneBtn = picker.shadowRoot!.querySelector(
        'igc-button[slot="footer"]:last-of-type'
      )!;
      doneBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(eventSpy).calledWith('igcChange');
      expect(picker.value?.length).to.equal(2);
      expect(picker.value?.[0]).to.deep.equal(date_1);
      expect(picker.value?.[1]).to.deep.equal(date_2);
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(false);
    });

    it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.value;
      picker.mode = 'dialog';
      await elementUpdated(picker);
      picker.open = true;
      await elementUpdated(picker);

      calendar.values = `${date_1_str}, ${date_2_str}`;

      expect(eventSpy).not.to.be.calledWith('igcChange');
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(true);

      const cancelBtn = picker.shadowRoot!.querySelector(
        'igc-button[slot="footer"]'
      )!;
      cancelBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(eventSpy).not.to.be.calledWith('igcChange');
      expect(picker.value?.length).to.equal(2);
      expect(picker.value?.[0]).to.deep.equal(date_1);
      expect(picker.value?.[1]).to.deep.equal(date_2);
      expect(
        picker.shadowRoot!.querySelector('igc-popover')?.hasAttribute('open')
      ).to.equal(false);
    });
  });
});
