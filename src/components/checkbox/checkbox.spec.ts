import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcCheckboxComponent } from '../../index.js';
import { formSubmitter } from '../common/utils.spec.js';

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
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.focus();

      expect(el.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when the checkbox checked state changes', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.click();

      await elementUpdated(el);
      expect(eventSpy).calledWithExactly('igcChange', { detail: true });
    });

    const createCheckboxComponent = (
      template = `<igc-checkbox>${label}</igc-checkbox>`
    ) => {
      return fixture<IgcCheckboxComponent>(html`${unsafeStatic(template)}`);
    };
  });

  describe('Form integration', () => {
    let form: HTMLFormElement;
    let checkbox: IgcCheckboxComponent;

    beforeEach(async () => {
      form = await fixture<HTMLFormElement>(html`<form>
        <fieldset>
          <igc-checkbox name="checkbox"
            >I have reviewed ToC and I agree</igc-checkbox
          >
        </fieldset>
      </form>`);
      checkbox = form.querySelector('igc-checkbox')!;
    });

    it('is form associated', async () => {
      expect(checkbox.form).to.equal(form);
    });

    it('is associated on submit with default value "on"', async () => {
      const submit = formSubmitter(form);

      checkbox.checked = true;
      await elementUpdated(checkbox);

      submit((data) => {
        expect(data.get('checkbox')).to.equal('on');
      });
    });

    it('is associated on submit with value', async () => {
      const submit = formSubmitter(form);

      checkbox.checked = true;
      checkbox.value = 'toc-accepted';
      await elementUpdated(checkbox);

      submit((data) => expect(data.get('checkbox')).to.equal('toc-accepted'));
    });

    it('is not associated on submit if not checked', async () => {
      const submit = formSubmitter(form);

      submit((data) => expect(data.get('checkbox')).to.be.null);
    });

    it('is correctly reset when the parent form is reset', async () => {
      checkbox.checked = true;
      await elementUpdated(checkbox);

      form.reset();
      expect(checkbox.checked).to.be.false;
    });

    it('reflects disabled state based on ancestor disabled state', async () => {
      const fieldset = form.querySelector('fieldset')!;

      fieldset.disabled = true;
      await elementUpdated(form);
      expect(checkbox.disabled).to.be.true;

      fieldset.disabled = false;
      await elementUpdated(form);
      expect(checkbox.disabled).to.be.false;
    });

    describe('constraint validation and validation states', () => {
      it('required constraint', async () => {
        const submit = formSubmitter(form);

        checkbox.required = true;
        await elementUpdated(checkbox);

        submit();

        expect(checkbox.checkValidity()).to.be.false;
        expect(checkbox.invalid).to.be.true;

        form.reset();

        checkbox.required = false;
        await elementUpdated(checkbox);

        submit();

        expect(checkbox.checkValidity()).to.be.true;
        expect(checkbox.invalid).to.be.false;
      });

      it('custom error constraint', async () => {
        const submit = formSubmitter(form);

        checkbox.setCustomValidity('no');
        await elementUpdated(checkbox);

        submit();

        expect(checkbox.checkValidity()).to.be.false;
        expect(checkbox.invalid).to.be.true;

        form.reset();

        checkbox.setCustomValidity('');
        await elementUpdated(checkbox);

        submit();

        expect(checkbox.checkValidity()).to.be.true;
        expect(checkbox.invalid).to.be.false;
      });
    });
  });
});
