import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { spy, stub } from 'sinon';
import {
  altKey,
  arrowDown,
  arrowRight,
  arrowUp,
  endKey,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  runAriaProjectionTests,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import { isFocused } from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '#internals/testing/validity-helpers.spec.js';
import { configureTheme } from '#theming/config.js';
import type IgcInputComponent from '../input/input.js';
import type IgcSelectComponent from '../select/select.js';
import IgcColorPickerComponent from './color-picker.js';
import { ColorModel } from './model.js';
import type IgcPickerCanvasComponent from './picker-canvas.js';

async function createDefaultColorPicker() {
  return await fixture<IgcColorPickerComponent>(
    html`<igc-color-picker label="Choose a color"></igc-color-picker>`
  );
}

function getAnchor(picker: IgcColorPickerComponent): HTMLElement {
  return picker.renderRoot.querySelector('[part~="anchor"]')!;
}

/**
 * The native input inside the input mode anchor - the element assistive
 * technology lands on and reports, and the target of the ARIA projection.
 */
function getAnchorNativeInput(host: HTMLElement): HTMLInputElement {
  return (host as IgcColorPickerComponent).renderRoot
    .querySelector<IgcInputComponent>('igc-input[slot="anchor"]')!
    .renderRoot.querySelector('input')!;
}

function isAnchorEmpty(picker: IgcColorPickerComponent): boolean {
  return getAnchor(picker).part.contains('empty');
}

function getColorInput(picker: IgcColorPickerComponent): IgcInputComponent {
  return picker.renderRoot.querySelector<IgcInputComponent>('#color-input')!;
}

function commitColorInput(input: IgcInputComponent, value: string): void {
  input.value = value;
  input.dispatchEvent(
    new CustomEvent('igcChange', {
      detail: value,
      bubbles: true,
      composed: true,
    })
  );
}

function getHueSlider(picker: IgcColorPickerComponent): HTMLInputElement {
  return picker.renderRoot.querySelector('[part="hue"]')!;
}

function getAlphaSlider(picker: IgcColorPickerComponent): HTMLInputElement {
  return picker.renderRoot.querySelector('[part="alpha"]')!;
}

function getAlphaInput(picker: IgcColorPickerComponent): IgcInputComponent {
  return picker.renderRoot.querySelector('#alpha')!;
}

function getAlphaEditor(picker: IgcColorPickerComponent): HTMLInputElement {
  return getAlphaInput(picker).renderRoot.querySelector('input')!;
}

/** Replaces the alpha field's current selection with `text`, as the browser would. */
function typeIntoAlpha(picker: IgcColorPickerComponent, text: string): void {
  const editor = getAlphaEditor(picker);
  const start = editor.selectionStart ?? editor.value.length;
  const end = editor.selectionEnd ?? start;

  // The caret has to be in place before the event, so the value is spliced here
  // rather than handed to the helper.
  editor.value = `${editor.value.slice(0, start)}${text}${editor.value.slice(end)}`;
  editor.setSelectionRange(start + text.length, start + text.length);

  simulateInput(editor, {
    skipValueProperty: true,
    inputType: 'insertText',
    data: text,
    bubbles: true,
    composed: true,
  });
}

/** Selects the whole alpha field and deletes it, as the browser would. */
function clearAlpha(picker: IgcColorPickerComponent): void {
  simulateInput(getAlphaEditor(picker), { bubbles: true, composed: true });
}

/**
 * Dispatches a cancelable `key` press on `node` and hands the event back, which
 * `simulateKeyboard` does neither of.
 */
function press(node: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  node.dispatchEvent(event);

  return event;
}

function getCanvas(picker: IgcColorPickerComponent): IgcPickerCanvasComponent {
  return picker.renderRoot.querySelector('igc-picker-canvas')!;
}

function getFormatSelect(picker: IgcColorPickerComponent): IgcSelectComponent {
  return picker.renderRoot.querySelector('#format-select')!;
}

/**
 * The two halves of the anchor swatch preview - the opaque color on the left
 * and the color with its real alpha across the whole surface.
 */
function getAnchorPreview(picker: IgcColorPickerComponent): {
  opaque: string;
  alpha: string;
} {
  const { style } = getAnchor(picker);

  return {
    opaque: style.getPropertyValue('--_color-preview'),
    alpha: style.getPropertyValue('--_alpha-preview'),
  };
}

describe('Color picker', () => {
  before(() => defineComponents(IgcColorPickerComponent));

  let picker: IgcColorPickerComponent;

  describe('Default', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('is initialized', () => {
      expect(picker).to.exist;
    });

    it('is accessible (close state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (alpha row)', async () => {
      picker.open = true;
      picker.showAlpha = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });
  });

  describe('ARIA', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('exposes the popover as a named dialog', async () => {
      picker.open = true;
      await elementUpdated(picker);

      const dialog = picker.renderRoot.querySelector('[part="picker"]')!;

      expect(dialog.getAttribute('role')).to.equal('dialog');
      expect(dialog.getAttribute('aria-label')).to.equal('Color picker');
      expect(dialog.id).to.equal('picker');
    });

    it('points the anchor at the dialog it controls', () => {
      const anchor = getAnchor(picker);

      expect(anchor.getAttribute('aria-haspopup')).to.equal('dialog');
      expect(anchor.getAttribute('aria-controls')).to.equal('picker');
    });

    it('reflects the open state through `aria-expanded`', async () => {
      expect(getAnchor(picker).getAttribute('aria-expanded')).to.equal('false');

      picker.open = true;
      await elementUpdated(picker);
      expect(getAnchor(picker).getAttribute('aria-expanded')).to.equal('true');

      picker.open = false;
      await elementUpdated(picker);
      expect(getAnchor(picker).getAttribute('aria-expanded')).to.equal('false');
    });

    it('feeds the canvas marker the current saturation and value', async () => {
      picker.open = true;
      picker.value = 'hsl(120 100% 25%)';
      await elementUpdated(picker);

      const canvas = getCanvas(picker);

      expect(canvas.saturation).to.be.closeTo(100, 0.5);
      expect(canvas.brightness).to.be.closeTo(50, 0.5);
    });

    it('paints the canvas from the hue the slider points at when there is no value', async () => {
      picker.open = true;
      await elementUpdated(picker);

      // Both are unset until the color changes if they are only written from
      // the color handlers, leaving the plane on the stylesheet fallback.
      expect(picker.style.getPropertyValue('--_current-color')).to.equal(
        'hsl(0 100% 50%)'
      );
      expect(getCanvas(picker).currentColor).to.equal('hsl(0 100% 50%)');
      expect(getHueSlider(picker).value).to.equal('0');
    });

    it('starts the alpha ramp and the canvas marker at white when there is no value', async () => {
      picker.open = true;
      await elementUpdated(picker);

      // An empty color is white, so both start there rather than falling back
      // to the pure hue the plane is drawn from.
      expect(picker.style.getPropertyValue('--_selected-color')).to.equal(
        'rgb(255 255 255)'
      );
      expect(getCanvas(picker).markerColor).to.equal('rgb(255 255 255)');
    });

    it('starts the canvas marker at the white corner when there is no value', async () => {
      picker.open = true;
      await elementUpdated(picker);
      // The marker is positioned from a `requestAnimationFrame` after paint.
      await nextFrame();

      const canvas = getCanvas(picker);
      const { width, height } = canvas.getMarkerDimensions();

      expect(canvas.saturation).to.equal(0);
      expect(canvas.brightness).to.equal(100);

      // Top left of the saturation/value plane - the marker straddles the
      // corner, so it sits at minus half its own size on both axes.
      expect(canvas.x).to.equal(-width);
      expect(canvas.y).to.equal(-height);
    });

    it('keeps the alpha field a labelled text field', async () => {
      picker.open = true;
      picker.showAlpha = true;
      picker.value = 'rgb(255 0 0 / 0.5)';
      await elementUpdated(picker);
      await nextFrame();

      // Deliberately not a `spinbutton`, despite the bounded value and the
      // arrow-key stepping: overriding the native textbox role breaks how
      // screen readers announce typing, which is the field's primary use. The
      // alpha slider beside it carries the natively announced range semantics.
      const editor = getAlphaEditor(picker);
      const label = picker.renderRoot.querySelector('label[for="alpha"]')!;

      expect(editor.role).to.be.null;
      expect(editor.getAttribute('aria-valuenow')).to.be.null;

      // `<label for="alpha">` labels the `igc-input`; the native editor picks
      // it up by element reflection, since an IDREF cannot cross into its
      // shadow root.
      expect(editor.ariaLabelledByElements).to.eql([label]);
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('`toggle()`', async () => {
      await picker.toggle();
      expect(picker.open).to.be.true;

      await picker.toggle();
      expect(picker.open).to.be.false;
    });
  });

  describe('Empty value', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('has an empty value by default', () => {
      expect(picker.value).to.equal('');
    });

    it('renders a checkered anchor when empty', async () => {
      expect(isAnchorEmpty(picker)).to.be.true;

      picker.value = '#ff0000';
      await elementUpdated(picker);
      expect(isAnchorEmpty(picker)).to.be.false;
    });

    it('reverts to an empty value for null/undefined/empty', async () => {
      for (const value of ['', null, undefined]) {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        picker.value = value as unknown as string;
        await elementUpdated(picker);

        expect(picker.value).to.equal('');
        expect(isAnchorEmpty(picker)).to.be.true;
      }
    });
  });

  describe('Color value input', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('commits a valid color', async () => {
      commitColorInput(getColorInput(picker), '#00ff00');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
    });

    it('reverts the input on an invalid color', async () => {
      const input = getColorInput(picker);
      commitColorInput(input, 'not-a-color');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
      expect(input.value).to.equal('#ff0000');
    });

    it('clears the value on an empty input', async () => {
      const input = getColorInput(picker);
      commitColorInput(input, '');
      await elementUpdated(picker);

      expect(picker.value).to.equal('');
      expect(isAnchorEmpty(picker)).to.be.true;
    });

    it('hints the notation of the active format while empty', async () => {
      const input = getColorInput(picker);
      expect(input.placeholder).to.equal('#rrggbb');

      picker.format = 'rgb';
      await elementUpdated(picker);
      expect(input.placeholder).to.equal('rgb(r g b)');

      picker.format = 'hsl';
      await elementUpdated(picker);
      expect(input.placeholder).to.equal('hsl(h s% l%)');
    });
  });

  describe('igcChange', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      await elementUpdated(picker);
    });

    it('emits when the value changed while focus was inside the component', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.value = '#00ff00';
      await elementUpdated(picker);

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).calledWith('igcChange', { detail: '#00ff00' });
    });

    it('does not emit when the value did not change', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('does not emit when focus moves within the component', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      const anchor = getAnchor(picker);

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.value = '#00ff00';
      await elementUpdated(picker);

      picker.dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: anchor })
      );

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('does not emit when only the format changed', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));

      // The rendered value moves from `#ff0000` to `rgb(255 0 0)`, but the
      // color behind it is untouched.
      picker.format = 'rgb';
      await elementUpdated(picker);
      expect(picker.value).to.equal('rgb(255 0 0)');

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('still emits when the color changed alongside the format', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.format = 'rgb';
      picker.value = '#00ff00';
      await elementUpdated(picker);

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).calledWith('igcChange', { detail: 'rgb(0 255 0)' });
    });
  });

  describe('Color channels', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('updates the hue via the hue slider', async () => {
      const inputSpy = spy(picker, 'emitEvent');
      const hue = getHueSlider(picker);

      hue.value = '120';
      hue.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
      expect(inputSpy).calledWith('igcInput', { detail: '#00ff00' });
    });

    it('updates the alpha via the alpha slider', async () => {
      picker.showAlpha = true;
      picker.format = 'rgb';
      await elementUpdated(picker);

      const alpha = getAlphaSlider(picker);
      alpha.value = '50';
      alpha.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      expect(picker.value).to.equal('rgb(255 0 0 / 0.5)');
    });

    describe('Alpha input', () => {
      beforeEach(async () => {
        picker.showAlpha = true;
        picker.format = 'rgb';
        picker.value = 'rgb(255 0 0 / 0.5)';
        await elementUpdated(picker);
      });

      it('updates the alpha via the alpha input', async () => {
        clearAlpha(picker);
        typeIntoAlpha(picker, '25');
        await elementUpdated(picker);

        expect(getAlphaEditor(picker).value).to.equal('25%');
        expect(picker.value).to.equal('rgb(255 0 0 / 0.25)');
      });

      it('renders the alpha as a percentage', async () => {
        picker.value = 'rgb(255 0 0 / 0.4)';
        await elementUpdated(picker);

        expect(getAlphaInput(picker).value).to.equal('40%');
        expect(getAlphaSlider(picker).value).to.equal('40');
      });

      it('keeps the caret in front of the % suffix', async () => {
        // Clicking past the text is what puts the caret behind the suffix.
        const editor = getAlphaEditor(picker);
        editor.setSelectionRange(3, 3);
        simulateClick(editor);

        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);

        typeIntoAlpha(picker, '7');
        await elementUpdated(picker);

        // Appending a digit to 50 exceeds the range and clamps - what matters
        // is that the keystroke landed in the number, not after the suffix.
        expect(editor.value).to.equal('100%');
      });

      it('strips non-digits regardless of how the text arrived', async () => {
        // A paste carries no `data`, so a `beforeinput` keystroke filter misses it.
        clearAlpha(picker);
        typeIntoAlpha(picker, '3a5%x');
        await elementUpdated(picker);

        expect(getAlphaEditor(picker).value).to.equal('35%');
        expect(picker.value).to.equal('rgb(255 0 0 / 0.35)');
      });

      it('clamps the alpha input to 100', async () => {
        clearAlpha(picker);
        typeIntoAlpha(picker, '150');
        await elementUpdated(picker);

        expect(getAlphaEditor(picker).value).to.equal('100%');
      });

      it('reverts an emptied alpha input on commit', async () => {
        // Emptying the field is a valid intermediate state - it has to leave
        // somewhere to type into - so nothing is committed yet.
        clearAlpha(picker);
        await elementUpdated(picker);

        expect(getAlphaEditor(picker).value).to.equal('');
        expect(picker.value).to.equal('rgb(255 0 0 / 0.5)');

        getAlphaInput(picker).dispatchEvent(
          new CustomEvent('igcChange', {
            detail: '',
            bubbles: true,
            composed: true,
          })
        );
        await elementUpdated(picker);

        expect(getAlphaInput(picker).value).to.equal('50%');
        expect(picker.value).to.equal('rgb(255 0 0 / 0.5)');
      });

      it('steps the alpha with the arrow keys', async () => {
        simulateKeyboard(getAlphaInput(picker), arrowUp);
        await elementUpdated(picker);

        expect(picker.value).to.equal('rgb(255 0 0 / 0.51)');

        simulateKeyboard(getAlphaInput(picker), arrowDown, 2);
        await elementUpdated(picker);

        expect(picker.value).to.equal('rgb(255 0 0 / 0.49)');
      });

      it('leaves the caret in place while stepping', async () => {
        const editor = getAlphaEditor(picker);
        editor.setSelectionRange(2, 2);

        simulateKeyboard(getAlphaInput(picker), arrowUp);

        // Synchronously, before any re-render: a value written a frame later
        // would drop the caret behind the `%` and be seen to skip.
        expect(editor.value).to.equal('51%');
        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);

        await elementUpdated(picker);

        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);
      });

      it('stops the caret at the % instead of moving past it', () => {
        const editor = getAlphaEditor(picker);

        // A synthetic key never moves a real caret, so what is asserted here is
        // that the key is cancelled before the browser would have moved it -
        // correcting afterwards is what makes the caret visibly skip.
        editor.setSelectionRange(2, 2);
        expect(press(editor, arrowRight).defaultPrevented).to.be.true;

        // End is taken over wherever it starts, and lands on the limit.
        editor.setSelectionRange(0, 0);
        expect(press(editor, endKey).defaultPrevented).to.be.true;
        expect(editor.selectionStart).to.equal(2);

        // Below the limit the key is left to the browser.
        editor.setSelectionRange(0, 0);
        expect(press(editor, arrowRight).defaultPrevented).to.be.false;
      });

      it('holds at the bounds without re-emitting', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.value = 'rgb(255 0 0 / 1)';
        await elementUpdated(picker);

        simulateKeyboard(getAlphaInput(picker), arrowUp, 3);
        await elementUpdated(picker);

        expect(picker.value).to.equal('rgb(255 0 0)');
        expect(eventSpy).not.calledWith('igcInput');
      });
    });

    it('leaves arrow keys alone elsewhere while showAlpha is off', async () => {
      // The alpha bindings are scoped to the alpha input, which does not exist
      // here - they must not fall back to observing the whole component.
      expect(press(getHueSlider(picker), arrowUp).defaultPrevented).to.be.false;
    });

    it('moves the hue slider when the color changes from elsewhere', async () => {
      const hue = getHueSlider(picker);

      // Interacting with the slider marks its value dirty, after which the
      // browser stops taking the value from the content attribute.
      hue.value = '120';
      hue.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      picker.value = '#0000ff';
      await elementUpdated(picker);

      expect(hue.value).to.equal(String(ColorModel.parse('#0000ff').h));
    });

    it('moves the alpha slider when the color changes from elsewhere', async () => {
      picker.showAlpha = true;
      await elementUpdated(picker);

      const alpha = getAlphaSlider(picker);

      alpha.value = '50';
      alpha.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      picker.value = 'rgb(255 0 0 / 0.25)';
      await elementUpdated(picker);

      expect(alpha.value).to.equal('25');
    });

    it('picks a color from the canvas using HSV saturation/value', async () => {
      const canvas = getCanvas(picker);

      canvas.dispatchEvent(
        new CustomEvent('igcColorPicked', {
          detail: { x: 50, y: 25 },
        })
      );
      await elementUpdated(picker);

      const expected = ColorModel.parse('#ff0000');
      expected.setSaturationAndValue(50, 75);

      expect(picker.value).to.equal(expected.asString('hex'));
      // Hue is preserved by the HSV saturation/value update.
      expect(expected.h).to.equal(ColorModel.parse('#ff0000').h);
    });

    it('fills the canvas marker with the selected color', async () => {
      expect(getCanvas(picker).markerColor).to.equal('rgb(255 0 0)');

      const hue = getHueSlider(picker);
      hue.value = '120';
      hue.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      expect(getCanvas(picker).markerColor).to.equal('rgb(0 255 0)');
    });

    it('keeps the canvas marker opaque regardless of alpha', async () => {
      picker.showAlpha = true;
      picker.format = 'rgb';
      await elementUpdated(picker);

      const alpha = getAlphaSlider(picker);
      alpha.value = '50';
      alpha.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      // The marker sits on the saturation/value plane, which has no alpha - a
      // translucent fill would just read as the gradient underneath it.
      expect(getCanvas(picker).markerColor).to.equal('rgb(255 0 0)');
    });

    it('updates the format via the format select', async () => {
      const select = getFormatSelect(picker);

      select.dispatchEvent(
        new CustomEvent('igcChange', {
          detail: { value: 'rgb' } as unknown as IgcSelectComponent,
          bubbles: true,
          composed: true,
        })
      );
      await elementUpdated(picker);

      expect(picker.format).to.equal('rgb');
      expect(getColorInput(picker).value).to.equal('rgb(255 0 0)');
    });
  });

  describe('Swatches', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.open = true;
      await elementUpdated(picker);
    });

    it('does not render swatches by default', () => {
      expect(picker.renderRoot.querySelector('[part="swatches"]')).to.be.null;
    });

    it('renders and selects a swatch', async () => {
      picker.swatches = ['#ff0000', '#00ff00'];
      await elementUpdated(picker);

      const buttons = picker.renderRoot.querySelectorAll<HTMLButtonElement>(
        'button[part="swatch"]'
      );
      expect(buttons.length).to.equal(2);
      expect(buttons[0].ariaLabel).to.equal('#ff0000');
      expect(buttons[0].dataset.color).to.equal('#ff0000');

      const inputSpy = spy(picker, 'emitEvent');
      buttons[1].click();
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
      expect(inputSpy).calledWith('igcInput', { detail: '#00ff00' });
    });

    it('selects a swatch independently of its accessible name', async () => {
      picker.swatches = ['#ff0000', '#00ff00'];
      await elementUpdated(picker);

      const buttons = picker.renderRoot.querySelectorAll<HTMLButtonElement>(
        'button[part="swatch"]'
      );

      // The color is read from `data-color`, so a localized or otherwise
      // overridden label must not affect which color the swatch commits.
      buttons[1].ariaLabel = 'Vert';
      buttons[1].click();
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
    });
  });

  describe('Copy and EyeDropper', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('copies the value to the clipboard', async () => {
      const writeText = stub(navigator.clipboard, 'writeText').resolves();

      picker.renderRoot.querySelector<HTMLElement>('[part="copy"]')!.click();

      expect(writeText).calledWith('#ff0000');
      writeText.restore();
    });

    describe('unsupported', () => {
      let originalEyeDropper: unknown;

      beforeEach(() => {
        originalEyeDropper = (globalThis as any).EyeDropper;
        delete (globalThis as any).EyeDropper;
      });

      afterEach(() => {
        (globalThis as any).EyeDropper = originalEyeDropper;
      });

      it('disables the eye dropper button', async () => {
        picker = await createDefaultColorPicker();

        const button = picker.renderRoot.querySelector('[part="eye-dropper"]')!;
        expect(button.hasAttribute('disabled')).to.be.true;
      });
    });

    describe('supported', () => {
      let originalEyeDropper: unknown;

      beforeEach(() => {
        originalEyeDropper = (globalThis as any).EyeDropper;
        (globalThis as any).EyeDropper = class {
          public open() {
            return Promise.resolve({ sRGBHex: '#112233' });
          }
        };
      });

      afterEach(() => {
        (globalThis as any).EyeDropper = originalEyeDropper;
      });

      it('picks a color via the EyeDropper API', async () => {
        picker = await createDefaultColorPicker();

        const button = picker.renderRoot.querySelector<HTMLElement>(
          '[part="eye-dropper"]'
        )!;
        expect(button.hasAttribute('disabled')).to.be.false;

        button.click();
        // Let the mocked EyeDropper's promise resolve.
        await new Promise((resolve) => setTimeout(resolve));
        await elementUpdated(picker);

        expect(picker.value).to.equal('#112233');
      });
    });
  });

  describe('Open and close', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('opens and closes via the anchor click', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      const anchor = getAnchor(picker);

      simulateClick(anchor);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');

      eventSpy.resetHistory();
      simulateClick(anchor);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('closes and refocuses the anchor on Escape', async () => {
      const anchor = getAnchor(picker);
      picker.open = true;
      await elementUpdated(picker);

      simulateKeyboard(picker, escapeKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(isFocused(anchor)).to.be.true;
    });

    it('opens with Alt+ArrowDown and closes with Alt+ArrowUp', async () => {
      simulateKeyboard(picker, [altKey, arrowDown]);
      await elementUpdated(picker);
      expect(picker.open).to.be.true;

      simulateKeyboard(picker, [altKey, arrowUp]);
      await elementUpdated(picker);
      expect(picker.open).to.be.false;
    });

    it('skips keybindings when disabled', async () => {
      picker.disabled = true;
      await elementUpdated(picker);

      simulateKeyboard(picker, [altKey, arrowDown]);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
    });
  });

  describe('Input mode', () => {
    function getInputAnchor(): IgcInputComponent {
      return picker.renderRoot.querySelector<IgcInputComponent>(
        'igc-input[slot="anchor"]'
      )!;
    }

    beforeEach(async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker
          label="Choose a color"
          mode="input"
        ></igc-color-picker>`
      );
    });

    it('renders an input anchor instead of a button', () => {
      expect(picker.renderRoot.querySelector('igc-button')).to.be.null;
      expect(getInputAnchor()).to.exist;
    });

    it('orients the swatch preview the same way as the button anchor', async () => {
      picker.showAlpha = true;
      picker.value = 'rgb(255 0 0 / 0.5)';
      await elementUpdated(picker);

      const inputMode = getAnchorPreview(picker);

      const defaultModePicker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker value="rgb(255 0 0 / 0.5)"></igc-color-picker>`
      );
      const defaultMode = getAnchorPreview(defaultModePicker);

      // `--_color-preview` paints the opaque half and `--_alpha-preview` the
      // translucent whole - transposing them inverts the swatch.
      expect(inputMode.opaque).to.equal('rgb(255 0 0)');
      expect(inputMode.alpha).to.equal('rgb(255 0 0 / 0.5)');
      expect(inputMode).to.deep.equal(defaultMode);
    });

    it('opens the popover when the prefix swatch is clicked', async () => {
      simulateClick(getAnchor(picker));
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
    });

    it('hints the notation of the active format while empty', async () => {
      const input = getInputAnchor();
      expect(input.placeholder).to.equal('#rrggbb');

      picker.format = 'hsl';
      await elementUpdated(picker);
      expect(input.placeholder).to.equal('hsl(h s% l%)');
    });

    it('keeps the anchor label floated while the picker is open and empty', async () => {
      configureTheme('material');

      try {
        picker = await fixture<IgcColorPickerComponent>(
          html`<igc-color-picker
            label="Choose a color"
            mode="input"
          ></igc-color-picker>`
        );

        picker.open = true;
        await elementUpdated(picker);

        // Opening moves focus into the dialog, which is a sibling of the anchor
        // rather than a descendant, so the input is no longer `:focus-within`.
        // The placeholder is what keeps the Material outline notch cut - without
        // it the label drops back over the border until a color is picked.
        const notch =
          getInputAnchor().renderRoot.querySelector('[part="notch"]')!;

        expect(getComputedStyle(notch).borderTopColor).to.equal(
          'rgba(0, 0, 0, 0)'
        );
      } finally {
        configureTheme('bootstrap');
      }
    });

    it('renders the prefix swatch as a keyboard operable button', () => {
      const anchor = getAnchor(picker);

      // A native button carries the focusability and Enter/Space activation
      // that the previous `div` had to have bolted on.
      expect(anchor.tagName.toLowerCase()).to.equal('button');
      expect(anchor.getAttribute('type')).to.equal('button');
      expect(anchor.getAttribute('aria-label')).to.equal('Open color picker');
      expect(anchor.getAttribute('aria-haspopup')).to.equal('dialog');
      expect(anchor.getAttribute('aria-controls')).to.equal('picker');

      anchor.focus();
      expect(isFocused(anchor)).to.be.true;
    });

    it('reflects disabled onto the prefix swatch', async () => {
      picker.disabled = true;
      await elementUpdated(picker);

      expect((getAnchor(picker) as HTMLButtonElement).disabled).to.be.true;
    });

    it('commits a color via the anchor input', async () => {
      commitColorInput(getInputAnchor(), '#00ff00');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
    });

    it('returns to the empty state when the anchor input is cleared', async () => {
      const input = getInputAnchor();

      picker.value = '#ff0000';
      await elementUpdated(picker);
      expect(isAnchorEmpty(picker)).to.be.false;

      commitColorInput(input, '');
      await elementUpdated(picker);

      expect(picker.value).to.equal('');
      expect(input.value).to.equal('');
      expect(isAnchorEmpty(picker)).to.be.true;

      // The input-mode swatch paints its preview on its own background rather
      // than on `::before`, so the empty mark has to win over the transparency
      // grid of the preview - both selectors match at the same specificity.
      const { backgroundImage } = getComputedStyle(getAnchor(picker));
      expect(backgroundImage).to.not.contain('conic-gradient');
    });

    it('forwards required/invalid state to the anchor input', async () => {
      picker.required = true;
      await elementUpdated(picker);
      expect(getInputAnchor().required).to.be.true;

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));
      picker.reportValidity();
      await elementUpdated(picker);

      expect(getInputAnchor().invalid).to.equal(picker.invalid);
    });
  });

  describe('Rendering', () => {
    it('renders the label only in default mode with a label set', async () => {
      picker = await createDefaultColorPicker();
      expect(
        picker.renderRoot.querySelector('[part="label"]')?.textContent
      ).to.equal('Choose a color');

      picker.label = undefined;
      await elementUpdated(picker);
      expect(picker.renderRoot.querySelector('[part="label"]')).to.be.null;
    });

    it('does not render a label element in input mode', async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker
          label="Choose a color"
          mode="input"
        ></igc-color-picker>`
      );
      expect(picker.renderRoot.querySelector('[part="label"]')).to.be.null;
    });

    it('reflects disabled onto the button anchor', async () => {
      picker = await createDefaultColorPicker();
      picker.disabled = true;
      await elementUpdated(picker);

      expect(getAnchor(picker).hasAttribute('disabled')).to.be.true;
    });

    it('does not render the alpha row unless showAlpha is set', async () => {
      picker = await createDefaultColorPicker();
      picker.open = true;
      await elementUpdated(picker);

      expect(picker.renderRoot.querySelector('[part="alpha-row"]')).to.be.null;

      picker.showAlpha = true;
      await elementUpdated(picker);

      expect(picker.renderRoot.querySelector('[part="alpha-row"]')).to.exist;
    });

    it('hides the format select when hideFormats is set', async () => {
      picker = await createDefaultColorPicker();
      picker.open = true;
      await elementUpdated(picker);
      expect(picker.renderRoot.querySelector('#format-select')).to.exist;

      picker.hideFormats = true;
      await elementUpdated(picker);
      expect(picker.renderRoot.querySelector('#format-select')).to.be.null;
    });
  });

  describe('Form associated', () => {
    const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(
      html`<igc-color-picker name="color-picker"></igc-color-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcColorPickerComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', () => {
      spec.setProperties({ value: '#bada55' });
      spec.assertSubmitHasValue('#bada55');
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: '#bada55' });

      spec.reset();
      expect(spec.element.value).to.equal('');
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

      spec.setProperties({ value: '#bada55' });
      spec.assertSubmitPasses();
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });

  describe('Touched state', () => {
    const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(
      html`<igc-color-picker name="color-picker"></igc-color-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcColorPickerComponent.tagName);
    });

    it('marks the control as touched on blur', () => {
      // biome-ignore lint/complexity/useLiteralKeys: internal state check
      expect((spec.element as any)['_touched']).to.be.false;

      spec.element.dispatchEvent(
        new FocusEvent('focusin', { relatedTarget: null })
      );
      spec.element.dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: null })
      );

      // biome-ignore lint/complexity/useLiteralKeys: internal state check
      expect((spec.element as any)['_touched']).to.be.true;
    });

    it('clears invalid styles after a form reset', async () => {
      spec.setProperties({ required: true });
      await elementUpdated(spec.element);

      spec.element.dispatchEvent(
        new FocusEvent('focusin', { relatedTarget: null })
      );
      spec.element.dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: null })
      );
      await elementUpdated(spec.element);

      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      ValidityHelpers.hasInvalidStyles(spec.element).to.be.true;

      spec.reset();
      await elementUpdated(spec.element);
      ValidityHelpers.hasInvalidStyles(spec.element).to.be.false;
    });
  });

  describe('defaultValue', () => {
    const defaultValue = '#bada55';
    const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(html`
      <igc-color-picker
        name="color-picker"
        .defaultValue=${defaultValue}
      ></igc-color-picker>
    `);

    beforeEach(async () => {
      await spec.setup(IgcColorPickerComponent.tagName);
    });

    it('correct initial state', () => {
      spec.assertIsPristine();
      expect(spec.element.value).to.equal(defaultValue);
    });

    it('is correctly submitted', () => {
      spec.assertSubmitHasValue(defaultValue);
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: '#ff0000' });

      spec.reset();
      expect(spec.element.value).to.equal(defaultValue);
    });
  });

  describe('Validation', () => {
    const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(html`
      <igc-color-picker name="color-picker"></igc-color-picker>
    `);

    beforeEach(async () => {
      await spec.setup(IgcColorPickerComponent.tagName);
    });

    it('fails required validation', () => {
      spec.setProperties({ required: true });
      spec.assertIsPristine();
      spec.assertSubmitFails();
    });

    it('passes required validation when updating defaultValue', () => {
      spec.setProperties({ required: true, defaultValue: '#bada55' });
      spec.assertIsPristine();
      spec.assertSubmitPasses();
    });
  });

  describe('Validation message slots', () => {
    it('renders validation message slots', () => {
      const testParameters: ValidationContainerTestsParams<IgcColorPickerComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } },
          { slots: ['customError'] },
          { slots: ['invalid'], props: { required: true } },
        ];

      runValidationContainerTests(IgcColorPickerComponent, testParameters);
    });
  });

  runExternalLabelAssociationTests({
    tagName: IgcColorPickerComponent.tagName,
    hostAttributes: 'mode="input"',
    getNativeInput: getAnchorNativeInput,
  });

  runAriaProjectionTests({
    tagName: IgcColorPickerComponent.tagName,
    hostAttributes: 'mode="input"',
    getNativeInput: getAnchorNativeInput,
    expected: { hasPopup: 'dialog' },
    getDescription: (host) => [
      (host as IgcColorPickerComponent).renderRoot.querySelector(
        '#helper-text'
      )!,
    ],
    openProperty: 'open',
  });
});
