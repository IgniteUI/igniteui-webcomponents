import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
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
    const spec = createFormAssociatedTestBed<IgcSwitchComponent>(
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
