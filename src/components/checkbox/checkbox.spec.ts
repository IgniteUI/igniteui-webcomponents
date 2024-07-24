import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { IgcCheckboxComponent, defineComponents } from '../../index.js';
import { FormAssociatedTestBed } from '../common/utils.spec.js';

describe('Checkbox', () => {
  before(() => {
    defineComponents(IgcCheckboxComponent);
  });

  const label = 'Label';
  let el: IgcCheckboxComponent;
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
      el = await createCheckboxComponent();
      input = el.renderRoot.querySelector('input') as HTMLInputElement;
    });

    it('should initialize checkbox component with default values', async () => {
      expect(input.id).to.equal('checkbox-1');
      expect(el.name).to.be.undefined;
      expect(input.name).to.equal('');
      expect(el.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(el.checked).to.equal(false);
      expect(input.checked).to.equal(false);
      expect(el.indeterminate).to.equal(false);
      expect(input.indeterminate).to.equal(false);
      expect(el.invalid).to.equal(false);
      expect(el.disabled).to.equal(false);
      expect(input.disabled).to.equal(false);
      expect(el.labelPosition).to.equal('after');
    });

    it('should render a checkbox component successfully', async () => {
      await expect(el).shadowDom.to.be.accessible();
    });

    it('should set the checkbox name property correctly', async () => {
      const name = 'fruit';

      el.name = name;
      expect(el.name).to.equal(name);

      await elementUpdated(el);
      expect(input).dom.to.equal(`<input name="${name}"/>`, DIFF_OPTIONS);
    });

    it('should set the checkbox label position correctly', async () => {
      el.labelPosition = 'before';
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-checkbox label-position="before">${label}</igc-checkbox>`
      );

      el.labelPosition = 'after';
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-checkbox label-position="after">${label}</igc-checkbox>`
      );
    });

    it('should set the checkbox value property correctly', async () => {
      const value = 'apple';

      el.value = value;
      expect(el.value).to.equal(value);

      await elementUpdated(el);
      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
    });

    it('should set the checkbox invalid property correctly', async () => {
      el.invalid = true;
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-checkbox invalid label-position="after">${label}</igc-checkbox>`
      );

      el.invalid = false;
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-checkbox label-position="after">${label}</igc-checkbox>`
      );
    });

    it('should correctly report validity status', async () => {
      el = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox required></igc-checkbox>`
      );
      expect(el.reportValidity()).to.equals(false);

      el = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox required checked></igc-checkbox>`
      );
      expect(el.reportValidity()).to.equals(true);

      el = await fixture<IgcCheckboxComponent>(
        html`<igc-checkbox></igc-checkbox>`
      );
      expect(el.reportValidity()).to.equals(true);
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

      el.checked = true;
      expect(el.checked).to.be.true;
      await elementUpdated(el);
      expect(input).dom.to.equal(`<input aria-checked="true" />`, DIFF_OPTIONS);

      el.checked = false;
      expect(el.checked).to.be.false;
      await elementUpdated(el);

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

      el.indeterminate = true;
      expect(el.indeterminate).to.be.true;
      await elementUpdated(el);
      expect(input).dom.to.equal(
        `<input aria-checked="mixed" />`,
        DIFF_OPTIONS
      );

      el.indeterminate = false;
      expect(el.indeterminate).to.be.false;
      await elementUpdated(el);
      expect(input).dom.to.equal(
        `<input aria-checked="false" />`,
        DIFF_OPTIONS
      );

      el.indeterminate = true;
      expect(el.indeterminate).to.be.true;
      el.checked = true;
      expect(el.checked).to.be.true;
      await elementUpdated(el);
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

      el.disabled = true;
      expect(el.disabled).to.be.true;
      await elementUpdated(el);
      expect(input).dom.to.equal(
        `<input disabled aria-disabled="true" />`,
        DIFF_OPTIONS
      );

      el.disabled = false;
      expect(el.disabled).to.be.false;
      await elementUpdated(el);

      expect(input).dom.to.equal(
        `<input aria-disabled="false" />`,
        DIFF_OPTIONS
      );
    });

    it('should emit igcFocus/igcBlur events when the checkbox gains/loses focus', () => {
      const eventSpy = spy(el, 'emitEvent');
      el.focus();

      expect(el.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when the checkbox checked state changes', async () => {
      const eventSpy = spy(el, 'emitEvent');
      el.click();

      await elementUpdated(el);
      expect(eventSpy).calledWithExactly('igcChange', {
        detail: { checked: true, value: undefined },
      });
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
});
