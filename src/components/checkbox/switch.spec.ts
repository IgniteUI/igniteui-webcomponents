import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  isFocused,
} from '../common/utils.spec.js';
import IgcSwitchComponent from './switch.js';

describe('Switch', () => {
  before(() => {
    defineComponents(IgcSwitchComponent);
  });

  const label = 'Label';
  let element: IgcSwitchComponent;
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
      element = await fixture(html`<igc-switch>${label}</igc-switch>`);
      input = element.renderRoot.querySelector('input') as HTMLInputElement;
    });

    it('should initialize switch component with default values', async () => {
      expect(input.id).to.equal('switch-1');
      expect(element.name).to.be.undefined;
      expect(input.name).to.be.empty;
      expect(element.value).to.be.undefined;
      expect(input.value).to.equal('on');
      expect(element.checked).to.be.false;
      expect(input.checked).to.be.false;
      expect(element.invalid).to.be.false;
      expect(element.disabled).to.be.false;
      expect(input.disabled).to.be.false;
      expect(element.labelPosition).to.equal('after');
    });

    it('should render a switch component successfully', async () => {
      await expect(element).shadowDom.to.be.accessible();
      await expect(element).to.be.accessible();
    });

    it('should set the switch name property correctly', async () => {
      const name = 'fruit';

      element.name = name;
      await elementUpdated(element);

      expect(input).dom.to.equal(`<input name="${name}"/>`, DIFF_OPTIONS);
    });

    it('should set the switch label position correctly', async () => {
      element.labelPosition = 'before';
      await elementUpdated(element);

      expect(element).dom.to.equal(
        `<igc-switch label-position="before">${label}</igc-switch>`
      );

      element.labelPosition = 'after';
      await elementUpdated(element);

      expect(element).dom.to.equal(
        `<igc-switch label-position="after">${label}</igc-switch>`
      );
    });

    it('should set the switch value property correctly', async () => {
      const value = 'apple';

      element.value = value;
      await elementUpdated(element);

      expect(input).dom.to.equal(`<input value="${value}"/>`, DIFF_OPTIONS);
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
      expect(isFocused(input)).to.be.true;

      element.blur();
      expect(isFocused(element)).to.be.false;
      expect(isFocused(input)).to.be.false;
    });

    it('should emit igcChange event when the switch checked state changes', async () => {
      const eventSpy = spy(element, 'emitEvent');
      element.click();

      await elementUpdated(element);
      expect(eventSpy).calledWithExactly('igcChange', {
        detail: { checked: true, value: undefined },
      });
    });
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcSwitchComponent>(html`
      <igc-switch name="checkbox"> I have reviewed ToC and I agree </igc-switch>
    `);

    beforeEach(async () => {
      await spec.setup(IgcSwitchComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is associated on submit with default value "on"', () => {
      spec.setProperties({ checked: true });
      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with passed value', () => {
      spec.setProperties({ checked: true, value: 'accepted' });
      spec.assertSubmitHasValue('accepted');
    });

    it('is not associated on submit if not checked', () => {
      spec.assertSubmitHasValue(null);
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

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });

  describe('defaultChecked', () => {
    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcSwitchComponent>(html`
        <igc-switch name="checkbox" .defaultChecked=${true}></igc-switch>
      `);

      beforeEach(async () => {
        await spec.setup(IgcSwitchComponent.tagName);
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
      const spec = createFormAssociatedTestBed<IgcSwitchComponent>(html`
        <igc-switch name="checkbox" required></igc-switch>
      `);

      beforeEach(async () => {
        await spec.setup(IgcSwitchComponent.tagName);
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
});
