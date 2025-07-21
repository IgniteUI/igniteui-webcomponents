import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import {
  createFormAssociatedTestBed,
  isFocused,
  simulateClick,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '../common/validity-helpers.spec.js';
import IgcRadioComponent from './radio.js';

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
      radio = await fixture<IgcRadioComponent>(
        html`<igc-radio>${label}</igc-radio>`
      );
      input = radio.renderRoot.querySelector('input')!;
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
      expect(input).dom.to.equal('<input disabled />', DIFF_OPTIONS);

      radio.disabled = false;
      expect(radio.disabled).to.be.false;
      await elementUpdated(radio);

      expect(input).dom.to.equal('<input />', DIFF_OPTIONS);
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

    it('should have correct focus states between Light/Shadow DOM', () => {
      radio.focus();
      expect(isFocused(radio)).to.be.true;
      expect(isFocused(input)).to.be.true;

      radio.blur();
      expect(isFocused(radio)).to.be.false;
      expect(isFocused(input)).to.be.false;
    });

    it('should emit igcChange event when radio is checked', async () => {
      const eventSpy = spy(radio, 'emitEvent');
      radio.click();

      await elementUpdated(radio);
      expect(eventSpy).calledWithExactly('igcChange', {
        detail: {
          checked: true,
          value: undefined,
        },
      });
    });

    it('it should not emit igcChange event on already checked radio', async () => {
      const eventSpy = spy(radio, 'emitEvent');

      radio.click();
      await elementUpdated(radio);
      expect(eventSpy.getCalls()).lengthOf(1);

      radio.click();
      await elementUpdated(radio);
      expect(eventSpy.getCalls()).lengthOf(1);
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

    it('should emit click event only once', async () => {
      const eventSpy = spy(radio, 'click');

      radio.addEventListener('click', eventSpy);
      simulateClick(radio);

      await elementUpdated(radio);
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should update the validity state of the group when a single radio is validated', async () => {
      const radios = Array.from(
        (
          await fixture(html`
            <div>
              <igc-radio required name="radio" value="1">1</igc-radio>
              <igc-radio name="radio" value="1">2</igc-radio>
              <igc-radio name="radio" value="1">3</igc-radio>
            </div>
          `)
        ).querySelectorAll(IgcRadioComponent.tagName)
      );

      // Initial render - invalid state but no styles applied
      expect(radios.every((radio) => radio.invalid)).to.be.false;

      // checkValidity - all radios from the group should have invalid styles applied
      expect(first(radios).reportValidity()).to.be.false;
      expect(radios.every((radio) => radio.invalid)).to.be.true;

      // Set a checked radio - valid state, invalid styles should not be applied
      first(radios).checked = true;
      expect(first(radios).reportValidity()).to.be.true;
      expect(radios.every((radio) => radio.invalid)).to.be.false;
    });
  });

  describe('Form integration', () => {
    const values = [1, 2, 3];
    let radios: IgcRadioComponent[] = [];
    const spec = createFormAssociatedTestBed<IgcRadioComponent>(
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

    it('is form associated', () => {
      radios.every((radio) => expect(radio.form).to.equal(spec.form));
    });

    it('is not associated on submit if not checked', () => {
      spec.assertSubmitHasValue(null);
    });

    it('is associated on submit with default value "on"', () => {
      radios.forEach((radio) => {
        radio.value = '';
      });

      first(radios).checked = true;
      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with default value "on" (setting `checked` first)', () => {
      first(radios).checked = true;
      radios.forEach((radio) => {
        radio.value = '';
      });

      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with passed value', () => {
      first(radios).checked = true;
      spec.assertSubmitHasValue(first(radios).value);
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ checked: true });
      spec.reset();

      expect(spec.element.checked).to.be.false;
    });

    it('should reset to the new default value after setAttribute() call', () => {
      first(radios).toggleAttribute('checked', true);
      last(radios).toggleAttribute('checked', true);
      first(radios).checked = true;

      expect(last(radios).checked).to.be.false;

      spec.reset();
      expect(last(radios).checked).to.be.true;
      expect(first(radios).checked).to.be.false;

      spec.assertSubmitHasValue(last(radios).value);
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      radios.every((radio) => expect(radio.disabled).to.be.true);

      spec.setAncestorDisabledState(false);
      radios.every((radio) => expect(radio.disabled).to.be.false);
    });

    it('fulfils required constraint', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();
      radios.every((radio) => expect(radio.invalid).to.be.true);

      spec.setProperties({ checked: true });
      spec.assertSubmitPasses();
      radios.every((radio) => expect(radio.invalid).to.be.false);
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();
      radios.every((radio) => expect(radio.invalid).to.be.true);

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
      radios.every((radio) => expect(radio.invalid).to.be.false);
    });
  });

  describe('defaultChecked', () => {
    describe('Form integration', () => {
      const values = [1, 2, 3];
      let radios: IgcRadioComponent[] = [];
      const spec = createFormAssociatedTestBed<IgcRadioComponent>(
        html`${values.map(
          (e) => html`
            <igc-radio name="radio" value=${e} .defaultChecked=${e === 1}
              >${e}</igc-radio
            >
          `
        )}`
      );

      beforeEach(async () => {
        await spec.setup(IgcRadioComponent.tagName);
        radios = Array.from(
          spec.form.querySelectorAll(IgcRadioComponent.tagName)
        );
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.checked).to.be.true;
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue('1');
      });

      it('is correctly reset', () => {
        last(radios).checked = true;
        spec.reset();

        expect(spec.element.checked).to.be.true;
      });
    });
  });

  describe('issue-1122', () => {
    const spec = createFormAssociatedTestBed<IgcRadioComponent>(
      html`<igc-radio name="selection" value="1" required></igc-radio>`
    );

    beforeEach(async () => {
      await spec.setup(IgcRadioComponent.tagName);
    });

    it('synchronously validates component', () => {
      // Invalid state
      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      // Passes
      spec.element.click();
      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcRadioComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcRadioComponent, testParameters);
    });
  });
});
