import { html, type TemplateResult } from 'lit';
import { beforeAll, describe, it } from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, fixture } from '../common/helpers.spec.js';
import { ValidityHelpers } from '../common/validity-helpers.spec.js';
import IgcInputComponent from '../input/input.js';

describe('Validation container', () => {
  let input: IgcInputComponent;

  const helperSlot = 'helper-text';
  const valueMissingSlot = 'value-missing';

  beforeAll(() => {
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
});
