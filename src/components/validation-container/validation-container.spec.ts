import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  checkValidationSlots,
  hasSlotContent,
  hasSlots,
} from '../common/utils.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcValidationContainerComponent from './validation-container.js';

describe('Validation container', () => {
  let element: IgcInputComponent;
  let container: IgcValidationContainerComponent;
  const helperSlot = 'helper-text';

  before(() => {
    defineComponents(IgcInputComponent);
  });

  function waitForUpdate() {
    return Promise.all([elementUpdated(element), elementUpdated(container)]);
  }

  async function createFixture(template: TemplateResult) {
    element = await fixture<IgcInputComponent>(template);
    container = element.renderRoot.querySelector(
      IgcValidationContainerComponent.tagName
    )!;
  }

  it('container does not render non-slotted content on error', async () => {
    await createFixture(html`<igc-input required></igc-input>`);

    expect(element.invalid).to.be.false;
    expect(hasSlots(container.renderRoot, helperSlot)).to.be.true;

    element.checkValidity();
    await waitForUpdate();

    expect(element.invalid).to.be.true;
    expect(hasSlots(container.renderRoot, helperSlot, 'value-missing')).to.be
      .true;
    expect(hasSlotContent(container.renderRoot, helperSlot)).to.be.false;
    expect(hasSlotContent(container.renderRoot, 'value-missing')).to.be.false;
  });

  it('non-slotted validation message slots does not override slotted helper-text', async () => {
    await createFixture(html`
      <igc-input required>
        <div slot=${helperSlot}>Helper text</div>
      </igc-input>
    `);

    expect(element.invalid).to.be.false;
    expect(hasSlots(container.renderRoot, helperSlot)).to.be.true;

    element.checkValidity();
    await waitForUpdate();

    expect(element.invalid).to.be.true;
    expect(hasSlots(container.renderRoot, helperSlot, 'value-missing')).to.be
      .true;
    expect(hasSlotContent(container.renderRoot, helperSlot)).to.be.true;
    expect(hasSlotContent(container.renderRoot, 'value-missing')).to.be.false;
  });

  it('slotted validation message slots override slotted helper-text when invalid', async () => {
    await createFixture(
      html`<igc-input required>
        <div slot=${helperSlot}>Helper text</div>
        <div slot="value-missing">Value missing</div>
      </igc-input>`
    );

    expect(element.invalid).to.be.false;
    expect(hasSlots(container.renderRoot, helperSlot)).to.be.true;

    await checkValidationSlots(element, 'valueMissing');
  });
});
