import { elementUpdated, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { defineComponents } from '../../internals/definitions/defineComponents.js';
import { ValidityHelpers } from '../../internals/testing/validity-helpers.spec.js';
import IgcInputComponent from '../input/input.js';

describe('Validation container', () => {
  let input: IgcInputComponent;

  const helperSlot = 'helper-text';
  const valueMissingSlot = 'value-missing';

  before(() => {
    defineComponents(IgcInputComponent);
  });

  async function createFixture(template: TemplateResult) {
    input = await fixture<IgcInputComponent>(template);
  }

  it('container does not render non-slotted content on error', async () => {
    await createFixture(html`<igc-input required></igc-input>`);

    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.false;

    input.checkValidity();
    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;

    input.reportValidity();
    await elementUpdated(input);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, helperSlot, valueMissingSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.false;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.false;
  });

  it('non-slotted validation message slots does not override slotted helper-text', async () => {
    await createFixture(html`
      <igc-input required>
        <div slot=${helperSlot}>Helper text</div>
      </igc-input>
    `);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.true;

    input.reportValidity();
    await elementUpdated(input);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, helperSlot, valueMissingSlot);
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.false;
  });

  it('slotted validation message slots override slotted helper-text when invalid', async () => {
    await createFixture(html`
      <igc-input required>
        <div slot=${helperSlot}>Helper text</div>
        <div slot=${valueMissingSlot}>Value missing</div>
      </igc-input>
    `);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.false;

    await ValidityHelpers.checkValidationSlots(input, 'valueMissing');
  });

  it('validation messages survive a re-render after a failed form submission', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <igc-input name="input" required>
          <div slot=${valueMissingSlot}>Value missing</div>
        </igc-input>
      </form>
    `);

    input = form.querySelector(IgcInputComponent.tagName)!;

    form.requestSubmit();
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;

    // Any subsequent host update - a slotchange, an unrelated property - used to
    // drop the messages, since the submission only kept the control invalid for
    // the update it scheduled itself.
    input.requestUpdate();
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;
  });
});
