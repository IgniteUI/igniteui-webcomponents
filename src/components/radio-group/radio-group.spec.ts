import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import { isFocused, simulateKeyboard } from '../common/utils.spec.js';
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

          expect(last(radios).checked).to.be.true;

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(last(radios).value);
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

          expect(first(radios).checked).to.be.true;
          expect(group.value).to.equal(first(radios).value);

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(first(radios).value);
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
          expect(last(radios).checked).to.be.true;
          expect(group.value).to.equal(last(radios).value);

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(last(radios).value);
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

          expect(first(radios).checked).to.be.true;

          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(first(radios).value);

          last(radios).click();
          await elementUpdated(last(radios));

          expect(group.value).to.equal(last(radios).value);
          form.requestSubmit();
          expect(formData.get('fruit')).to.equal(last(radios).value);

          form.reset();
          expect(first(radios).checked).to.be.true;
          expect(group.value).to.equal(first(radios).value);
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

          expect(first(radios).checked).to.be.false;
          expect(last(radios).checked).to.be.true;

          first(radios).click();
          expect(first(radios).checked).to.be.true;

          form.reset();
          expect(first(radios).checked).to.be.false;
          expect(last(radios).checked).to.be.true;
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
