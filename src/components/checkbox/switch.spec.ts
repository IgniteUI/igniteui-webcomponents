import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcSwitchComponent } from '../../index.js';
import { formSubmitter } from '../common/utils.spec.js';

describe('Switch', () => {
  before(() => {
    defineComponents(IgcSwitchComponent);
  });

  const label = 'Label';
  let el: IgcSwitchComponent;
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
      el = await createSwitchComponent();
      input = el.renderRoot.querySelector('input') as HTMLInputElement;
    });

    it('should initialize switch component with default values', async () => {
      expect(input.id).to.equal('switch-1');
      expect(el.name).to.be.undefined;
      expect(input.name).to.equal('');
      expect(el.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(el.checked).to.equal(false);
      expect(input.checked).to.equal(false);
      expect(el.invalid).to.equal(false);
      expect(el.disabled).to.equal(false);
      expect(input.disabled).to.equal(false);
      expect(el.labelPosition).to.equal('after');
    });

    it('should render a switch component successfully', async () => {
      await expect(el).shadowDom.to.be.accessible();
    });

    it('should set the switch name property correctly', async () => {
      const name = 'fruit';

      el.name = name;
      expect(el.name).to.equal(name);

      await elementUpdated(el);
      expect(input).dom.to.equal(`<input name="${name}"/>`, DIFF_OPTIONS);
    });

    it('should set the switch label position correctly', async () => {
      el.labelPosition = 'before';
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-switch label-position="before">${label}</igc-switch>`
      );

      el.labelPosition = 'after';
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-switch label-position="after">${label}</igc-switch>`
      );
    });

    it('should set the switch value property correctly', async () => {
      const value = 'apple';

      el.value = value;
      expect(el.value).to.equal(value);

      await elementUpdated(el);
      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
    });

    it('should set the switch invalid property correctly', async () => {
      el.invalid = true;
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-switch invalid label-position="after">${label}</igc-switch>`
      );

      el.invalid = false;
      await elementUpdated(el);
      expect(el).dom.to.equal(
        `<igc-switch label-position="after">${label}</igc-switch>`
      );
    });

    it('should correctly report validity status', async () => {
      el = await fixture<IgcSwitchComponent>(
        html`<igc-switch required></igc-switch>`
      );
      expect(el.reportValidity()).to.equals(false);

      el = await fixture<IgcSwitchComponent>(
        html`<igc-switch required checked></igc-switch>`
      );
      expect(el.reportValidity()).to.equals(true);

      el = await fixture<IgcSwitchComponent>(html`<igc-switch></igc-switch>`);
      expect(el.reportValidity()).to.equals(true);
    });

    it('should set the switch checked property correctly', async () => {
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

    it('should set the switch disabled property correctly', async () => {
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

    it('should emit igcFocus/igcBlur events when the switch gains/loses focus', () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.focus();

      expect(el.shadowRoot?.activeElement).to.equal(input);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
    });

    it('should emit igcChange event when the switch checked state changes', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.click();

      await elementUpdated(el);
      expect(eventSpy).calledWithExactly('igcChange', { detail: true });
    });

    const createSwitchComponent = (
      template = `<igc-switch>${label}</igc-switch>`
    ) => {
      return fixture<IgcSwitchComponent>(html`${unsafeStatic(template)}`);
    };
  });

  describe('Form integration', () => {
    let form: HTMLFormElement;
    let switchEl: IgcSwitchComponent;

    beforeEach(async () => {
      form = await fixture<HTMLFormElement>(html`
        <form>
          <fieldset>
            <igc-switch name="switch">
              I have reviewed ToC and I agree
            </igc-switch>
          </fieldset>
        </form>
      `);
      switchEl = form.querySelector('igc-switch')!;
    });

    it('is form associated', async () => {
      expect(switchEl.form).to.equal(form);
    });

    it('is associated on submit with default value "on"', async () => {
      const submit = formSubmitter(form);

      switchEl.checked = true;
      await elementUpdated(switchEl);

      submit((data) => expect(data.get('switch')).to.equal('on'));
    });

    it('is associated on submit with value', async () => {
      const submit = formSubmitter(form);

      switchEl.checked = true;
      switchEl.value = 'toc-accepted';
      await elementUpdated(switchEl);

      submit((data) => expect(data.get('switch')).to.equal('toc-accepted'));
    });

    it('is not associated on submit if not checked', async () => {
      const submit = formSubmitter(form);

      submit((data) => expect(data.get('switch')).to.be.null);
    });

    it('is correctly reset when the parent form is reset', async () => {
      switchEl.checked = true;
      await elementUpdated(switchEl);

      form.reset();
      expect(switchEl.checked).to.be.false;
    });

    it('correctly reflects disabled state based on ancestor disabled state', async () => {
      const fieldset = form.querySelector('fieldset')!;

      fieldset.disabled = true;
      await elementUpdated(form);
      expect(switchEl.disabled).to.be.true;

      fieldset.disabled = false;
      await elementUpdated(form);
      expect(switchEl.disabled).to.be.false;
    });

    describe('constraint validation and validation states', () => {
      it('required constraint', async () => {
        const submit = formSubmitter(form);

        switchEl.required = true;
        await elementUpdated(switchEl);

        submit();

        expect(switchEl.checkValidity()).to.be.false;
        expect(switchEl.invalid).to.be.true;

        form.reset();

        switchEl.required = false;
        await elementUpdated(switchEl);

        submit();

        expect(switchEl.checkValidity()).to.be.true;
        expect(switchEl.invalid).to.be.false;
      });

      it('custom error constraint', async () => {
        const submit = formSubmitter(form);

        switchEl.setCustomValidity('no');
        await elementUpdated(switchEl);

        submit();

        expect(switchEl.checkValidity()).to.be.false;
        expect(switchEl.invalid).to.be.true;

        form.reset();

        switchEl.setCustomValidity('');
        await elementUpdated(switchEl);

        submit();

        expect(switchEl.checkValidity()).to.be.true;
        expect(switchEl.invalid).to.be.false;
      });
    });
  });
});
