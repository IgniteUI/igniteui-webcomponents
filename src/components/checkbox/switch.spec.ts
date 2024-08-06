import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { IgcSwitchComponent, defineComponents } from '../../index.js';
import { FormAssociatedTestBed, isFocused } from '../common/utils.spec.js';

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

    it('should have correct focus states between Light/Shadow DOM', () => {
      el.focus();
      expect(isFocused(el)).to.be.true;
      expect(isFocused(input)).to.be.true;

      el.blur();
      expect(isFocused(el)).to.be.false;
      expect(isFocused(input)).to.be.false;
    });

    it('should emit igcChange event when the switch checked state changes', async () => {
      const eventSpy = spy(el, 'emitEvent');
      el.click();

      await elementUpdated(el);
      expect(eventSpy).calledWithExactly('igcChange', {
        detail: { checked: true, value: undefined },
      });
    });

    const createSwitchComponent = (
      template = `<igc-switch>${label}</igc-switch>`
    ) => {
      return fixture<IgcSwitchComponent>(html`${unsafeStatic(template)}`);
    };
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcSwitchComponent>(
      html`<igc-switch name="checkbox"
        >I have reviewed ToC and I agree</igc-switch
      >`
    );

    beforeEach(async () => {
      await spec.setup(IgcSwitchComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit with default value "on"', async () => {
      spec.element.checked = true;
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal('on');
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

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });
});
