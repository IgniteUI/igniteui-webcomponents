import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import {
  type ValidationContainerTestsParams,
  createFormAssociatedTestBed,
  runValidationContainerTests,
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

  function getDOM(selector: string) {
    return element.renderRoot.querySelector(selector) as HTMLElement;
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

      simulateFileUpload(input, files);
      await elementUpdated(element);

      expect(element.files).lengthOf(2);
      expect(element.files?.item(0)?.name).to.equal('test.txt');
      expect(element.files?.item(1)?.name).to.equal('image.png');
    });

    it('should show placeholder text when no file is selected', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);

      expect(getDOM('[part="file-names"]').innerText).to.equal(
        'No file chosen'
      );

      element.placeholder = 'Select a document';
      await elementUpdated(element);

      expect(getDOM('[part="file-names"]').innerText).to.equal(
        'Select a document'
      );

      element.focus();
      simulateFileUpload(input, [first(files)]);
      await elementUpdated(element);

      expect(getDOM('[part="file-names"]').innerText).to.equal(
        first(files).name
      );
    });

    it('resets the file selection when empty string is passed for value', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);
      const file = first(files);

      simulateFileUpload(input, [file]);
      await elementUpdated(element);

      expect(element.value).to.equal(`C:\\fakepath\\${file.name}`);
      expect(element.files).lengthOf(1);
      expect(element.files?.item(0)).to.equal(file);

      element.value = '';
      expect(element.value).to.be.empty;
      expect(element.files).to.be.empty;
    });
  });

  describe('File type layout', () => {
    it('renders publicly documented parts when the input is of type file', async () => {
      await createFixture(html`<igc-file-input></igc-file-input>`);

      expect(getDOM('div[part="file-selector-button"]')).is.not.null;
      expect(getDOM('div[part="file-names"]')).is.not.null;
    });

    it('renders slotted contents when the input is of type file', async () => {
      await createFixture(html`
        <igc-file-input>
          <span slot="file-selector-text">Upload</span>
          <span slot="file-missing-text">Choose a file</span>
        </igc-file-input>
      `);

      const selectorSlot = getDOM(
        'slot[name="file-selector-text"]'
      ) as HTMLSlotElement;
      const missingSlot = getDOM(
        'slot[name="file-missing-text"]'
      ) as HTMLSlotElement;

      expect(first(selectorSlot.assignedNodes()).textContent).to.equal(
        'Upload'
      );
      expect(first(missingSlot.assignedNodes()).textContent).to.equal(
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

      simulateFileUpload(input, [first(files)]);
      await elementUpdated(element);

      expect(eventSpy).calledWith('igcChange', {
        detail: element.value,
      });
    });

    it('emits igcCancel', async () => {
      const eventSpy = spy(element, 'emitEvent');

      input.dispatchEvent(new Event('cancel', { bubbles: true }));
      await elementUpdated(element);

      expect(eventSpy).calledOnceWith('igcCancel', {
        detail: element.value,
      });
    });

    it('should update UI invalid state on blur when interacted', async () => {
      await createFixture(html`<igc-file-input required></igc-file-input>`);

      // Internal invalid state, invalid UI is in initial state.
      expect(element.validity.valueMissing).to.be.true;
      expect(element.invalid).to.be.false;

      // Internal invalid state, invalid UI is still in initial state.
      element.focus();
      expect(element.validity.valueMissing).to.be.true;
      expect(element.invalid).to.be.false;

      // Internal invalid state, invalid UI is updated.
      element.blur();
      expect(element.validity.valueMissing).to.be.true;
      expect(element.invalid).to.be.true;
    });
  });
});

describe('Form Integration', () => {
  let input: HTMLInputElement;
  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
  ];

  const spec = createFormAssociatedTestBed<IgcFileInputComponent>(
    html`<igc-file-input name="input" required></igc-file-input>`
  );

  beforeEach(async () => {
    await spec.setup(IgcFileInputComponent.tagName);
    input = spec.element.renderRoot.querySelector('input')!;
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
    simulateFileUpload(input, files);
    await elementUpdated(spec.element);
    spec.assertSubmitHasValue(first(files));
  });

  it('is correctly resets on form reset', async () => {
    simulateFileUpload(input, files);
    await elementUpdated(spec.element);
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

    simulateFileUpload(input, files);
    await elementUpdated(spec.element);

    spec.assertSubmitPasses();
  });
});

describe('Validation message slots', () => {
  it('', async () => {
    const testParameters: ValidationContainerTestsParams<IgcFileInputComponent>[] =
      [
        { slots: ['valueMissing'], props: { required: true } },
        { slots: ['customError'] },
      ];

    runValidationContainerTests(IgcFileInputComponent, testParameters);
  });
});

function simulateFileUpload(input: HTMLInputElement, files: File[]) {
  const dataTransfer = new DataTransfer();

  for (const file of files) {
    dataTransfer.items.add(file);
  }

  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
