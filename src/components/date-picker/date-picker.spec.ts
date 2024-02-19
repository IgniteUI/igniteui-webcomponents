import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import IgcDatepickerComponent from './date-picker.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';

describe('Date picker', () => {
  before(() => defineComponents(IgcDatepickerComponent));

  let picker: IgcDatepickerComponent;
  let dateTimeInput: IgcDateTimeInputComponent;

  describe('Default', () => {
    beforeEach(async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker></igc-datepicker>`
      );
      dateTimeInput = picker.shadowRoot!.querySelector(
        IgcDateTimeInputComponent.tagName
      ) as IgcDateTimeInputComponent;
    });

    it('is defined', async () => {
      expect(picker).is.not.undefined;
    });

    it('is accessible (closed state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    describe('Localization', () => {
      it('should set inputFormat correctly', async () => {
        const testFormat = 'dd--MM--yyyy';
        picker.inputFormat = testFormat;
        await elementUpdated(picker);

        expect(dateTimeInput.inputFormat).to.equal(testFormat);
      });

      it('should set displayFormat correctly', async () => {
        let testFormat = 'dd-MM-yyyy';
        picker.displayFormat = testFormat;
        await elementUpdated(picker);

        expect(dateTimeInput.displayFormat).to.equal(testFormat);

        // set via attribute
        testFormat = 'dd--MM--yyyy';
        picker.setAttribute('display-format', testFormat);
        await elementUpdated(picker);

        expect(dateTimeInput.displayFormat).to.equal(testFormat);
        expect(picker.displayFormat).not.to.equal(picker.inputFormat);
      });

      it('should properly set displayFormat to the set of predefined formats', async () => {
        const predefinedFormats = ['short', 'medium', 'long', 'full'];

        for (let i = 0; i < predefinedFormats.length; i++) {
          const format = predefinedFormats[i];
          picker.displayFormat = format;
          await elementUpdated(picker);

          expect(dateTimeInput.displayFormat).to.equal(format + 'Date');
        }
      });

      it('should default inputFormat to whatever Intl.DateTimeFormat returns for the current locale', async () => {
        const defaultFormat = 'MM/dd/yyyy';
        expect(picker.locale).to.equal('en');
        expect(picker.inputFormat).to.equal(defaultFormat);

        picker.locale = 'fr';
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
      });

      it('should use the value of inputFormat for displayFormat, if it is not defined', async () => {
        expect(picker.locale).to.equal('en');
        expect(picker.getAttribute('display-format')).to.be.null;
        expect(picker.displayFormat).to.equal(picker.inputFormat);

        // updates inputFormat according to changed locale
        picker.locale = 'fr';
        await elementUpdated(picker);
        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);

        // sets inputFormat as attribute
        picker.setAttribute('input-format', 'dd-MM-yyyy');
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd-MM-yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);
      });
    });
  });
});
