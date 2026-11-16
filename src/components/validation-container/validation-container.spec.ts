import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import type { TemplateResult } from 'lit';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { withDocumentSheets } from '#internals/testing/helpers.spec.js';
import {
  getValidationContainer,
  ValidityHelpers,
} from '#internals/testing/validity-helpers.spec.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { configureTheme } from '#theming/config.js';
import type { Theme } from '#theming/types.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import { styles as fluent } from '../../styles/themes/light/fluent.css.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import { styles as material } from '../../styles/themes/light/material.css.js';
import IgcChatComponent from '../chat/chat.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import IgcColorPickerComponent from '../color-picker/color-picker.js';
import IgcComboComponent from '../combo/combo.js';
import IgcDatePickerComponent from '../date-picker/date-picker.js';
import IgcDateRangePickerComponent from '../date-range-picker/date-range-picker.js';
import IgcInputComponent from '../input/input.js';
import IgcRadioGroupComponent from '../radio-group/radio-group.js';
import IgcSelectComponent from '../select/select.js';
import IgcTreeComponent from '../tree/tree.js';
import IgcValidationContainerComponent, {
  type ValidationContainerConfig,
} from './validation-container.js';

describe('Validation container', () => {
  let input: IgcInputComponent;

  const helperSlot = 'helper-text';
  const valueMissingSlot = 'value-missing';

  before(() => {
    defineComponents(
      IgcInputComponent,
      IgcChatComponent,
      IgcCheckboxComponent,
      IgcColorPickerComponent,
      IgcComboComponent,
      IgcDatePickerComponent,
      IgcDateRangePickerComponent,
      IgcRadioGroupComponent,
      IgcSelectComponent,
      IgcTreeComponent
    );
  });

  async function createFixture(template: TemplateResult) {
    input = await fixture<IgcInputComponent>(template);
  }

  function containerHeight(): number {
    return getValidationContainer(input)!.getBoundingClientRect().height;
  }

  it('container does not render non-slotted content on error', async () => {
    await createFixture(html`<igc-input required></igc-input>`);

    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.false;

    input.checkValidity();
    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;

    input.reportValidity();
    await elementUpdated(input);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, helperSlot, valueMissingSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.false;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.false;
  });

  it('non-slotted validation message slots does not override slotted helper-text', async () => {
    await createFixture(html`
      <igc-input required>
        <div slot=${helperSlot}>Helper text</div>
      </igc-input>
    `);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.true;

    input.reportValidity();
    await elementUpdated(input);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, helperSlot, valueMissingSlot);
    ValidityHelpers.hasSlottedContent(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.false;
  });

  it('slotted validation message slots override slotted helper-text when invalid', async () => {
    await createFixture(html`
      <igc-input required>
        <div slot=${helperSlot}>Helper text</div>
        <div slot=${valueMissingSlot}>Value missing</div>
      </igc-input>
    `);

    ValidityHelpers.isValid(input).to.be.false;
    ValidityHelpers.hasInvalidStyles(input).to.be.false;
    ValidityHelpers.hasSlots(input, helperSlot).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.false;

    await ValidityHelpers.checkValidationSlots(input, 'valueMissing');
  });

  it('validation messages survive a re-render after a failed form submission', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <igc-input name="input" required>
          <div slot=${valueMissingSlot}>Value missing</div>
        </igc-input>
      </form>
    `);

    input = form.querySelector(IgcInputComponent.tagName)!;

    form.requestSubmit();
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;

    // A later host update, such as a slotchange or an unrelated property, must
    // keep the messages.
    input.requestUpdate();
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;
  });

  it('projects validation messages for a host that starts out invalid', async () => {
    await createFixture(html`
      <igc-input required invalid>
        <div slot=${valueMissingSlot}>Value missing</div>
      </igc-input>
    `);

    // Wait for the second host render requested by the container.
    await elementUpdated(input);

    ValidityHelpers.hasInvalidStyles(input).to.be.true;
    ValidityHelpers.hasSlots(input, valueMissingSlot).to.be.true;
    ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;
  });

  describe('create()', () => {
    const projectedHelperSlot = `slot[name='${helperSlot}']`;

    async function createContainer(config?: ValidationContainerConfig) {
      return fixture<IgcValidationContainerComponent>(
        IgcValidationContainerComponent.create(input, config)
      );
    }

    beforeEach(async () => {
      await createFixture(html`<igc-input required></igc-input>`);
    });

    it('projects a helper-text slot by default', async () => {
      const container = await createContainer();

      expect(container.id).to.equal(helperSlot);
      expect(container.querySelector(projectedHelperSlot)).not.to.be.null;
    });

    it('does not project a helper-text slot when `hasHelperText` is false', async () => {
      const container = await createContainer({ hasHelperText: false });

      expect(container.hasAttribute('id')).to.be.false;
      expect(container.querySelector(projectedHelperSlot)).to.be.null;
    });

    it('applies the id, slot and part from the configuration', async () => {
      const container = await createContainer({
        id: 'custom-id',
        slot: 'anchor',
        part: 'custom-part',
      });

      expect(container.id).to.equal('custom-id');
      expect(container.slot).to.equal('anchor');
      expect(container.part.contains('custom-part')).to.be.true;
    });
  });

  describe('Pointer press', () => {
    let button: HTMLButtonElement;
    let clickTargets: EventTarget[];

    afterEach(async () => {
      await resetMouse();
      await aTimeout(0);
    });

    async function createForm(field: TemplateResult): Promise<void> {
      const form = await fixture<HTMLFormElement>(html`
        <form
          novalidate
          style="display: flex; flex-direction: column; align-items: start"
        >
          ${field}
          <button type="button">Submit</button>
        </form>
      `);

      input = form.querySelector(IgcInputComponent.tagName)!;
      button = form.querySelector('button')!;
      clickTargets = [];
      form.addEventListener('click', ({ target }) =>
        clickTargets.push(target!)
      );
    }

    /** The frame between down and up lets the update that the blur starts lay out. */
    async function clickButton(): Promise<void> {
      const { x, y } = getCenterPoint(button);

      await sendMouse({
        type: 'move',
        position: [Math.round(x), Math.round(y)],
      });
      await sendMouse({ type: 'down' });
      await nextFrame();
      await sendMouse({ type: 'up' });
      await aTimeout(0);
      await elementUpdated(getValidationContainer(input)!);
    }

    it('keeps the click of a press that shows a message on blur', async () => {
      await createForm(html`
        <igc-input required>
          <div slot=${valueMissingSlot}>Value missing.<br />Enter a value.</div>
        </igc-input>
      `);

      input.focus();
      await clickButton();

      expect(clickTargets).to.deep.equal([button]);
      ValidityHelpers.hasSlottedContent(input, valueMissingSlot).to.be.true;
    });

    it('keeps the click of a press that hides a message on blur', async () => {
      await createForm(html`
        <igc-input>
          <div slot="custom-error">Value taken.<br />Choose another value.</div>
        </igc-input>
      `);

      input.setCustomValidity('Value taken');
      input.reportValidity();
      await elementUpdated(input);
      ValidityHelpers.hasSlottedContent(input, 'custom-error').to.be.true;

      input.addEventListener('focusout', () => input.setCustomValidity(''));
      input.focus();
      await clickButton();

      expect(clickTargets).to.deep.equal([button]);
      ValidityHelpers.hasSlottedContent(input, 'custom-error').to.be.false;
    });

    it('does not hold the first projection of a control created in a press', async () => {
      await createForm(html`<igc-input></igc-input>`);
      const { x, y } = getCenterPoint(button);

      await sendMouse({
        type: 'move',
        position: [Math.round(x), Math.round(y)],
      });
      await sendMouse({ type: 'down' });

      const added = document.createElement(IgcInputComponent.tagName);
      button.before(added);
      await elementUpdated(added);
      await nextFrame();

      expect(
        getValidationContainer(added)!.getBoundingClientRect().height
      ).to.equal(0);
    });
  });

  describe('Reserved message lines', () => {
    const themes: [Theme, CSSStyleSheet][] = [
      ['bootstrap', bootstrap.styleSheet!],
      ['material', material.styleSheet!],
      ['fluent', fluent.styleSheet!],
      ['indigo', indigo.styleSheet!],
    ];

    afterEach(() => configureTheme('bootstrap'));

    // An empty message wrapper stays in the flow only to hold reserved lines.
    const reserves = (container: Element) =>
      getComputedStyle(
        container.shadowRoot!.querySelector('[part~="helper-text"]')!
      ).position === 'static';

    async function showMessage(): Promise<void> {
      input.reportValidity();
      await elementUpdated(input);
      await nextFrame();
    }

    it('reserves no space by default', async () => {
      await createFixture(html`
        <igc-input required>
          <div slot=${valueMissingSlot}>Value missing</div>
        </igc-input>
      `);

      expect(containerHeight()).to.equal(0);
    });

    for (const [theme, sheet] of themes) {
      it(`reserves the height of one and two message lines in ${theme}`, async () => {
        await withDocumentSheets([sheet], async () => {
          configureTheme(theme);

          for (const [lines, message] of [
            [1, html`Value missing`],
            [2, html`Value<br />missing`],
          ] as const) {
            await createFixture(html`
              <igc-input required style="--ig-helper-min-lines: ${lines}">
                <div slot=${valueMissingSlot}>${message}</div>
              </igc-input>
            `);

            const reserved = containerHeight();
            expect(reserved).to.be.greaterThan(0);

            await showMessage();
            expect(containerHeight(), `${lines} line(s)`).to.equal(reserved);
          }
        });
      });
    }

    it('reserves no space for counts other than 1, 2 and 3', async () => {
      for (const value of ['0', '0.0', '0px', '-1', 'calc(1)', '4']) {
        await createFixture(html`
          <igc-input
            required
            style="--ig-helper-min-lines: ${value}"
          ></igc-input>
        `);

        expect(containerHeight(), value).to.equal(0);
      }
    });

    it('keeps short text at the top of the reserved lines', async () => {
      const helperOffset = async (lines: number) => {
        const checkbox = await fixture<IgcCheckboxComponent>(html`
          <igc-checkbox style="--ig-helper-min-lines: ${lines}">
            <span slot=${helperSlot}>Helper text</span>
          </igc-checkbox>
        `);

        return (
          checkbox.querySelector('span')!.getBoundingClientRect().top -
          checkbox.getBoundingClientRect().top
        );
      };

      expect(await helperOffset(2)).to.equal(await helperOffset(0));
    });

    it('reserves lines only for the last radio of a group', async () => {
      const group = await fixture<IgcRadioGroupComponent>(html`
        <igc-radio-group style="--ig-helper-min-lines: 1">
          <igc-radio name="option" value="1">One</igc-radio>
          <igc-radio name="option" value="2">Two</igc-radio>
          <igc-radio name="option" value="3">Three</igc-radio>
        </igc-radio-group>
      `);

      expect(
        Array.from(group.querySelectorAll('igc-radio'), (radio) =>
          reserves(getValidationContainer(radio)!)
        )
      ).to.deep.equal([false, false, true]);
    });

    it('keeps the height when a message replaces the helper text', async () => {
      await withDocumentSheets([material.styleSheet!], async () => {
        configureTheme('material');
        await createFixture(html`
          <igc-input required style="--ig-helper-min-lines: 1">
            <div slot=${helperSlot}>Helper text</div>
            <div slot=${valueMissingSlot}>Value missing</div>
          </igc-input>
        `);

        const helperHeight = containerHeight();
        await showMessage();
        expect(containerHeight()).to.equal(helperHeight);
      });
    });

    it('reserves no space in the form controls that other components render', async () => {
      const hosts = await Promise.all(
        [
          html`<igc-combo></igc-combo>`,
          html`<igc-select></igc-select>`,
          html`<igc-date-picker></igc-date-picker>`,
          html`<igc-date-range-picker></igc-date-range-picker>`,
          html`<igc-date-range-picker use-two-inputs></igc-date-range-picker>`,
          html`<igc-color-picker></igc-color-picker>`,
          html`<igc-chat></igc-chat>`,
          html`<igc-tree selection="multiple">
            <igc-tree-item label="Item"></igc-tree-item>
          </igc-tree>`,
        ].map((template) => fixture<HTMLElement>(template))
      );

      function* nestedContainers(root: ParentNode): Generator<Element> {
        for (const element of root.querySelectorAll('*')) {
          if (element.shadowRoot) {
            const container = getValidationContainer(element);
            if (container) {
              yield container;
            }
            yield* nestedContainers(element.shadowRoot);
          }
        }
      }

      for (const host of hosts) {
        host.style.setProperty('--ig-helper-min-lines', '1');
        const own = getValidationContainer(host);
        const nested = [
          ...nestedContainers(host),
          ...nestedContainers(host.shadowRoot!),
        ];

        if (own) {
          expect(reserves(own), host.localName).to.be.true;
        }
        expect(nested, host.localName).not.to.be.empty;

        for (const container of nested) {
          expect(reserves(container), host.localName).to.be.false;
        }
      }
    });
  });
});
