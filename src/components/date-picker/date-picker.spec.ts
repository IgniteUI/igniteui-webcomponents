import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import IgcDatepickerComponent from './date-picker.js';
import { defineComponents } from '../common/definitions/defineComponents.js';

describe('Date picker', () => {
  before(() => defineComponents(IgcDatepickerComponent));

  let picker: IgcDatepickerComponent;

  describe('Default', () => {
    beforeEach(async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker></igc-datepicker>`
      );
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
  });
});
