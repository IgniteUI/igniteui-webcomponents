import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { defineComponents } from '../../index.js';
import { MaskParser } from './mask-parser.js';
import IgcMaskedInputComponent from './masked-input';

describe('Masked input', () => {
  before(() => defineComponents(IgcMaskedInputComponent));

  const parser = new MaskParser();
  const defaultPrompt = '_';
  const defaultMask = 'CCCCCCCCCC';

  const syncParser = () => {
    parser.mask = masked.mask;
    parser.prompt = masked.prompt;
  };
  const input = () =>
    masked.shadowRoot!.querySelector('input') as HTMLInputElement;

  let masked: IgcMaskedInputComponent;

  describe('', async () => {
    beforeEach(async () => {
      masked = await fixture<IgcMaskedInputComponent>(
        html`<igc-masked-input></igc-masked-input>`
      );
    });

    it('sensible default values', async () => {
      expect(masked.prompt).to.equal(defaultPrompt);
      expect(masked.mask).to.equal(defaultMask);
      expect(masked.value).to.be.undefined;
      expect(input().placeholder).to.equal(parser.apply());
    });

    it('prompt character change (no value)', async () => {
      masked.prompt = '*';
      syncParser();

      await elementUpdated(masked);
      expect(input().placeholder).to.equal(parser.apply());
    });

    it('prompt character change (value)', async () => {
      masked.value = '777';
      await elementUpdated(masked);

      masked.prompt = '*';
      syncParser();
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('mask change (no value)', async () => {
      masked.mask = 'CCCC';
      syncParser();

      await elementUpdated(masked);
      expect(input().placeholder).to.equal(parser.apply());
    });

    it('mask change (value)', async () => {
      masked.value = '1111';
      await elementUpdated(masked);

      masked.mask = 'CC CC';
      syncParser();

      await elementUpdated(masked);
      expect(input().value).to.equal(parser.apply(masked.value));
    });

    it('placeholder is updated correctly', async () => {
      const placeholder = 'Enter payment info';
      syncParser();

      masked.placeholder = placeholder;
      await elementUpdated(masked);

      expect(input().placeholder).to.equal(placeholder);

      masked.placeholder = '';
      await elementUpdated(masked);

      expect(input().placeholder).to.equal(parser.apply());
    });

    it('empty value without literals', async () => {
      expect(masked.value).to.be.undefined;
    });

    it('empty value with literals', async () => {
      masked.withLiterals = true;
      syncParser();
      await elementUpdated(masked);

      expect(masked.value).to.equal(parser.apply());
    });

    it('get value without literals', async () => {
      masked.mask = '(CC) (CC)';
      masked.value = '1234';

      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
    });

    it('value with literals then value without', async () => {
      masked.mask = '(CC) (CC)';
      masked.value = '1234';
      masked.withLiterals = true;

      await elementUpdated(masked);

      expect(masked.value).to.equal('(12) (34)');

      masked.withLiterals = false;
      await elementUpdated(masked);

      expect(masked.value).to.equal('1234');
    });

    it('is accessible', async () => await expect(masked).to.be.accessible());

    it('focus updates underlying input mask', async () => {
      masked.focus();
      syncParser();

      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply());
    });

    it('blur updates underlying input mask (empty)', async () => {
      syncParser();

      masked.focus();
      await elementUpdated(masked);
      masked.blur();
      await elementUpdated(masked);

      expect(input().value).to.equal('');
    });

    it('blur updates underlying input mask (non-empty)', async () => {
      masked.mask = '[CC] CC CC';
      syncParser();

      masked.value;
      masked.focus();
      await elementUpdated(masked);
      masked.value = '654321';
      masked.blur();
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply('654321'));
    });

    it('drag enter without focus', async () => {
      syncParser();

      input().dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(masked);

      expect(input().value).to.equal(parser.apply());
    });

    it.only('drag enter with focus', async () => {
      syncParser();

      masked.focus();
      await elementUpdated(masked);

      input().dispatchEvent(new DragEvent('dragenter'));
      await elementUpdated(masked);

      expect(input().value).to.equal('');
    });
    it('drag leave without focus', async () => {});
    it('drag leave with focus', async () => {});
  });
});
