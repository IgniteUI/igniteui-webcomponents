import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  simulateFileUpload,
} from '../common/utils.spec.js';
import IgcFileInputComponent from './file-input.js';

describe('File Input component', () => {
  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
    new File(['image data'], 'image.png', { type: 'image/png' }),
  ];

  before(() => {
    defineComponents(IgcFileInputComponent);
  });

  let element: IgcFileInputComponent;
  let input: HTMLInputElement;

  async function createFixture(template: TemplateResult) {
    element = await fixture<IgcFileInputComponent>(template);
    input = element.renderRoot.querySelector('input')!;
  }

  describe('Properties', () => {
    it('sets the multiple property when input is of type file', async () => {
      await createFixture(html`<igc-file-input multiple></igc-file-input>`);

      expect(element.multiple).to.equal(true);
      expect(input.multiple).to.equal(true);

      element.multiple = false;
      await elementUpdated(element);

      expect(element.multiple).to.equal(false);
      expect(input.multiple).to.equal(false);
    });

    it('sets the accept property when input is of type file', async () => {
      await createFixture(
        html`<igc-file-input accept="image/*"></igc-file-input>`
      );

      expect(element.accept).to.equal('image/*');
      expect(input.accept).to.equal('image/*');

      element.accept = '';
      await elementUpdated(element);

      expect(element.accept).to.be.empty;
      expect(input.accept).to.be.empty;
    });

    it('returns the uploaded files when input is of type file', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);
      await simulateFileUpload(element, files);

      expect(element.files).to.exist;
      expect(element.files!.length).to.equal(2);
      expect(element.files![0].name).to.equal('test.txt');
      expect(element.files![1].name).to.equal('image.png');
    });

    it('should show placeholder text when no file is selected', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);

      expect(
        element
          .shadowRoot!.querySelector('[part="file-names"]')!
          .textContent!.trim()
      ).to.equal('No file chosen');

      element.placeholder = 'Select a document';
      await elementUpdated(element);

      expect(
        element
          .shadowRoot!.querySelector('[part="file-names"]')!
          .textContent!.trim()
      ).to.equal('Select a document');

      await simulateFileUpload(element, [files[0]]);

      expect(
        element
          .shadowRoot!.querySelector('[part="file-names"]')!
          .textContent!.trim()
      ).to.equal('test.txt');
    });

    it('resets the file selection when empty string is passed for value', async () => {
      const file = files[0];
      await createFixture(html`<igc-file-input></igc-file-input>`);
      await simulateFileUpload(element, [file]);

      expect(element.value).to.equal(`C:\\fakepath\\${file.name}`);
      expect(element.files!.length).to.equal(1);
      expect(element.files![0]).to.equal(file);

      element.value = '';
      expect(element.value).to.equal('');
      expect(element.files!.length).to.equal(0);
    });
  });

  describe('File type layout', () => {
    it('renders publicly documented parts when the input is of type file', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);

      expect(
        element.shadowRoot!.querySelector('div[part="file-selector-button"]')
      ).to.exist;
      expect(element.shadowRoot!.querySelector('div[part="file-names"]')).to
        .exist;
    });

    it('renders slotted contents when the input is of type file', async () => {
      await createFixture(html`
        <igc-file-input>
          <span slot="file-selector-text">Upload</span>
          <span slot="file-missing-text">Choose a file</span>
        </igc-file-input>
      `);

      const selectorSlot = element.shadowRoot!.querySelector(
        'slot[name="file-selector-text"]'
      ) as HTMLSlotElement;
      const missingSlot = element.shadowRoot!.querySelector(
        'slot[name="file-missing-text"]'
      ) as HTMLSlotElement;

      expect(selectorSlot!.assignedNodes()[0].textContent).to.equal('Upload');
      expect(missingSlot!.assignedNodes()[0].textContent).to.equal(
        'Choose a file'
      );
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);
    });

    it('emits igcChange', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);
      const eventSpy = spy(element, 'emitEvent');

      await simulateFileUpload(element, [files[0]]);

      expect(eventSpy).calledWith('igcChange', {
        detail: element.value,
      });
    });

    it('emits igcCancel', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const input = element.shadowRoot!.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      input.dispatchEvent(new Event('cancel', { bubbles: true }));
      await elementUpdated(element);

      expect(eventSpy).calledOnceWith('igcCancel', {
        detail: element.value,
      });
    });

    it('should mark as dirty on focus', async () => {
      const input = element.shadowRoot!.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      input.dispatchEvent(new Event('focus', { bubbles: true }));
      await elementUpdated(element);

      const eventSpy = spy(element as any, '_validate');
      input.dispatchEvent(new Event('blur', { bubbles: true }));

      expect(eventSpy).called;
    });

    it('should validate on blur', async () => {
      await createFixture(html`<igc-file-input required></igc-file-input>`);

      const input = element.shadowRoot!.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(element);

      expect(element.invalid).to.be.true;
    });
  });
});

describe('Form Validation', () => {
  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
  ];
  const _expectedValidation = Symbol();

  type TestBedInput = IgcFileInputComponent & {
    [_expectedValidation]: boolean;
  };

  function validateInput(event: CustomEvent<string>) {
    const element = event.target as TestBedInput;
    expect(element.checkValidity()).to.equal(element[_expectedValidation]);
  }

  function setExpectedValidationState(
    state: boolean,
    element: IgcFileInputComponent
  ) {
    (element as TestBedInput)[_expectedValidation] = state;
  }

  const spec = createFormAssociatedTestBed<IgcFileInputComponent>(
    html`<igc-file-input
      name="input"
      required
      @igcChange=${validateInput}
    ></igc-file-input>`
  );

  beforeEach(async () => {
    await spec.setup(IgcFileInputComponent.tagName);
  });

  it('validates component', async () => {
    setExpectedValidationState(true, spec.element);
    await simulateFileUpload(spec.element, files);
  });
});

describe('Form Integration', () => {
  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
  ];

  const spec = createFormAssociatedTestBed<IgcFileInputComponent>(
    html`<igc-file-input name="input" required></igc-file-input>`
  );

  beforeEach(async () => {
    await spec.setup(IgcFileInputComponent.tagName);
  });

  it('correct initial state', () => {
    spec.assertIsPristine();
    expect(spec.element.value).to.equal('');
  });

  it('is form associated', () => {
    expect(spec.element.form).to.equal(spec.form);
  });

  it('is not associated on submit if no value', () => {
    spec.assertSubmitHasValue(null);
  });

  it('is associated on submit', async () => {
    await simulateFileUpload(spec.element, files);
    spec.assertSubmitHasValue(files[0]);
  });

  it('is correctly resets on form reset', async () => {
    await simulateFileUpload(spec.element, files);
    spec.reset();

    expect(spec.element.value).to.be.empty;
  });

  it('reflects disabled ancestor state', () => {
    spec.setAncestorDisabledState(true);
    expect(spec.element.disabled).to.be.true;

    spec.setAncestorDisabledState(false);
    expect(spec.element.disabled).to.be.false;
  });

  it('fulfils required constraint', async () => {
    spec.assertSubmitFails();

    await simulateFileUpload(spec.element, files);
    spec.assertSubmitPasses();
  });
});
