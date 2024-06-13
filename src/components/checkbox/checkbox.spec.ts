import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  checkValidationSlots,
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
      element = await createCheckboxComponent();
      input = element.renderRoot.querySelector('input') as HTMLInputElement;
    });

    it('should initialize checkbox component with default values', async () => {
      expect(input.id).to.equal('checkbox-1');
      expect(element.name).to.be.undefined;
      expect(input.name).to.equal('');
      expect(element.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(element.checked).to.equal(false);
      expect(input.checked).to.equal(false);
      expect(element.indeterminate).to.equal(false);
      expect(input.indeterminate).to.equal(false);
      expect(element.invalid).to.equal(false);
      expect(element.disabled).to.equal(false);
      expect(input.disabled).to.equal(false);
      expect(element.labelPosition).to.equal('after');
    });

    it('should render a checkbox component successfully', async () => {
      await expect(element).shadowDom.to.be.accessible();
    });

    it('should set the checkbox name property correctly', async () => {
      const name = 'fruit';

      element.name = name;
      expect(element.name).to.equal(name);

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
      expect(element.value).to.equal(value);

      await elementUpdated(element);
      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
    });

    it('should set the checkbox invalid property correctly', async () => {
      element.invalid = true;
      await elementUpdated(element);
      expect(element).dom.to.equal(
        `<igc-checkbox invalid label-position="after">${label}</igc-checkbox>`
      );

      element.invalid = false;
      await elementUpdated(element);
      expect(element).dom.to.equal(
        `<igc-checkbox label-position="after">${label}</igc-checkbox>`
      );
    });

    it('should correctly report validity status', async () => {
      element = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox required></igc-checkbox>`
      );
      expect(element.reportValidity()).to.equals(false);

      element = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox required checked></igc-checkbox>`
      );
      expect(element.reportValidity()).to.equals(true);

      element = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox></igc-checkbox>`
      );
      expect(element.reportValidity()).to.equals(true);
    });

    it('should set the checkbox checked property correctly', async () => {
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

      element.checked = true;
      expect(element.checked).to.be.true;
      await elementUpdated(element);
      expect(input).dom.to.equal(`<input aria-checked="true" />`, DIFF_OPTIONS);

      element.checked = false;
      expect(element.checked).to.be.false;
      await elementUpdated(element);

      expect(input).dom.to.equal(
        `<input aria-checked="false" />`,
        DIFF_OPTIONS
      );
    });

    it('should set the checkbox indeterminate property correctly', async () => {
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

      element.indeterminate = true;
      expect(element.indeterminate).to.be.true;
      await elementUpdated(element);
      expect(input).dom.to.equal(
        `<input aria-checked="mixed" />`,
        DIFF_OPTIONS
      );

      element.indeterminate = false;
      expect(element.indeterminate).to.be.false;
      await elementUpdated(element);
      expect(input).dom.to.equal(
        `<input aria-checked="false" />`,
        DIFF_OPTIONS
      );

      element.indeterminate = true;
      expect(element.indeterminate).to.be.true;
      element.checked = true;
      expect(element.checked).to.be.true;
      await elementUpdated(element);
      expect(input).dom.to.equal(`<input aria-checked="true" />`, DIFF_OPTIONS);
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
      expect(element.disabled).to.be.true;
      await elementUpdated(element);
      expect(input).dom.to.equal(
        `<input disabled aria-disabled="true" />`,
        DIFF_OPTIONS
      );

      element.disabled = false;
      expect(element.disabled).to.be.false;
      await elementUpdated(element);

      expect(input).dom.to.equal(
        `<input aria-disabled="false" />`,
        DIFF_OPTIONS
      );
    });

    it('should emit igcFocus/igcBlur events when the checkbox gains/loses focus', () => {
      const eventSpy = spy(element, 'emitEvent');
      element.focus();

      expect(element.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      element.blur();

      expect(element.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when the checkbox checked state changes', async () => {
      const eventSpy = spy(element, 'emitEvent');
      element.click();

      await elementUpdated(element);
      expect(eventSpy).calledWithExactly('igcChange', { detail: true });
    });

    const createCheckboxComponent = (
      template = `<igc-checkbox>${label}</igc-checkbox>`
    ) => {
      return fixture<IgcCheckboxComponent>(html`${unsafeStatic(template)}`);
    };
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcCheckboxComponent>(
      html`<igc-checkbox name="checkbox"
        >I have reviewed ToC and I agree</igc-checkbox
      >`
    );

    beforeEach(async () => {
      await spec.setup(IgcCheckboxComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit with default value "on"', async () => {
      spec.element.checked = true;
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('on');
    });

    it('is associated on submit with value (setting `checked` first)', async () => {
      spec.element.checked = true;
      spec.element.value = 'late-binding';
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('late-binding');
    });

    it('is associated on submit with passed value', async () => {
      spec.element.checked = true;
      spec.element.value = 'accepted';
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });

    it('is not associated on submit if not checked', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is correctly reset on form reset', async () => {
      spec.element.checked = true;
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.checked).to.be.false;
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', async () => {
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.checked = true;
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils required constraint with indeterminate', async () => {
      // See the Note mention at
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes
      spec.element.required = true;
      spec.element.indeterminate = true;
      await elementUpdated(spec.element);

      spec.submitFails();

      spec.element.checked = true;
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });

  describe('Synchronous validation', () => {
    const spec = new FormAssociatedTestBed<IgcCheckboxComponent>(
      html`<igc-checkbox required name="checkbox"
        >I have reviewed ToC and I agree</igc-checkbox
      >`
    );

    beforeEach(async () => {
      await spec.setup(IgcCheckboxComponent.tagName);
    });

    it('synchronously validates component', async () => {
      expect(spec.form.checkValidity()).to.be.false;
      spec.submitFails();

      spec.reset();

      spec.element.click();
      expect(spec.form.checkValidity()).to.be.true;
      spec.submitValidates();
    });
  });

  describe('Initial checked state is submitted', () => {
    const spec = new FormAssociatedTestBed<IgcCheckboxComponent>(
      html`<igc-checkbox
        name="checkbox"
        value="checked"
        checked
      ></igc-checkbox>`
    );

    beforeEach(async () => await spec.setup(IgcCheckboxComponent.tagName));

    it('initial state is submitted', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });
  });

  describe('Validation message slots', () => {
    async function createFixture(template: TemplateResult) {
      element = await fixture<IgcCheckboxComponent>(template);
    }

    it('renders value-missing slot', async () => {
      await createFixture(html`
        <igc-checkbox required>
          <div slot="value-missing"></div>
        </igc-checkbox>
      `);

      await checkValidationSlots(element, 'valueMissing');
    });

    it('renders custom-error slot', async () => {
      await createFixture(html`
        <igc-checkbox>
          <div slot="custom-error"></div>
        </igc-checkbox>
      `);

      element.setCustomValidity('invalid');
      await checkValidationSlots(element, 'customError');
    });

    it('renders invalid slot', async () => {
      await createFixture(html`
        <igc-checkbox required>
          <div slot="invalid"></div>
        </igc-checkbox>
      `);

      await checkValidationSlots(element, 'invalid');
    });
  });
});
