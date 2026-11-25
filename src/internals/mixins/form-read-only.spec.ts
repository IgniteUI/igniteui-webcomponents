import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import IgcDatePickerComponent from '../../components/date-picker/date-picker.js';
import IgcDateRangePickerComponent from '../../components/date-range-picker/date-range-picker.js';
import IgcDateTimeInputComponent from '../../components/date-time-input/date-time-input.js';
import IgcInputComponent from '../../components/input/input.js';
import IgcMaskInputComponent from '../../components/mask-input/mask-input.js';
import IgcRatingComponent from '../../components/rating/rating.js';
import IgcTextareaComponent from '../../components/textarea/textarea.js';
import { defineComponents } from '../definitions/defineComponents.js';
import { createFormAssociatedTestBed } from '../testing/form-testbed.spec.js';
import { attributeWrites } from '../testing/helpers.spec.js';
import type { IgcFormControl } from './forms/types.js';

type ReadOnlyControl = IgcFormControl & { readOnly: boolean };

const controls = [
  IgcDatePickerComponent,
  IgcDateRangePickerComponent,
  IgcDateTimeInputComponent,
  IgcInputComponent,
  IgcMaskInputComponent,
  IgcRatingComponent,
  IgcTextareaComponent,
];

describe('Form control readOnly', () => {
  before(() => defineComponents(...controls));

  for (const { tagName } of controls) {
    it(`${tagName}: takes the control out of validation at once`, async () => {
      const tag = unsafeStatic(tagName);
      const control = await fixture<ReadOnlyControl>(html`<${tag}></${tag}>`);

      control.readOnly = true;
      expect(control.willValidate).to.be.false;

      control.readOnly = false;
      expect(control.willValidate).to.be.true;
    });
  }

  describe('attribute', () => {
    let input: IgcInputComponent;

    beforeEach(async () => {
      input = await fixture<IgcInputComponent>(html`<igc-input></igc-input>`);
    });

    it('is written once for a change', () => {
      const writes = attributeWrites(input, 'readonly', () => {
        input.readOnly = true;
        input.readOnly = true;
      });

      expect(writes).to.equal(1);
    });

    it('is absent for undefined', () => {
      input.readOnly = undefined as unknown as boolean;
      expect(input.hasAttribute('readonly')).to.be.false;

      input.readOnly = true;
      input.readOnly = undefined as unknown as boolean;
      expect(input.hasAttribute('readonly')).to.be.false;
      expect(input.readOnly).to.be.undefined;
    });

    it('sets the property, with no second write', () => {
      expect(
        attributeWrites(input, 'readonly', () =>
          input.setAttribute('readonly', '')
        )
      ).to.equal(1);
      expect(input.readOnly).to.be.true;

      expect(
        attributeWrites(input, 'readonly', () =>
          input.removeAttribute('readonly')
        )
      ).to.equal(1);
      expect(input.readOnly).to.be.false;
    });

    it('stays through an upgrade', async () => {
      const tag = `read-only-upgrade-${crypto.randomUUID()}`;
      const parent = await fixture<HTMLDivElement>(html`<div></div>`);
      parent.innerHTML = `<${tag} readonly></${tag}>`;

      customElements.define(tag, class extends IgcInputComponent {});
      const control = parent.firstElementChild as IgcInputComponent;

      expect(control.readOnly).to.be.true;
      expect(control.hasAttribute('readonly')).to.be.true;
    });
  });

  it('lets the form submit a required empty control that becomes read-only', async () => {
    const spec = createFormAssociatedTestBed<IgcInputComponent>(
      html`<igc-input name="field" required></igc-input>`
    );
    await spec.setup(IgcInputComponent.tagName);

    spec.assertSubmitFails();

    spec.element.readOnly = true;

    spec.assertSubmitPasses();
  });
});
