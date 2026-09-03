import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { ValidityHelpers } from '#internals/testing/validity-helpers.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcValidationContainerComponent, {
  type ValidationContainerConfig,
} from './validation-container.js';

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

  it('projects validation messages for a host that starts out invalid', async () => {
    await createFixture(html`
      <igc-input required invalid>
        <div slot=${valueMissingSlot}>Value missing</div>
      </igc-input>
    `);

    // Wait for the second host render requested by the container.
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;
  });

  describe('create()', () => {
    const projectedHelperSlot = `slot[name='${helperSlot}']`;

    async function createContainer(config?: ValidationContainerConfig) {
      return fixture<IgcValidationContainerComponent>(
        IgcValidationContainerComponent.create(input, config)
      );
    }

    beforeEach(async () => {
      await createFixture(html`<igc-input required></igc-input>`);
    });

    it('projects a helper-text slot by default', async () => {
      const container = await createContainer();

      expect(container.id).to.equal(helperSlot);
      expect(container.querySelector(projectedHelperSlot)).not.to.be.null;
    });

    it('does not project a helper-text slot when `hasHelperText` is false', async () => {
      const container = await createContainer({ hasHelperText: false });

      expect(container.hasAttribute('id')).to.be.false;
      expect(container.querySelector(projectedHelperSlot)).to.be.null;
    });

    it('applies the id, slot and part from the configuration', async () => {
      const container = await createContainer({
        id: 'custom-id',
        slot: 'anchor',
        part: 'custom-part',
      });

      expect(container.id).to.equal('custom-id');
      expect(container.slot).to.equal('anchor');
      expect(container.part.contains('custom-part')).to.be.true;
    });
  });
});
