import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  createFormAssociatedTestBed,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import { isUnderPageLayer } from '#internals/testing/helpers.spec.js';
import { runHiddenAncestorTests } from '#internals/testing/hidden-ancestor.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
} from '#internals/testing/validity-helpers.spec.js';
import { runValueStateMotionTests } from '#internals/testing/value-state.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { preventDefault } from '#internals/utils/events.js';
import IgcRadioGroupComponent from '../radio-group/radio-group.js';
import IgcRadioComponent from './radio.js';

describe('Radio Component', () => {
  before(() => {
    defineComponents(IgcRadioComponent, IgcRadioGroupComponent);
  });

  const label = 'Apple';
  let radio: IgcRadioComponent;
  let input: HTMLInputElement;

  /** Renders `template` and returns its radios in DOM order, after their first update. */
  async function radiosOf(
    template: TemplateResult
  ): Promise<IgcRadioComponent[]> {
    const container = await fixture<HTMLElement>(template);
    const radios = Array.from(
      container.querySelectorAll(IgcRadioComponent.tagName)
    );
    await Promise.all(radios.map((radio) => elementUpdated(radio)));
    return radios;
  }

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

    it('paints the control under an earlier page layer, also in a horizontal group', async () => {
      const control = (el: IgcRadioComponent) =>
        el.renderRoot.querySelector('[part~="control"]')!;

      expect(isUnderPageLayer(radio, control(radio))).to.be.true;

      const group = await fixture<IgcRadioGroupComponent>(
        html`<igc-radio-group alignment="horizontal"
          ><igc-radio>${label}</igc-radio></igc-radio-group
        >`
      );
      const grouped = group.querySelector(IgcRadioComponent.tagName)!;

      expect(isUnderPageLayer(group, control(grouped))).to.be.true;
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
        html`<igc-radio aria-labelledby=${labelId}></igc-radio>
          <span id=${labelId}>My Label</span>`
      );
      const input = radio.renderRoot.querySelector('input') as HTMLInputElement;

      // An IDREF does not cross the shadow boundary. The host binds the
      // element by reference.
      expect(radio.getAttribute('aria-labelledby')).to.equal(labelId);
      expect(input.ariaLabelledByElements).to.eql([
        document.getElementById(labelId),
      ]);
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

      expect(firstOf(radios).reportValidity()).to.be.false;
      expect(radios.every((radio) => radio.invalid)).to.be.true;

      firstOf(radios).checked = true;
      expect(firstOf(radios).reportValidity()).to.be.true;
      expect(radios.every((radio) => radio.invalid)).to.be.false;
    });
  });

  describe('Form integration', () => {
    const values = [1, 2, 3];
    let radios: IgcRadioComponent[] = [];
    const spec = createFormAssociatedTestBed<IgcRadioComponent>(
      html`${values.map(
          (e) => html`<igc-radio name="radio" value=${e}>${e}</igc-radio>`
        )}<button type="submit">Submit</button>`
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

      firstOf(radios).checked = true;
      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with default value "on" (setting `checked` first)', () => {
      firstOf(radios).checked = true;
      radios.forEach((radio) => {
        radio.value = '';
      });

      spec.assertSubmitHasValue('on');
    });

    it('is associated on submit with passed value', () => {
      firstOf(radios).checked = true;
      spec.assertSubmitHasValue(firstOf(radios).value);
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ checked: true });
      spec.reset();

      expect(spec.element.checked).to.be.false;
    });

    it('should reset to the new default value after setAttribute() call', () => {
      firstOf(radios).toggleAttribute('checked', true);
      lastOf(radios).toggleAttribute('checked', true);
      firstOf(radios).checked = true;

      expect(lastOf(radios).checked).to.be.false;

      spec.reset();
      expect(lastOf(radios).checked).to.be.true;
      expect(firstOf(radios).checked).to.be.false;

      spec.assertSubmitHasValue(lastOf(radios).value);
    });

    it('should not restore a checked state whose attribute was removed before reset', () => {
      // Removing the `checked` attribute must clear `defaultChecked`.
      const radio = firstOf(radios);

      radio.toggleAttribute('checked', true);
      expect(radio.checked).to.be.true;

      radio.removeAttribute('checked');
      expect(radio.checked).to.be.false;

      spec.reset();
      expect(radio.checked).to.be.false;
    });

    it('is correctly submitted on pressing Enter', () => {
      expect(
        spec.submitWithEnter(spec.element.renderRoot.querySelector('input'))
      ).to.be.true;
    });

    it('does not submit on Enter without a submit button', () => {
      spec.form.querySelector('button')!.remove();
      expect(
        spec.submitWithEnter(spec.element.renderRoot.querySelector('input'))
      ).to.be.false;
    });

    it('should not submit on pressing Enter when value is invalid', () => {
      spec.setProperties({ required: true, checked: false });
      expect(
        spec.submitWithEnter(spec.element.renderRoot.querySelector('input'))
      ).to.be.false;
    });

    it('does not submit when a listener cancels the Enter key press', () => {
      spec.element.addEventListener('keydown', preventDefault);
      expect(
        spec.submitWithEnter(spec.element.renderRoot.querySelector('input'), {
          cancelable: true,
        })
      ).to.be.false;
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
        lastOf(radios).checked = true;
        spec.reset();

        expect(spec.element.checked).to.be.true;
      });

      it('preserves sibling pristine state on form reset', () => {
        lastOf(radios).checked = true;
        spec.reset();

        expect(radios.filter((radio) => radio.checked)).to.eql([
          firstOf(radios),
        ]);

        // All radios are pristine again after the reset, so reassigning a
        // default must sync the live checked state.
        lastOf(radios).defaultChecked = true;
        expect(lastOf(radios).checked).to.be.true;
      });

      it('stays pristine after a change of the value', () => {
        spec.element.value = 'one';

        spec.assertSubmitHasValue('one');
        spec.assertIsPristine();

        // As for a native radio, a pristine radio takes the new default.
        spec.element.defaultChecked = false;
        expect(spec.element.checked).to.be.false;
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
      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      spec.element.click();
      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('Group membership', () => {
    let radios: IgcRadioComponent[];

    function tabIndexOf(radio: IgcRadioComponent): number {
      return radio.renderRoot.querySelector('input')!.tabIndex;
    }

    beforeEach(async () => {
      radios = Array.from(
        (
          await fixture(html`
            <div>
              <igc-radio name="fruit" value="apple">Apple</igc-radio>
              <igc-radio name="fruit" value="orange">Orange</igc-radio>
              <igc-radio name="fruit" value="mango">Mango</igc-radio>
            </div>
          `)
        ).querySelectorAll(IgcRadioComponent.tagName)
      );
    });

    it('restores the tab stop when the checked radio is removed', async () => {
      const [checked, ...remaining] = radios;

      checked.click();
      await elementUpdated(checked);
      expect(remaining.every((radio) => tabIndexOf(radio) === -1)).to.be.true;

      checked.remove();
      await Promise.all(remaining.map((radio) => elementUpdated(radio)));
      expect(remaining.every((radio) => tabIndexOf(radio) === 0)).to.be.true;
    });

    it('keeps the checked radio as the sole tab stop when another is removed', async () => {
      const [checked, removed, other] = radios;

      checked.click();
      await elementUpdated(checked);

      removed.remove();
      await Promise.all([checked, other].map((radio) => elementUpdated(radio)));
      expect(tabIndexOf(checked)).to.equal(0);
      expect(tabIndexOf(other)).to.equal(-1);
    });

    it('restores the tab stop when the checked radio moves to another group by name', async () => {
      const [moved, ...remaining] = radios;

      moved.click();
      await elementUpdated(moved);

      moved.name = 'vegetable';
      await Promise.all(radios.map((radio) => elementUpdated(radio)));

      // The group that stays behind has no selection, so each radio is a tab stop.
      expect(remaining.every((radio) => tabIndexOf(radio) === 0)).to.be.true;
      // The radio that moved is the only member of its new group, and it is checked.
      expect(tabIndexOf(moved)).to.equal(0);
    });

    it('drops a radio that has left the group from a synchronous read', async () => {
      const [first, , moved] = radios;

      moved.click();
      await elementUpdated(moved);

      // No await: the radio has its new name from this point, before it renders
      // again. A selection in the group that it left must not change it.
      moved.name = 'vegetable';
      first.click();

      expect(first.checked).to.be.true;
      expect(moved.checked).to.be.true;
    });

    it('keeps the group reachable when the checked radio is disabled', async () => {
      const [checked, ...remaining] = radios;

      checked.click();
      await elementUpdated(checked);
      expect(remaining.every((radio) => tabIndexOf(radio) === -1)).to.be.true;

      // A disabled radio is out of the tab order. Without a tab stop of their own,
      // the radios that stay enabled make the group unreachable with the Tab key.
      checked.disabled = true;
      await Promise.all(radios.map((radio) => elementUpdated(radio)));

      expect(remaining.every((radio) => tabIndexOf(radio) === 0)).to.be.true;
    });

    it('derives the tab stop from the default state on form reset', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </form>
      `);
      const [apple, orange] = Array.from(
        form.querySelectorAll(IgcRadioComponent.tagName)
      );

      orange.click();
      await elementUpdated(orange);
      expect(tabIndexOf(orange)).to.equal(0);
      expect(tabIndexOf(apple)).to.equal(-1);

      // The reset restores the default state of each radio, and the group sync
      // brings the tab stop back to the radio that it belongs to.
      form.reset();
      await Promise.all([apple, orange].map((radio) => elementUpdated(radio)));

      expect(tabIndexOf(apple)).to.equal(0);
      expect(tabIndexOf(orange)).to.equal(-1);
    });

    it('joins the new group of a radio on a synchronous read', async () => {
      const [joining, checked] = Array.from(
        (
          await fixture(html`
            <div>
              <igc-radio name="vegetable" value="carrot">Carrot</igc-radio>
              <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
            </div>
          `)
        ).querySelectorAll(IgcRadioComponent.tagName)
      );

      joining.name = 'fruit';
      joining.click();

      expect(joining.checked).to.be.true;
      expect(checked.checked).to.be.false;
    });

    it('keeps same-name radios of two forms in separate groups', async () => {
      const [apple, orange, mango, peach] = await radiosOf(html`
        <div>
          <form>
            <igc-radio name="fruit" value="apple">Apple</igc-radio>
            <igc-radio name="fruit" value="orange">Orange</igc-radio>
          </form>
          <form>
            <igc-radio name="fruit" value="mango">Mango</igc-radio>
            <igc-radio name="fruit" value="peach">Peach</igc-radio>
          </form>
        </div>
      `);

      apple.click();
      mango.click();
      await Promise.all(
        [apple, orange, mango, peach].map((radio) => elementUpdated(radio))
      );

      // A selection in one form leaves the other one alone, and each form keeps
      // the tab stop of its own group.
      expect(apple.checked).to.be.true;
      expect(mango.checked).to.be.true;
      expect(tabIndexOf(apple)).to.equal(0);
      expect(tabIndexOf(orange)).to.equal(-1);
      expect(tabIndexOf(mango)).to.equal(0);
      expect(tabIndexOf(peach)).to.equal(-1);
    });

    it('restores the tab stop when the checked radio moves to another group by form', async () => {
      const [apple, orange] = await radiosOf(html`
        <div>
          <form>
            <igc-radio name="fruit" value="apple">Apple</igc-radio>
            <igc-radio name="fruit" value="orange">Orange</igc-radio>
          </form>
          <form id="other"></form>
        </div>
      `);

      apple.click();
      await elementUpdated(apple);
      expect(tabIndexOf(orange)).to.equal(-1);

      // The group left behind loses its selection along with the radio that
      // held it, so the radio that stays becomes its tab stop.
      apple.setAttribute('form', 'other');
      await Promise.all([apple, orange].map((radio) => elementUpdated(radio)));

      expect(tabIndexOf(orange)).to.equal(0);
    });

    it('moves a radio to the group of its new form owner', async () => {
      const [apple, peach, mango] = await radiosOf(html`
        <div>
          <form>
            <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
            <igc-radio name="fruit" value="peach">Peach</igc-radio>
          </form>
          <form id="other">
            <igc-radio name="fruit" value="mango" checked>Mango</igc-radio>
          </form>
        </div>
      `);

      // The `form` attribute overrides the ancestor form as the owner.
      peach.setAttribute('form', 'other');
      peach.click();
      await Promise.all(
        [apple, peach, mango].map((radio) => elementUpdated(radio))
      );

      expect(mango.checked).to.be.false;
      expect(apple.checked).to.be.true;
    });
  });

  describe('Group form state', () => {
    function createRadio(
      properties: Partial<IgcRadioComponent>
    ): IgcRadioComponent {
      return Object.assign(
        document.createElement(IgcRadioComponent.tagName),
        properties
      );
    }

    function valueMissingOf(radios: IgcRadioComponent[]): boolean[] {
      return radios.map((radio) => radio.validity.valueMissing);
    }

    it('drops the required constraint of a radio that leaves the group by name', async () => {
      const [required, other] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </div>
      `);

      expect(valueMissingOf([required, other])).to.eql([true, true]);

      // No await: as for a native radio, the group changes with the name.
      required.name = 'vegetable';
      expect(other.validity.valueMissing).to.be.false;
      expect(required.validity.valueMissing).to.be.true;
    });

    it('drops the required constraint of a radio that is removed', async () => {
      const [required, other] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </div>
      `);

      required.remove();
      expect(other.validity.valueMissing).to.be.false;
    });

    it('gives a removed radio the state of a group of its own', async () => {
      const [required, checked, other] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange" checked>Orange</igc-radio>
          <igc-radio name="fruit" value="mango">Mango</igc-radio>
        </div>
      `);

      expect(valueMissingOf([required, other])).to.eql([false, false]);

      // As for a native radio, a removed radio is the only radio of its group.
      required.remove();
      expect(required.validity.valueMissing).to.be.true;

      checked.checked = false;
      checked.required = true;
      expect(other.validity.valueMissing).to.be.true;

      other.remove();
      expect(other.validity.valueMissing).to.be.false;
    });

    it('applies the required constraint of a radio that joins the group', async () => {
      const radios = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple">Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </div>
      `);
      const joining = createRadio({
        name: 'fruit',
        value: 'mango',
        required: true,
      });

      firstOf(radios).parentElement!.append(joining);
      expect(valueMissingOf([...radios, joining])).to.eql([true, true, true]);
    });

    it('fails the required constraint when the checked radio leaves the group', async () => {
      const [required, checked] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange" checked>Orange</igc-radio>
        </div>
      `);

      expect(required.validity.valueMissing).to.be.false;

      checked.name = 'vegetable';
      expect(required.validity.valueMissing).to.be.true;
    });

    it('validates the whole group on form reset', async () => {
      const radios = await radiosOf(html`
        <form>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </form>
      `);

      lastOf(radios).checked = true;
      expect(valueMissingOf(radios)).to.eql([false, false]);

      // No await: as for a native radio, the validity follows the reset at once.
      firstOf(radios).form!.reset();
      expect(valueMissingOf(radios)).to.eql([true, true]);
    });

    it('counts a disabled checked radio for the required constraint', async () => {
      const [required, checked] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange" checked disabled
            >Orange</igc-radio
          >
        </div>
      `);

      expect(checked.checked).to.be.true;
      expect(required.validity.valueMissing).to.be.false;
    });

    it('unchecks the group when a checked radio connects before its checked radio', async () => {
      const [apple, orange] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple">Apple</igc-radio>
          <igc-radio name="fruit" value="orange" checked>Orange</igc-radio>
        </div>
      `);
      const joining = createRadio({
        name: 'fruit',
        value: 'mango',
        checked: true,
      });

      apple.before(joining);

      expect(joining.checked).to.be.true;
      expect(apple.checked).to.be.false;
      expect(orange.checked).to.be.false;
    });

    it('unchecks the group when a checked radio joins it by name', async () => {
      const [moving, checked] = await radiosOf(html`
        <div>
          <igc-radio name="vegetable" value="carrot" checked>Carrot</igc-radio>
          <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
        </div>
      `);

      // No await: as for a native radio, the radio that moves in wins at once.
      moving.name = 'fruit';

      expect(moving.checked).to.be.true;
      expect(checked.checked).to.be.false;
    });

    it('unchecks the group when a checked radio joins it by form owner', async () => {
      const [moving, checked] = await radiosOf(html`
        <div>
          <form>
            <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
          </form>
          <form id="other">
            <igc-radio name="fruit" value="mango" checked>Mango</igc-radio>
          </form>
        </div>
      `);

      moving.setAttribute('form', 'other');

      expect(moving.checked).to.be.true;
      expect(checked.checked).to.be.false;
    });

    it('keeps the other radios pristine when the group unchecks them', async () => {
      const [checked, other] = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
        </div>
      `);

      // As for a native radio, a pristine radio takes its new default.
      other.defaultChecked = true;

      expect(other.checked).to.be.true;
      expect(checked.checked).to.be.false;
    });

    it('keeps the default of each radio', async () => {
      const radios = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
          <igc-radio name="fruit" value="orange" checked>Orange</igc-radio>
        </div>
      `);

      // As for native radios, the last checked radio wins, and each radio keeps
      // the default of its `checked` attribute.
      expect(radios.map((radio) => radio.checked)).to.eql([false, true]);
      expect(radios.map((radio) => radio.defaultChecked)).to.eql([true, true]);
    });

    it('emits `invalid` in DOM order from any radio of the group', async () => {
      const radios = await radiosOf(html`
        <div>
          <igc-radio name="fruit" value="apple" required>Apple</igc-radio>
          <igc-radio name="fruit" value="orange">Orange</igc-radio>
          <igc-radio name="fruit" value="mango">Mango</igc-radio>
        </div>
      `);
      const order: string[] = [];

      for (const radio of radios) {
        radio.addEventListener('invalid', () => order.push(radio.value));
      }

      expect(firstOf(radios).checkValidity()).to.be.false;
      expect(order).to.eql(['apple', 'orange', 'mango']);

      order.length = 0;
      expect(radios[1].reportValidity()).to.be.false;
      expect(order).to.eql(['apple', 'orange', 'mango']);
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcRadioComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } },
          { slots: ['customError'] },
          { slots: ['invalid'], props: { required: true } },
        ];

      await runValidationContainerTests(IgcRadioComponent, testParameters);
    });
  });

  runExternalLabelAssociationTests({
    tagName: IgcRadioComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcRadioComponent).renderRoot.querySelector('input')!,
    checkable: true,
  });

  runHiddenAncestorTests(html`
    <igc-radio-group>
      <igc-radio value="one">One</igc-radio>
      <igc-radio value="two" checked>Two</igc-radio>
    </igc-radio-group>
  `);

  runFocusBeforeRenderTests(html`<igc-radio>Label</igc-radio>`);

  runValueStateMotionTests<IgcRadioComponent>({
    template: html`<igc-radio>Label</igc-radio>`,
    changedTemplate: html`<igc-radio checked>Label</igc-radio>`,
    changeFromCode: (radio) => {
      radio.checked = true;
    },
    changeByUser: (radio) =>
      simulateClick(radio.renderRoot.querySelector('input')!),
  });
});
