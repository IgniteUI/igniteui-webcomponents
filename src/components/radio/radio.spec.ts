import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcRadioComponent } from '../../index.js';

describe('Radio Component', () => {
  before(() => {
    defineComponents(IgcRadioComponent);
  });

  const label = 'Apple';
  let radio: IgcRadioComponent;
  let input: HTMLInputElement;

  const DIFF_OPTIONS = {
    ignoreAttributes: [
      'id',
      'part',
      'aria-checked',
      'aria-disabled',
      'aria-labelledby',
      'tabindex',
      'type',
    ],
  };

  describe('', () => {
    beforeEach(async () => {
      radio = await createRadioComponent();
      input = radio.renderRoot.querySelector('input') as HTMLInputElement;
    });

    it('is initialized with the proper default values', async () => {
      expect(input.id).to.equal('radio-0');
      expect(radio.name).to.be.undefined;
      expect(input.name).to.equal('');
      expect(radio.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(radio.checked).to.equal(false);
      expect(input.checked).to.equal(false);
      expect(radio.invalid).to.equal(false);
      expect(radio.disabled).to.equal(false);
      expect(input.disabled).to.equal(false);
      expect(radio.required).to.equal(false);
      expect(input.required).to.equal(false);
      expect(radio.labelPosition).to.equal('after');
    });

    it('renders a radio element successfully', async () => {
      await expect(radio).shadowDom.to.be.accessible();
    });

    it('sets label position properly', async () => {
      radio.labelPosition = 'before';
      await elementUpdated(radio);
      expect(radio).dom.to.equal(
        `<igc-radio label-position="before">${label}</igc-radio>`
      );

      radio.labelPosition = 'after';
      await elementUpdated(radio);
      expect(radio).dom.to.equal(
        `<igc-radio label-position="after">${label}</igc-radio>`
      );
    });

    it('sets invalid properly', async () => {
      radio.invalid = true;
      await elementUpdated(radio);
      expect(radio).dom.to.equal(
        `<igc-radio invalid label-position="after">${label}</igc-radio>`
      );

      radio.invalid = false;
      await elementUpdated(radio);
      expect(radio).dom.to.equal(
        `<igc-radio label-position="after">${label}</igc-radio>`
      );
    });

    it('sets the name property successfully', async () => {
      const name = 'fruit';

      radio.name = name;
      expect(radio.name).to.equal(name);

      await elementUpdated(radio);
      expect(input).dom.to.equal(`<input name="${name}"/>`, DIFF_OPTIONS);
    });

    it('sets the value property successfully', async () => {
      const value = 'apple';

      radio.value = value;
      expect(radio.value).to.equal(value);

      await elementUpdated(radio);
      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
    });

    it('sets the checked property successfully', async () => {
      const DIFF_OPTIONS = {
        ignoreAttributes: [
          'id',
          'part',
          'aria-disabled',
          'aria-labelledby',
          'tabindex',
          'type',
        ],
      };

      radio.checked = true;
      expect(radio.checked).to.be.true;
      await elementUpdated(radio);
      expect(input).dom.to.equal(`<input aria-checked="true" />`, DIFF_OPTIONS);

      radio.checked = false;
      expect(radio.checked).to.be.false;
      await elementUpdated(radio);

      expect(input).dom.to.equal(
        `<input aria-checked="false" />`,
        DIFF_OPTIONS
      );
    });

    it('sets the disabled property successfully', async () => {
      const DIFF_OPTIONS = {
        ignoreAttributes: [
          'id',
          'part',
          'aria-checked',
          'aria-labelledby',
          'tabindex',
          'type',
        ],
      };

      radio.disabled = true;
      expect(radio.disabled).to.be.true;
      await elementUpdated(radio);
      expect(input).dom.to.equal(
        `<input disabled aria-disabled="true" />`,
        DIFF_OPTIONS
      );

      radio.disabled = false;
      expect(radio.disabled).to.be.false;
      await elementUpdated(radio);

      expect(input).dom.to.equal(
        `<input aria-disabled="false" />`,
        DIFF_OPTIONS
      );
    });

    it('sets the required property successfully', async () => {
      radio.required = true;
      expect(radio.required).to.be.true;
      await elementUpdated(radio);
      expect(input).dom.to.equal(`<input required />`, DIFF_OPTIONS);

      radio.required = false;
      expect(radio.required).to.be.false;
      await elementUpdated(radio);

      expect(input).dom.to.equal(`<input />`, DIFF_OPTIONS);
    });

    it('should emit focus/blur events when methods are called', () => {
      const eventSpy = sinon.spy(radio, 'emitEvent');
      radio.focus();

      expect(radio.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      radio.blur();

      expect(radio.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when radio is checked', async () => {
      const eventSpy = sinon.spy(radio, 'emitEvent');
      radio.click();

      await elementUpdated(radio);
      expect(eventSpy).calledWithExactly('igcChange', { detail: true });
    });

    it('should be able to use external elements as label', async () => {
      const labelId = 'my-label';
      const radio = await fixture<IgcRadioComponent>(
        html`<igc-radio aria-labelledby="${labelId}"></igc-radio>
          <span id="${labelId}">My Label</span>`
      );
      const input = radio.renderRoot.querySelector('input') as HTMLInputElement;

      expect(radio.ariaLabelledby).to.equal(labelId);
      expect(input.getAttribute('aria-labelledby')).to.equal(labelId);
    });
  });

  const createRadioComponent = (
    template = `<igc-radio>${label}</igc-radio>`
  ) => {
    return fixture<IgcRadioComponent>(html`${unsafeStatic(template)}`);
  };
});
