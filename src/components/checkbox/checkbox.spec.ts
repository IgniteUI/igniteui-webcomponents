import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { configureTheme } from '../../theming/config.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  isFocused,
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '../common/utils.spec.js';
import IgcCheckboxComponent from './checkbox.js';

describe('Checkbox', () => {
  before(() => {
    defineComponents(IgcCheckboxComponent);
  });

  const label = 'Label';
  let element: IgcCheckboxComponent;
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
      element = await fixture(html`<igc-checkbox>${label}</igc-checkbox>`);
      input = element.renderRoot.querySelector('input')!;
    });

    it('should initialize checkbox component with default values', async () => {
      expect(input.id).to.equal('checkbox-1');
      expect(element.name).to.be.undefined;
      expect(input.name).to.be.empty;
      expect(element.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(element.checked).to.be.false;
      expect(input.checked).to.be.false;
      expect(element.indeterminate).to.be.false;
      expect(input.indeterminate).to.be.false;
      expect(element.invalid).to.be.false;
      expect(element.disabled).to.be.false;
      expect(input.disabled).to.be.false;
      expect(element.labelPosition).to.equal('after');
    });

    it('should render a checkbox component successfully', async () => {
      await expect(element).shadowDom.to.be.accessible();
      await expect(element).to.be.accessible();
    });

    it('should render the correct SVG in indigo theme', async () => {
      /**
       * In Indigo theme the svg structure goes like this:
       *
       * <svg>
       *  <rect></rect>
       *  <path></path>
       * </svg>
       *
       * while in the other themes it is:
       *
       * <svg>
       *  <path></path>
       * </svg>
       */

      const root = element.renderRoot;

      // Bootstrap, Fluent, Material
      expect(root.querySelector('svg > rect')).to.be.null;

      configureTheme('indigo');
      await elementUpdated(element);

      // Indigo
      expect(root.querySelector('svg > rect')).to.be.not.null;

      // Reset back to Bootstrap
      configureTheme('bootstrap');
    });

    it('should set the checkbox name property correctly', async () => {
      const name = 'fruit';

      element.name = name;
      await elementUpdated(element);

      expect(input).dom.to.equal(`<input name="${name}"/>`, DIFF_OPTIONS);
    });

    it('should set the checkbox label position correctly', async () => {
      element.labelPosition = 'before';
      await elementUpdated(element);

      expect(element).dom.to.equal(
        `<igc-checkbox label-position="before">${label}</igc-checkbox>`
      );

      element.labelPosition = 'after';
      await elementUpdated(element);

      expect(element).dom.to.equal(
        `<igc-checkbox label-position="after">${label}</igc-checkbox>`
      );
    });

    it('should set the checkbox value property correctly', async () => {
      const value = 'apple';

      element.value = value;
      await elementUpdated(element);

      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
    });

    it('should set the checkbox invalid property correctly', () => {
      element.invalid = true;
      expect(element).dom.to.equal(
        `<igc-checkbox invalid label-position="after">${label}</igc-checkbox>`
      );

      element.invalid = false;
      expect(element).dom.to.equal(
        `<igc-checkbox label-position="after">${label}</igc-checkbox>`
      );
    });

    it('should correctly report validity status', () => {
      element.required = true;
      expect(element.reportValidity()).to.be.false;

      element.checked = true;
      expect(element.reportValidity()).to.be.true;

      element.checked = false;
      element.required = false;
      expect(element.reportValidity()).to.be.true;
    });

    it('should set the checkbox disabled property correctly', async () => {
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

      element.disabled = true;
      await elementUpdated(element);

      expect(input).dom.to.equal('<input disabled />', DIFF_OPTIONS);

      element.disabled = false;
      await elementUpdated(element);

      expect(input).dom.to.equal('<input />', DIFF_OPTIONS);
    });

    it('should have correct focus states between Light/Shadow DOM', () => {
      element.focus();
      expect(isFocused(element)).to.be.true;
      expect(isFocused(input));

      element.blur();
      expect(isFocused(element)).to.be.false;
      expect(isFocused(input)).to.be.false;
    });

    it('should emit click event only once', async () => {
      const eventSpy = spy(element, 'click');

      element.addEventListener('click', eventSpy);
      element.click();

      await elementUpdated(element);
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should emit igcChange event when the checkbox checked state changes', async () => {
      const eventSpy = spy(element, 'emitEvent');
      element.click();

      await elementUpdated(element);
      expect(eventSpy).calledWithExactly('igcChange', {
        detail: { checked: true, value: undefined },
      });
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcCheckboxComponent>(html`
      <igc-checkbox name="checkbox">
        I have reviewed ToC and I agree
      </igc-checkbox>
    `);

    beforeEach(async () => {
      await spec.setup(IgcCheckboxComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit with default value "on"', () => {
      spec.setProperties({ checked: true });
      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with value (setting `checked` first)', () => {
      spec.setProperties({ checked: true });
      spec.setProperties({ value: 'late-binding' });
      spec.assertSubmitHasValue(spec.element.value);
    });

    it('is associated on submit with passed value', () => {
      spec.setProperties({ checked: true, value: 'accepted' });
      spec.assertSubmitHasValue(spec.element.value);
    });

    it('is not associated on submit if not checked', () => {
      expect(spec.assertSubmitHasValue(null));
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ checked: true });
      spec.reset();

      expect(spec.element.checked).to.be.false;
    });

    it('is correctly reset on form reset after setAttribute() call', () => {
      spec.setAttributes({ checked: true });
      spec.reset();

      expect(spec.element.checked).to.be.true;
    });

    it('is correctly reset on form reset after toggleAttribute() call', () => {
      spec.element.toggleAttribute('checked', true);
      spec.reset();

      expect(spec.element.checked).to.be.true;
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();

      spec.setProperties({ checked: true });
      spec.assertSubmitPasses();
    });

    it('fulfils required constraint with indeterminate', () => {
      // See the Note mention at
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes
      spec.setProperties({ required: true, indeterminate: true });
      spec.assertSubmitFails();

      spec.setProperties({ checked: true });
      spec.assertSubmitPasses();
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });

  describe('Synchronous validation', () => {
    const spec = createFormAssociatedTestBed<IgcCheckboxComponent>(html`
      <igc-checkbox required name="checkbox">
        I have reviewed ToC and I agree
      </igc-checkbox>
    `);

    beforeEach(async () => {
      await spec.setup(IgcCheckboxComponent.tagName);
    });

    it('synchronously validates component', () => {
      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      spec.element.click();
      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('Initial checked state is submitted', () => {
    const spec = createFormAssociatedTestBed<IgcCheckboxComponent>(html`
      <igc-checkbox name="checkbox" value="checked" checked></igc-checkbox>
    `);

    beforeEach(async () => await spec.setup(IgcCheckboxComponent.tagName));

    it('initial state is submitted', () => {
      spec.assertSubmitHasValue(spec.element.value);
    });
  });

  describe('defaultChecked', () => {
    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcCheckboxComponent>(html`
        <igc-checkbox name="checkbox" .defaultChecked=${true}></igc-checkbox>
      `);

      beforeEach(async () => {
        await spec.setup(IgcCheckboxComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.checked).to.be.true;
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue('on');
      });

      it('is correctly reset', () => {
        spec.setProperties({ checked: false });
        spec.reset();

        expect(spec.element.checked).to.be.true;
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcCheckboxComponent>(html`
        <igc-checkbox name="checkbox" required></igc-checkbox>
      `);

      beforeEach(async () => {
        await spec.setup(IgcCheckboxComponent.tagName);
      });

      it('fails initial validation', () => {
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes validation when updating defaultChecked', () => {
        spec.setProperties({ defaultChecked: true });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcCheckboxComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcCheckboxComponent, testParameters);
    });
  });
});
