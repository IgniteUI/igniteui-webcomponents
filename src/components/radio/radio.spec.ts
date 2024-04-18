import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { IgcRadioComponent, defineComponents } from '../../index.js';
import { FormAssociatedTestBed } from '../common/utils.spec.js';

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
      expect(input.id).to.equal('radio-1');
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
      expect(input).dom.to.equal('<input required />', DIFF_OPTIONS);

      radio.required = false;
      expect(radio.required).to.be.false;
      await elementUpdated(radio);

      expect(input).dom.to.equal('<input />', DIFF_OPTIONS);
    });

    it('should emit focus/blur events when methods are called', () => {
      const eventSpy = spy(radio, 'emitEvent');
      radio.focus();

      expect(radio.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      radio.blur();

      expect(radio.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when radio is checked', async () => {
      const eventSpy = spy(radio, 'emitEvent');
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

      expect(radio.getAttribute('aria-labelledby')).to.equal(labelId);
      expect(input.getAttribute('aria-labelledby')).to.equal(labelId);
    });
  });

  const createRadioComponent = (
    template = `<igc-radio>${label}</igc-radio>`
  ) => {
    return fixture<IgcRadioComponent>(html`${unsafeStatic(template)}`);
  };

  describe('Form integration', () => {
    const values = [1, 2, 3];
    let radios: IgcRadioComponent[] = [];
    const spec = new FormAssociatedTestBed<IgcRadioComponent>(
      html`${values.map(
        (e) => html`<igc-radio name="radio" value=${e}>${e}</igc-radio>`
      )}`
    );

    beforeEach(async () => {
      await spec.setup(IgcRadioComponent.tagName);
      radios = Array.from(
        spec.form.querySelectorAll(IgcRadioComponent.tagName)
      );
    });

    it('is form associated', async () => {
      for (const radio of radios) {
        expect(radio.form).to.eql(spec.form);
      }
    });

    it('is not associated on submit if not checked', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit with default value "on"', async () => {
      radios.forEach((r) => (r.value = ''));
      radios.at(0)!.checked = true;
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('on');
    });

    it('is associated on submit with default value "on" (setting `checked` first)', async () => {
      radios.at(0)!.checked = true;
      radios.forEach((r) => (r.value = ''));
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('on');
    });

    it('is associated on submit with passed value', async () => {
      radios.at(0)!.checked = true;
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        radios.at(0)!.value
      );
    });

    it('is correctly reset on form reset', async () => {
      spec.element.checked = true;
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.checked).to.be.false;
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      for (const radio of radios) {
        expect(radio.disabled).to.be.true;
      }

      spec.setAncestorDisabledState(false);
      for (const radio of radios) {
        expect(radio.disabled).to.be.false;
      }
    });

    it('fulfils required constraint', async () => {
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      for (const radio of radios) {
        expect(radio.invalid).to.be.true;
      }

      spec.element.checked = true;
      await elementUpdated(spec.element);
      spec.submitValidates();

      for (const radio of radios) {
        expect(radio.invalid).to.be.false;
      }
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      for (const radio of radios) {
        expect(radio.invalid).to.be.true;
      }

      spec.element.setCustomValidity('');
      spec.submitValidates();

      for (const radio of radios) {
        expect(radio.invalid).to.be.false;
      }
    });
  });

  describe('issue-1122', () => {
    const spec = new FormAssociatedTestBed<IgcRadioComponent>(
      html`<igc-radio name="selection" value="1" required></igc-radio>`
    );

    beforeEach(async () => {
      await spec.setup(IgcRadioComponent.tagName);
    });

    it('synchronously validates component', async () => {
      // Invalid state
      expect(spec.form.checkValidity()).to.be.false;
      spec.submitFails();

      spec.reset();

      // Passes
      spec.element.click();
      expect(spec.form.checkValidity()).to.be.true;
      spec.submitValidates();
    });
  });
});
