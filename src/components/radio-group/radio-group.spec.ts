import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { internalsOf } from '#internals/controllers/internals.js';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { isFocused } from '#internals/testing/helpers.spec.js';
import { simulateKeyboard } from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import IgcRadioComponent from '../radio/radio.js';
import IgcRadioGroupComponent from './radio-group.js';

describe('Radio Group Component', () => {
  before(() => {
    defineComponents(IgcRadioGroupComponent);
  });

  let group: IgcRadioGroupComponent;
  let radios: IgcRadioComponent[];
  const values = ['apple', 'orange', 'mango'];

  describe('', () => {
    describe('Properties and attributes', () => {
      beforeEach(async () => {
        group = await fixture(createDefaultGroup());
        radios = Array.from(group.querySelectorAll(IgcRadioComponent.tagName));
      });

      it('is initialized with sensible default values', async () => {
        expect(group.alignment).to.equal('vertical');
        expect(group.name).to.be.undefined;
        expect(group.value).to.be.empty;
      });

      it('is accessible', async () => {
        await expect(group).dom.to.be.accessible();
        await expect(group).shadowDom.to.be.accessible();
      });

      it('setting a `name` overwrites the children names', async () => {
        group.name = 'new-name';
        await elementUpdated(group);

        expect(radios.every((radio) => radio.name === group.name)).to.be.true;
      });

      it('setting a `value` property is reflected in the radio children', async () => {
        group.value = 'mango';
        await elementUpdated(group);

        expect(radios.find((radio) => radio.value === 'mango')?.checked).to.be
          .true;
      });

      it('`value` property returns the checked state of the radio children', async () => {
        radios[0].checked = true;
        await elementUpdated(radios[0]);

        expect(group.value).to.equal(radios[0].value);
      });
    });

    describe('Behaviors', () => {
      describe('Initial rendering with `name` and `value` state', async () => {
        beforeEach(async () => {
          group = await fixture(createGroupWithInitialState());
          radios = Array.from(
            group.querySelectorAll(IgcRadioComponent.tagName)
          );
        });

        it('has correct initial rendering state', async () => {
          expect(radios.every((radio) => radio.name === group.name)).to.be.true;
          expect(radios.find((radio) => radio.value === group.value)?.checked)
            .to.be.true;
        });
      });

      describe('Initial rendering with declarative checked state on an radio child', () => {
        beforeEach(async () => {
          group = await fixture(createGroupWithChildCheckedState());
          radios = Array.from(
            group.querySelectorAll(IgcRadioComponent.tagName)
          );
        });

        it('has correct initial rendering state', async () => {
          expect(radios.every((radio) => radio.name === group.name)).to.be.true;
          expect(radios[2].checked).to.be.true;
        });
      });

      describe('Keyboard navigation', () => {
        let spies: unknown[];

        async function waitForUpdate() {
          await Promise.all(radios.map((radio) => elementUpdated(radio)));
        }

        function validateGroupSelected(radio: IgcRadioComponent) {
          expect(group.value).to.equal(radio.value);
        }

        beforeEach(async () => {
          group = await fixture(createDefaultGroup());
          radios = Array.from(
            group.querySelectorAll(IgcRadioComponent.tagName)
          );
          spies = radios.map((radio) => spy(radio, 'emitEvent'));
        });

        it('should be able to navigate through radios using arrow keys', async () => {
          const [first, second, third] = radios;
          const [firstSpy, secondSpy, thirdSpy] = spies;

          first.click();
          await elementUpdated(first);

          validateGroupSelected(first);
          expect(isFocused(first)).to.be.true;
          expect(firstSpy).calledWith('igcChange');

          simulateKeyboard(first, arrowDown);
          await waitForUpdate();

          validateGroupSelected(second);
          expect(isFocused(first)).to.be.false;
          expect(isFocused(second)).to.be.true;
          expect(secondSpy).calledWith('igcChange');

          simulateKeyboard(second, arrowUp);
          await waitForUpdate();

          validateGroupSelected(first);
          expect(isFocused(second)).to.be.false;
          expect(isFocused(first)).to.be.true;
          expect(firstSpy).to.be.calledWith('igcChange');

          simulateKeyboard(first, arrowRight);
          await waitForUpdate();

          validateGroupSelected(second);
          expect(isFocused(first)).to.be.false;
          expect(isFocused(second)).to.be.true;
          expect(secondSpy).to.be.calledWith('igcChange');

          simulateKeyboard(second, arrowLeft);
          await waitForUpdate();

          validateGroupSelected(first);
          expect(isFocused(second)).to.be.false;
          expect(isFocused(first)).to.be.true;
          expect(firstSpy).to.be.calledWith('igcChange');

          simulateKeyboard(first, arrowLeft);
          await waitForUpdate();

          validateGroupSelected(third);
          expect(isFocused(first)).to.be.false;
          expect(isFocused(third)).to.be.true;
          expect(thirdSpy).to.be.calledWith('igcChange');

          simulateKeyboard(third, arrowDown);
          await waitForUpdate();

          validateGroupSelected(first);
          expect(isFocused(third)).to.be.false;
          expect(isFocused(first)).to.be.true;
          expect(firstSpy).to.be.calledWith('igcChange');
        });

        it('should skip disabled radios when navigating', async () => {
          const [first, second, third] = radios;
          const [_, secondSpy, thirdSpy] = spies;

          second.disabled = true;
          await elementUpdated(second);

          first.click();
          await elementUpdated(first);

          validateGroupSelected(first);

          simulateKeyboard(first, arrowDown);
          await waitForUpdate();

          validateGroupSelected(third);
          expect(isFocused(first)).to.be.false;
          expect(isFocused(third)).to.be.true;
          expect(secondSpy).to.not.be.called;
          expect(thirdSpy).calledWith('igcChange');
        });
      });
    });

    describe('Dynamic children', () => {
      function tabIndexOf(radio: IgcRadioComponent): number {
        return radio.renderRoot.querySelector('input')!.tabIndex;
      }

      beforeEach(async () => {
        group = await fixture(createGroupWithInitialState());
        radios = Array.from(group.querySelectorAll(IgcRadioComponent.tagName));
      });

      it('adopts a radio added at runtime', async () => {
        const added = await appendRadio({ value: 'kiwi' });

        expect(added.name).to.equal(group.name);
        expect(added.checked).to.be.false;
        expect(tabIndexOf(added)).to.equal(-1);
        expect(group.value).to.equal('orange');
      });

      it('a radio added at runtime is part of the single selection', async () => {
        const added = await appendRadio({ value: 'kiwi' });

        added.click();
        await elementUpdated(added);

        expect(radios.every((radio) => !radio.checked)).to.be.true;
        expect(added.checked).to.be.true;
        expect(group.value).to.equal('kiwi');
      });

      it('a radio added at runtime is part of the keyboard navigation', async () => {
        const added = await appendRadio({ value: 'kiwi' });
        const last = lastOf(radios);

        last.click();
        await elementUpdated(last);

        simulateKeyboard(last, arrowDown);
        await elementUpdated(added);

        expect(isFocused(added)).to.be.true;
        expect(group.value).to.equal('kiwi');
      });

      it('applies `defaultValue` to a radio added at runtime', async () => {
        group.defaultValue = 'kiwi';
        await elementUpdated(group);

        const added = await appendRadio({ value: 'kiwi' });

        expect(added.defaultChecked).to.be.true;
        expect(radios.every((radio) => !radio.defaultChecked)).to.be.true;
      });

      it('applies a pending `value` to a radio added at runtime', async () => {
        group.value = 'kiwi';
        await elementUpdated(group);

        // No match yet - reading the value must not discard the pending one
        expect(group.value).to.be.empty;

        const added = await appendRadio({ value: 'kiwi' });

        expect(added.checked).to.be.true;
        expect(group.value).to.equal('kiwi');
      });

      it('does not steal an active selection from the radios', async () => {
        const first = firstOf(radios);

        first.click();
        await elementUpdated(first);

        const added = await appendRadio({ value: 'orange' });

        expect(added.checked).to.be.false;
        expect(group.value).to.equal(first.value);
      });

      it('drops a radio removed at runtime', async () => {
        const checked = radios.find((radio) => radio.checked)!;

        checked.remove();
        await waitForSlotChange();

        expect(group.value).to.be.empty;
      });

      it('restores the tab stop when the checked radio is removed', async () => {
        group = await fixture(createDefaultGroup());
        radios = Array.from(group.querySelectorAll(IgcRadioComponent.tagName));

        const [first, ...remaining] = radios;

        first.click();
        await elementUpdated(first);

        expect(remaining.every((radio) => tabIndexOf(radio) === -1)).to.be.true;

        first.remove();
        await waitForSlotChange();
        await Promise.all(remaining.map((radio) => elementUpdated(radio)));

        expect(remaining.every((radio) => tabIndexOf(radio) === 0)).to.be.true;
      });

      it('keeps the checked radio as the sole tab stop when another is removed', async () => {
        const checked = radios.find((radio) => radio.checked)!;
        const unchecked = radios.filter((radio) => radio !== checked);

        firstOf(unchecked).remove();
        await waitForSlotChange();
        await Promise.all(radios.map((radio) => elementUpdated(radio)));

        expect(tabIndexOf(checked)).to.equal(0);
        expect(tabIndexOf(lastOf(unchecked))).to.equal(-1);
      });

      it('restores the tab stop when the radio matching a pending `value` is removed', async () => {
        // The group `value` stays 'orange' after the removal. Re-applying it unchecks
        // the remaining radios, which must not leave them out of the tab order.
        const checked = radios.find((radio) => radio.checked)!;
        const remaining = radios.filter((radio) => radio !== checked);

        checked.remove();
        await waitForSlotChange();
        await Promise.all(remaining.map((radio) => elementUpdated(radio)));

        expect(group.value).to.be.empty;
        expect(remaining.every((radio) => tabIndexOf(radio) === 0)).to.be.true;
      });
    });

    describe('Custom states and layout', () => {
      function hasState(state: string): boolean {
        return group.matches(`:state(${state})`);
      }

      it('reports the `disabled` state of its radios', async () => {
        group = await fixture(html`
          <igc-radio-group name="fruit">
            <igc-radio value="apple" disabled>Apple</igc-radio>
            <igc-radio value="orange">Orange</igc-radio>
          </igc-radio-group>
        `);

        expect(hasState('disabled')).to.be.false;

        group.querySelector('igc-radio[value="orange"]')!.remove();
        await waitForSlotChange();

        expect(hasState('disabled')).to.be.true;
      });

      it('does not report a group without radios as disabled', async () => {
        group = await fixture(createDefaultGroup());

        for (const radio of group.querySelectorAll(IgcRadioComponent.tagName)) {
          radio.remove();
        }
        await waitForSlotChange();

        expect(hasState('disabled')).to.be.false;
      });

      it('reports the `label-before` state of its radios', async () => {
        group = await fixture(createDefaultGroup());

        expect(hasState('label-before')).to.be.false;

        await appendRadio({ labelPosition: 'before' });

        expect(hasState('label-before')).to.be.true;
      });

      it('counts only the radios for the layout of the group', async () => {
        group = await fixture(html`
          <igc-radio-group name="fruit" alignment="horizontal">
            <label>Pick one</label>
            <igc-radio value="apple">Apple</igc-radio>
            <igc-radio value="orange">Orange</igc-radio>
          </igc-radio-group>
        `);

        expect(group.style.getPropertyValue('--layout-count')).to.equal('2');
      });
    });

    describe('ARIA', () => {
      beforeEach(async () => {
        group = await fixture(createGroupWithInitialState());
      });

      it('exposes its role as a content attribute', async () => {
        expect(group.getAttribute('role')).to.equal('radiogroup');
      });

      it('mirrors `alignment` in aria-orientation', async () => {
        expect(internalsOf(group)?.getARIA('ariaOrientation')).to.equal(
          'vertical'
        );

        group.alignment = 'horizontal';
        await elementUpdated(group);

        expect(internalsOf(group)?.getARIA('ariaOrientation')).to.equal(
          'horizontal'
        );
      });
    });

    describe('Clearing group state', () => {
      beforeEach(async () => {
        group = await fixture(createGroupWithInitialState());
        radios = Array.from(group.querySelectorAll(IgcRadioComponent.tagName));
      });

      it('clearing `name` clears the names of its radios', async () => {
        group.name = '';
        await elementUpdated(group);

        expect(radios.every((radio) => radio.name === '')).to.be.true;
      });

      it('clearing `defaultValue` clears the default state of its radios', async () => {
        group.defaultValue = 'orange';
        await elementUpdated(group);

        expect(radios.some((radio) => radio.defaultChecked)).to.be.true;

        group.defaultValue = '';
        await elementUpdated(group);

        expect(radios.every((radio) => !radio.defaultChecked)).to.be.true;
      });
    });

    describe('Form integration', () => {
      let form: HTMLFormElement;
      let formData: FormData;

      function setFormListener() {
        form.addEventListener('submit', (event: SubmitEvent) => {
          event.preventDefault();
          formData = new FormData(form);
        });
      }

      describe('Initial checked state', () => {
        it('initial checked state through group', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit" value="orange">
                <igc-radio value="apple">Apple</igc-radio>
                <igc-radio value="banana">Banana</igc-radio>
                <igc-radio value="orange">Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(lastOf(radios).checked).to.be.true;

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(lastOf(radios).value);
        });

        it('initial checked state through radio attribute', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit">
                <igc-radio value="apple" checked>Apple</igc-radio>
                <igc-radio value="banana">Banana</igc-radio>
                <igc-radio value="orange">Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(firstOf(radios).checked).to.be.true;
          expect(group.value).to.equal(firstOf(radios).value);

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(firstOf(radios).value);
        });

        it('initial multiple checked state through radio attribute', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit">
                <igc-radio value="apple" checked>Apple</igc-radio>
                <igc-radio value="banana" checked>Banana</igc-radio>
                <igc-radio value="orange" checked>Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          // The last checked member of the group takes over as the default checked
          expect(lastOf(radios).checked).to.be.true;
          expect(group.value).to.equal(lastOf(radios).value);

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(lastOf(radios).value);
        });

        it('form reset when bound through group value attribute', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit" value="apple">
                <igc-radio value="apple">Apple</igc-radio>
                <igc-radio value="banana">Banana</igc-radio>
                <igc-radio value="orange">Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(firstOf(radios).checked).to.be.true;

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(firstOf(radios).value);

          lastOf(radios).click();
          await elementUpdated(lastOf(radios));

          expect(group.value).to.equal(lastOf(radios).value);
          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(lastOf(radios).value);

          form.reset();
          expect(firstOf(radios).checked).to.be.true;
          expect(group.value).to.equal(firstOf(radios).value);
        });

        it('form reset with defaultValue set', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit" .defaultValue=${'apple'}>
                <igc-radio value="apple">Apple</igc-radio>
                <igc-radio value="banana">Banana</igc-radio>
                <igc-radio value="orange">Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(firstOf(radios).checked).to.be.true;

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(firstOf(radios).value);

          lastOf(radios).click();
          await elementUpdated(lastOf(radios));

          expect(group.value).to.equal(lastOf(radios).value);
          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(lastOf(radios).value);

          form.reset();
          expect(firstOf(radios).checked).to.be.true;
          expect(group.value).to.equal(firstOf(radios).value);
        });

        it('form reset with multiple checked radios', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit">
                <igc-radio value="apple" checked>Apple</igc-radio>
                <igc-radio value="banana" checked>Banana</igc-radio>
                <igc-radio value="orange" checked>Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(firstOf(radios).checked).to.be.false;
          expect(lastOf(radios).checked).to.be.true;

          firstOf(radios).click();
          expect(firstOf(radios).checked).to.be.true;

          form.reset();
          expect(firstOf(radios).checked).to.be.false;
          expect(lastOf(radios).checked).to.be.true;
        });
      });

      describe('Validation state', () => {
        it('required validator visual state', async () => {
          form = await fixture(html`
            <form>
              <igc-radio-group name="fruit">
                <igc-radio value="apple" required>Apple</igc-radio>
                <igc-radio value="banana">Banana</igc-radio>
                <igc-radio value="orange">Orange</igc-radio>
              </igc-radio-group>
            </form>
          `);
          group = form.querySelector(IgcRadioGroupComponent.tagName)!;
          radios = Array.from(form.querySelectorAll(IgcRadioComponent.tagName));
          setFormListener();

          expect(radios.every((radio) => radio.invalid)).to.be.false;

          form.requestSubmit();
          expect(radios.every((radio) => radio.invalid)).to.be.true;

          form.reset();
          expect(radios.every((radio) => radio.invalid)).to.be.false;
        });
      });
    });
  });

  /** Waits out the `slotchange` of a change in the light DOM of the group. */
  async function waitForSlotChange(): Promise<void> {
    await nextFrame();
    await elementUpdated(group);
  }

  /** Adds a radio with the given `props` to the current group at runtime. */
  async function appendRadio(
    props: Partial<IgcRadioComponent>
  ): Promise<IgcRadioComponent> {
    const radio = document.createElement(IgcRadioComponent.tagName);
    Object.assign(radio, props);

    group.append(radio);
    await waitForSlotChange();
    await elementUpdated(radio);

    return radio;
  }

  function createDefaultGroup() {
    return html`
      <igc-radio-group>
        ${values.map(
          (value) =>
            html`<igc-radio name="fruit" value=${value}>${value}</igc-radio>`
        )}
      </igc-radio-group>
    `;
  }

  function createGroupWithInitialState() {
    return html`
      <igc-radio-group name="favorite-fruit" value="orange">
        ${values.map(
          (value) => html`<igc-radio value=${value}>${value}</igc-radio>`
        )}
      </igc-radio-group>
    `;
  }

  function createGroupWithChildCheckedState() {
    const radios = values.map(
      (value, idx) =>
        html`<igc-radio value=${value} ?checked=${idx >= 2}
          >${value}</igc-radio
        >`
    );
    return html`
      <igc-radio-group name="fruit" value="apple">${radios}</igc-radio-group>
    `;
  }
});
