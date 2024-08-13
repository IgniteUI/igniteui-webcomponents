import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
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
