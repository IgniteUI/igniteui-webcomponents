import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateFileUpload } from '../common/utils.spec.js';
import IgcFileInputComponent from './file-input.js';

describe('File input component', () => {
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

      const files = [
        new File(['test content'], 'test.txt', { type: 'text/plain' }),
        new File(['image data'], 'image.png', { type: 'image/png' }),
      ];

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

      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      await simulateFileUpload(element, [file]);

      expect(
        element
          .shadowRoot!.querySelector('[part="file-names"]')!
          .textContent!.trim()
      ).to.equal('test.txt');
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

      const files = [
        new File(['test content'], 'test.txt', { type: 'text/plain' }),
      ];

      await simulateFileUpload(element, files);

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
