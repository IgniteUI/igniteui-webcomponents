import { IgcCheckboxComponent } from './checkbox';
import '../../../igniteui-webcomponents.js';
import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';

describe('Checkbox', () => {
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
      expect(input.id).to.equal('checkbox-0');
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
      expect(el).shadowDom.to.be.accessible();
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
      expect(eventSpy).calledWithExactly('igcChange');
    });

    const createCheckboxComponent = (
      template = `<igc-checkbox>${label}</igc-checkbox>`
    ) => {
      return fixture<IgcCheckboxComponent>(html`${unsafeStatic(template)}`);
    };
  });
});
