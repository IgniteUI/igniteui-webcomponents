import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { sendMouse } from '@web/test-runner-commands';
import {
  ColorPickerResourceStringsEN,
  type IColorPickerResourceStrings,
  registerI18n,
  setCurrentI18n,
} from 'igniteui-i18n-core';
import { ColorPickerResourceStringsBG } from 'igniteui-i18n-resources';
import { type SinonSpy, spy, stub } from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  altKey,
  arrowDown,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runDisabledPopupTests } from '#internals/testing/disabled-popup.spec.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  createFormAssociatedTestBed,
  runAriaProjectionTests,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import {
  axeHiddenLabelOptions,
  isFocused,
  isUnderPageLayer,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateCancelableKeydown,
  simulateClick,
  simulateComposingKeys,
  simulateInput,
  simulateKeyboard,
  simulateScroll,
} from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '#internals/testing/validity-helpers.spec.js';
import { isUserChange } from '#internals/user-change.js';
import { formatString } from '#internals/utils/strings.js';
import { configureTheme } from '#theming/config.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import type IgcColorPanelComponent from '../color-panel/color-panel.js';
import type IgcColorSwatchComponent from '../color-panel/color-swatch.js';
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

/** The color panel that the picker shows in its popup. */
function getPanel(picker: IgcColorPickerComponent): IgcColorPanelComponent {
  return picker.renderRoot.querySelector('igc-color-panel')!;
}

/** The shadow root of the color panel, which holds the picker controls. */
function getPanelRoot(
  picker: IgcColorPickerComponent
): HTMLElement | DocumentFragment {
  return getPanel(picker).renderRoot;
}

/** Picks `color` from a swatch, as the user does. */
async function pickSwatch(
  picker: IgcColorPickerComponent,
  color: string
): Promise<void> {
  picker.swatches = [color];
  await elementUpdated(picker);
  simulateClick(
    getPanelRoot(picker).querySelector<HTMLElement>('[part~="swatch"]')!
  );
  await elementUpdated(picker);
}

/** The text field of the input mode anchor. */
function getAnchorField(picker: IgcColorPickerComponent): IgcInputComponent {
  return picker.renderRoot.querySelector('igc-input[slot="anchor"]')!;
}

/** The native input of the input mode anchor, which the ARIA projection targets. */
function getAnchorNativeInput(host: HTMLElement): HTMLInputElement {
  return (host as IgcColorPickerComponent).renderRoot
    .querySelector<IgcInputComponent>('igc-input[slot="anchor"]')!
    .renderRoot.querySelector('input')!;
}

function isAnchorEmpty(picker: IgcColorPickerComponent): boolean {
  return getAnchor(picker).part.contains('empty');
}

function getColorInput(picker: IgcColorPickerComponent): IgcInputComponent {
  return getPanelRoot(picker).querySelector<IgcInputComponent>('#color-input')!;
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
  return getPanelRoot(picker).querySelector('[part="hue"]')!;
}

function getAlphaSlider(picker: IgcColorPickerComponent): HTMLInputElement {
  return getPanelRoot(picker).querySelector('[part="alpha"]')!;
}

function getAlphaInput(picker: IgcColorPickerComponent): IgcInputComponent {
  return getPanelRoot(picker).querySelector('#alpha')!;
}

function getAlphaEditor(picker: IgcColorPickerComponent): HTMLInputElement {
  return getAlphaInput(picker).renderRoot.querySelector('input')!;
}

/** Replaces the alpha field's current selection with `text`, as the browser would. */
function typeIntoAlpha(picker: IgcColorPickerComponent, text: string): void {
  const editor = getAlphaEditor(picker);
  const start = editor.selectionStart ?? editor.value.length;
  const end = editor.selectionEnd ?? start;

  // The caret must be in place before the event, so splice the value here.
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
 * Dispatches a cancelable `key` press on `node` and returns the event.
 * `simulateKeyboard` does neither.
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
  return getPanelRoot(picker).querySelector('igc-picker-canvas')!;
}

function getFormatSelect(picker: IgcColorPickerComponent): IgcSelectComponent {
  return getPanelRoot(picker).querySelector('#format-select')!;
}

/** The opaque half and the translucent whole of the anchor swatch preview. */
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

/**
 * Expects the hue and alpha ranges to run in `dir` and their track gradients to
 * follow. The track pseudo-element has no computed style, so the gradient comes
 * from its custom property, which needs the theme palette.
 */
async function expectSliderTracks(
  picker: IgcColorPickerComponent,
  dir: 'ltr' | 'rtl'
): Promise<void> {
  const to = dir === 'rtl' ? 'left' : 'right';

  await withDocumentSheets([bootstrap.styleSheet!], () => {
    for (const [name, slider] of [
      ['hue', getHueSlider(picker)],
      ['alpha', getAlphaSlider(picker)],
    ] as const) {
      const style = getComputedStyle(slider);
      const gradient = /^linear-gradient\(\s*to (left|right)/.exec(
        style.getPropertyValue(`--_${name}-slider-track`)
      )?.[1];

      expect({ dir: style.direction, to: gradient }, name).to.eql({ dir, to });
    }
  });
}

/** The localized labels of a picker with `show-alpha` and no value. */
function getLabels(picker: IgcColorPickerComponent) {
  const root = picker.renderRoot;
  const text = (selector: string) =>
    getPanelRoot(picker).querySelector(selector)!.textContent!.trim();
  const marker =
    getCanvas(picker).renderRoot.querySelector('[part~="marker"]')!;

  return {
    open: getAnchor(picker).textContent!.trim(),
    dialog: root.querySelector('#picker')!.getAttribute('aria-label'),
    hue: getHueSlider(picker).getAttribute('aria-label'),
    alpha: getAlphaSlider(picker).getAttribute('aria-label'),
    alphaValue: text('label[for="alpha"]'),
    alphaPlaceholder: getAlphaInput(picker).placeholder,
    format: text('label[for="format-select"]'),
    formatPlaceholder: getFormatSelect(picker).placeholder,
    copy: text('[part="copy"]'),
    eyeDropper: text('[part="eye-dropper"]'),
    canvas: marker.getAttribute('aria-label'),
    canvasValue: marker.getAttribute('aria-valuetext'),
  };
}

/** The labels that {@link getLabels} reads, from a set of resource strings. */
function expectedLabels(strings: IColorPickerResourceStrings) {
  const all = strings as Required<IColorPickerResourceStrings>;

  return {
    open: all.color_picker_open,
    dialog: all.color_picker_dialog_label,
    hue: all.color_picker_hue,
    alpha: all.color_picker_alpha,
    alphaValue: all.color_picker_alpha_value,
    alphaPlaceholder: all.color_picker_alpha_value,
    format: all.color_picker_format,
    formatPlaceholder: all.color_picker_format,
    copy: all.color_picker_copy,
    eyeDropper: all.color_picker_eye_dropper,
    canvas: all.color_picker_canvas_label,
    // An empty picker starts at the white corner.
    canvasValue: formatString(all.color_picker_canvas_value, 0, 100),
  };
}

describe('Color picker', () => {
  before(() => defineComponents(IgcColorPickerComponent));

  let picker: IgcColorPickerComponent;

  describe('Default', () => {
    // The format select has a visually hidden `<label>`.
    // The axe `label-title-only` rule expects a visible one.
    const hiddenLabelOptions = { ignoredRules: ['label-title-only'] };

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

      await expect(picker).shadowDom.to.be.accessible(hiddenLabelOptions);
      await expect(picker).lightDom.to.be.accessible(hiddenLabelOptions);
    });

    it('is accessible (alpha row)', async () => {
      picker.open = true;
      picker.showAlpha = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible(hiddenLabelOptions);
      await expect(picker).lightDom.to.be.accessible(hiddenLabelOptions);
    });

    it('paints the focus ring of the anchor under an earlier page layer', () => {
      const anchor = getAnchor(picker);

      anchor.focus();

      expect(anchor.matches(':focus-visible')).to.be.true;
      expect(isUnderPageLayer(picker, anchor)).to.be.true;
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

    it('describes the anchor by the helper text without helper content', () => {
      expect(getAnchor(picker).getAttribute('aria-describedby')).to.equal(
        'helper-text'
      );
    });

    it('describes the anchor by the helper text, then by the host', async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <span id="picker-hint">Brand color</span>
          <igc-color-picker aria-describedby="picker-hint"></igc-color-picker>
        </div>
      `);
      const host = container.querySelector('igc-color-picker')!;
      await elementUpdated(host);
      await elementUpdated(host);

      expect(getAnchor(host).ariaDescribedByElements).to.eql([
        host.renderRoot.querySelector('#helper-text'),
        container.querySelector('#picker-hint'),
      ]);
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

      expect(
        getPanel(picker).style.getPropertyValue('--_current-color')
      ).to.equal('hsl(0 100% 50%)');
      expect(getCanvas(picker).currentColor).to.equal('hsl(0 100% 50%)');
      expect(getHueSlider(picker).value).to.equal('0');
    });

    it('starts the alpha ramp and the canvas marker at white when there is no value', async () => {
      picker.open = true;
      await elementUpdated(picker);

      // An empty color is white, not the pure hue of the plane.
      expect(
        getPanel(picker).style.getPropertyValue('--_selected-color')
      ).to.equal('rgb(255 255 255)');
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

      // The marker straddles the top left corner, at minus half its size.
      expect(canvas.x).to.equal(-width);
      expect(canvas.y).to.equal(-height);
    });

    it('keeps the alpha field a labelled text field', async () => {
      picker.open = true;
      picker.showAlpha = true;
      picker.value = 'rgb(255 0 0 / 0.5)';
      await elementUpdated(picker);
      await nextFrame();

      // Not a `spinbutton`: that role breaks how screen readers announce typing.
      // The alpha slider carries the range semantics.
      const editor = getAlphaEditor(picker);
      const label = getPanelRoot(picker).querySelector('label[for="alpha"]')!;

      expect(editor.role).to.be.null;
      expect(editor.getAttribute('aria-valuenow')).to.be.null;

      // `<label for="alpha">` labels the `igc-input`. An IDREF cannot cross into
      // the shadow root, so the native editor uses element reflection.
      expect(editor.ariaLabelledByElements).to.eql([label]);
    });
  });

  describe('Localization', () => {
    before(() => registerI18n(ColorPickerResourceStringsBG, 'bg'));

    beforeEach(async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker show-alpha></igc-color-picker>`
      );
      await elementUpdated(getCanvas(picker));
    });

    async function updated(): Promise<void> {
      await elementUpdated(picker);
      await elementUpdated(getCanvas(picker));
    }

    it('renders the English strings by default', () => {
      expect(getLabels(picker)).to.eql(
        expectedLabels(ColorPickerResourceStringsEN)
      );
    });

    it('renders the strings of its `locale`', async () => {
      picker.locale = 'bg';
      await updated();

      expect(getLabels(picker)).to.eql(
        expectedLabels(ColorPickerResourceStringsBG)
      );
    });

    it('follows a change of the global locale', async () => {
      setCurrentI18n('bg');

      try {
        await updated();

        expect(getLabels(picker)).to.eql(
          expectedLabels(ColorPickerResourceStringsBG)
        );
      } finally {
        setCurrentI18n('en');
      }
    });

    it('labels the prefix button of the input mode', async () => {
      picker.mode = 'input';
      picker.locale = 'bg';
      await elementUpdated(picker);

      expect(getAnchor(picker).getAttribute('aria-label')).to.equal(
        ColorPickerResourceStringsBG.color_picker_open
      );
    });

    it('labels the color value input', async () => {
      const label = () =>
        getPanelRoot(picker)
          .querySelector('label[for="color-input"]')!
          .textContent!.trim();

      expect(label()).to.equal(ColorPickerResourceStringsEN.color_picker_value);

      picker.locale = 'bg';
      await elementUpdated(picker);

      expect(label()).to.equal(ColorPickerResourceStringsBG.color_picker_value);
    });

    it('takes single strings from `resourceStrings`', async () => {
      picker.resourceStrings = { color_picker_hue: 'Farbton' };
      await updated();

      expect(getLabels(picker)).to.eql({
        ...expectedLabels(ColorPickerResourceStringsEN),
        hue: 'Farbton',
      });
    });
  });

  describe('Scroll strategy', () => {
    let container: HTMLDivElement;

    async function openColorPicker() {
      picker.open = true;
      await elementUpdated(picker);
      await nextFrame();
    }

    beforeEach(async () => {
      container = await fixture(html`
        <div style="height: 1200px">
          <igc-color-picker></igc-color-picker>
        </div>
      `);
      picker = container.querySelector(IgcColorPickerComponent.tagName)!;
    });

    it('`scroll` behavior', async () => {
      picker.scrollStrategy = 'scroll';
      await openColorPicker();
      await simulateScroll(container, { top: 200 });

      expect(picker.open).to.be.true;
    });

    it('`close` behavior', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.scrollStrategy = 'close';
      await openColorPicker();
      await simulateScroll(container, { top: 200 });

      expect(picker.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.lastCall).calledWith('igcClosed');
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

    it('clears the value for a color that depends on its context', async () => {
      for (const value of ['currentcolor', 'var(--brand)', 'Canvas']) {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        picker.value = value;
        await elementUpdated(picker);

        expect(picker.value, value).to.equal('');
        expect(isAnchorEmpty(picker), value).to.be.true;
      }
    });
  });

  describe('Colors outside the legacy syntax', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('writes an oklch() value in the active format', async () => {
      picker.value = 'oklch(70% 0.1 200)';
      await elementUpdated(picker);

      expect(picker.value).to.equal('#40b1b7');

      picker.format = 'rgb';
      await elementUpdated(picker);

      expect(picker.value).to.equal('rgb(64 177 183)');
    });

    it('clips a color outside the sRGB gamut', async () => {
      picker.value = 'color(display-p3 1 0 0)';
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
    });

    it('commits a typed lab() color', async () => {
      picker.open = true;
      await elementUpdated(picker);

      commitColorInput(getColorInput(picker), 'lab(50% 40 30)');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#bb5846');
    });

    it('reverts a typed color that depends on its context', async () => {
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);

      const input = getColorInput(picker);
      commitColorInput(input, 'currentcolor');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
      expect(input.value).to.equal('#ff0000');
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
      await pickSwatch(picker, '#00ff00');

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).calledWith('igcChange', { detail: '#00ff00' });
    });

    it('does not emit for a value set from code while focus was inside the component', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      picker.value = '#00ff00';
      await elementUpdated(picker);

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).not.calledWith('igcChange');
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
      await pickSwatch(picker, '#00ff00');

      picker.dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: anchor })
      );

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('does not emit when focus moves to slotted content', async () => {
      const link = document.createElement('a');
      link.href = '#';
      link.slot = 'helper-text';
      link.textContent = 'Help';
      picker.append(link);
      await elementUpdated(picker);

      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      await pickSwatch(picker, '#00ff00');

      picker.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: link })
      );

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('does not emit when only the format changed', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));

      // The value changes from `#ff0000` to `rgb(255 0 0)`, but the color does not.
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
      await pickSwatch(picker, '#00ff00');

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).calledWith('igcChange', { detail: 'rgb(0 255 0)' });
    });

    it('does not emit when the color returns to the reported one in another format', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      picker.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null }));
      await pickSwatch(picker, '#00ff00');
      picker.format = 'rgb';
      await pickSwatch(picker, '#ff0000');
      expect(picker.value).to.equal('rgb(255 0 0)');

      picker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));

      expect(eventSpy).not.calledWith('igcChange');
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

    it('does not emit igcInput when the alpha slider keeps the alpha', async () => {
      picker.showAlpha = true;
      picker.format = 'rgb';
      picker.value = 'rgb(255 0 0 / 0.5)';
      await elementUpdated(picker);

      const eventSpy = spy(picker, 'emitEvent');
      const alpha = getAlphaSlider(picker);
      alpha.value = '50';
      alpha.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(picker);

      expect(picker.value).to.equal('rgb(255 0 0 / 0.5)');
      expect(eventSpy).not.calledWith('igcInput');
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
        // A click past the text puts the caret after the suffix.
        const editor = getAlphaEditor(picker);
        editor.setSelectionRange(3, 3);
        simulateClick(editor);

        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);

        typeIntoAlpha(picker, '7');
        await elementUpdated(picker);

        // `507` clamps to 100. The digit went into the number, not after the suffix.
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
        // An empty field is a valid intermediate state, so nothing commits yet.
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

        // Check synchronously. A write one frame later puts the caret after the `%`.
        expect(editor.value).to.equal('51%');
        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);

        await elementUpdated(picker);

        expect([editor.selectionStart, editor.selectionEnd]).to.eql([2, 2]);
      });

      it('stops the caret at the % instead of moving past it', () => {
        const editor = getAlphaEditor(picker);

        // A synthetic key never moves the caret, so assert that the key is canceled.
        // A correction after the move makes the caret skip.
        editor.setSelectionRange(2, 2);
        expect(press(editor, arrowRight).defaultPrevented).to.be.true;

        // End always moves the caret to the limit.
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
      // The alpha input is absent. Its bindings must not fall back to the host.
      expect(press(getHueSlider(picker), arrowUp).defaultPrevented).to.be.false;
    });

    it('moves the hue slider when the color changes from elsewhere', async () => {
      const hue = getHueSlider(picker);

      // A dirty slider value no longer follows the content attribute.
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

      // The saturation/value plane has no alpha, so the marker fill is opaque.
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

  describe('Inner events', () => {
    /**
     * Records the events of `types` that `inner` sends, and the ones of them
     * that also reach a listener on the picker.
     */
    function trackInnerEvents(inner: Element, ...types: string[]) {
      const sent: Event[] = [];
      const leaked: Event[] = [];

      for (const type of types) {
        inner.addEventListener(type, (event) => sent.push(event));
        picker.addEventListener(type, (event) => {
          if (sent.includes(event)) leaked.push(event);
        });
      }

      return { sent, leaked };
    }

    function typeInto(input: IgcInputComponent, value: string): void {
      simulateInput(input.renderRoot.querySelector('input')!, { value });
    }

    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('keeps the igcInput of the alpha input inside', async () => {
      picker.showAlpha = true;
      picker.format = 'rgb';
      await elementUpdated(picker);

      const eventSpy = spy(picker, 'emitEvent');
      const { sent, leaked } = trackInnerEvents(
        getAlphaInput(picker),
        'igcInput'
      );

      clearAlpha(picker);
      typeIntoAlpha(picker, '25');
      await elementUpdated(picker);

      expect(sent).not.to.be.empty;
      expect(leaked).to.be.empty;
      expect(eventSpy).calledWith('igcInput', { detail: picker.value });
    });

    it('keeps the igcInput of the color value input inside', async () => {
      const input = getColorInput(picker);
      const { sent, leaked } = trackInnerEvents(input, 'igcInput');

      typeInto(input, '#00ff00');
      await elementUpdated(picker);

      expect(sent).lengthOf(1);
      expect(leaked).to.be.empty;
    });

    it('keeps the igcInput of the input anchor inside', async () => {
      picker.mode = 'input';
      await elementUpdated(picker);

      const input = picker.renderRoot.querySelector<IgcInputComponent>(
        'igc-input[slot="anchor"]'
      )!;
      const { sent, leaked } = trackInnerEvents(input, 'igcInput');

      typeInto(input, '#00ff00');
      await elementUpdated(picker);

      expect(sent).lengthOf(1);
      expect(leaked).to.be.empty;
    });

    it('keeps the open and close events of the format select inside', async () => {
      const select = getFormatSelect(picker);
      const { sent, leaked } = trackInnerEvents(
        select,
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed'
      );

      simulateClick(select.renderRoot.querySelector('igc-input')!);
      await elementUpdated(select);

      simulateClick(select.items[1]);
      await elementUpdated(select);

      expect(sent.map(({ type }) => type)).to.deep.equal([
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
      ]);
      expect(leaked).to.be.empty;
      expect(picker.format).to.equal('rgb');
    });

    it('keeps the igcColorPicked of the canvas inside', async () => {
      const canvas = getCanvas(picker);
      const { sent, leaked } = trackInnerEvents(canvas, 'igcColorPicked');

      simulateKeyboard(canvas, arrowDown);
      await elementUpdated(picker);

      expect(sent).lengthOf(1);
      expect(leaked).to.be.empty;
    });
  });

  describe('Swatches', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.open = true;
      await elementUpdated(picker);
    });

    it('does not render swatches by default', () => {
      expect(
        getPanelRoot(picker).querySelector<HTMLElement>('[part="swatches"]')
          ?.hidden
      ).to.be.true;
    });

    it('renders and selects a swatch', async () => {
      picker.swatches = ['#ff0000', '#00ff00'];
      await elementUpdated(picker);

      const buttons =
        getPanelRoot(picker).querySelectorAll<IgcColorSwatchComponent>(
          '[part~="swatch"]'
        );
      expect(buttons.length).to.equal(2);
      expect(internalsOf(buttons[0])?.getARIA('ariaLabel')).to.equal(
        'vibrant red'
      );
      expect(buttons[0].color).to.equal('#ff0000');

      const inputSpy = spy(picker, 'emitEvent');
      buttons[1].click();
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
      expect(inputSpy).calledWith('igcInput', { detail: '#00ff00' });
    });

    it('selects a swatch independently of its accessible name', async () => {
      picker.swatches = ['#ff0000', '#00ff00'];
      await elementUpdated(picker);

      const buttons =
        getPanelRoot(picker).querySelectorAll<IgcColorSwatchComponent>(
          '[part~="swatch"]'
        );

      // The color comes from `color`, so the label does not change it.
      buttons[1].label = 'Vert';
      buttons[1].click();
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
    });

    it('ignores a swatch click while disabled', async () => {
      picker.swatches = ['#00ff00'];
      await elementUpdated(picker);
      const { value } = picker;
      const eventSpy = spy(picker, 'emitEvent');

      picker.disabled = true;
      await elementUpdated(picker);
      getPanelRoot(picker)
        .querySelector<HTMLElement>('[part~="swatch"]')!
        .click();
      await elementUpdated(picker);

      expect(picker.value).to.equal(value);
      expect(eventSpy).not.calledWith('igcInput');
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

      simulateClick(
        getPanelRoot(picker).querySelector<HTMLElement>('[part="copy"]')!
      );

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

        const button = getPanelRoot(picker).querySelector(
          '[part="eye-dropper"]'
        )!;
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

        const button = getPanelRoot(picker).querySelector<HTMLElement>(
          '[part="eye-dropper"]'
        )!;
        expect(button.hasAttribute('disabled')).to.be.false;

        button.click();
        // Let the mocked EyeDropper's promise resolve.
        await new Promise((resolve) => setTimeout(resolve));
        await elementUpdated(picker);

        expect(picker.value).to.equal('#112233');
      });

      it('ignores a pick that ends after the picker is disabled', async () => {
        picker = await createDefaultColorPicker();
        const { value } = picker;
        const eventSpy = spy(picker, 'emitEvent');

        getPanelRoot(picker)
          .querySelector<HTMLElement>('[part="eye-dropper"]')!
          .click();
        picker.disabled = true;
        await new Promise((resolve) => setTimeout(resolve));
        await elementUpdated(picker);

        expect(picker.value).to.equal(value);
        expect(eventSpy).not.calledWith('igcInput');
      });

      describe('in the confirm mode', () => {
        beforeEach(async () => {
          picker = await fixture<IgcColorPickerComponent>(
            html`<igc-color-picker
              value="#ff0000"
              selection-commit="confirm"
              open
            ></igc-color-picker>`
          );
          simulateClick(
            getPanelRoot(picker).querySelector('[part~="eye-dropper"]')!
          );
        });

        it('takes a pick into the draft', async () => {
          await new Promise((resolve) => setTimeout(resolve));
          await elementUpdated(picker);

          expect(picker.value).to.equal('#ff0000');
          expect(getPanel(picker).value).to.equal('#112233');
        });

        it('ignores a pick that ends after the popup closes', async () => {
          picker.open = false;
          await new Promise((resolve) => setTimeout(resolve));
          await elementUpdated(picker);

          expect(picker.value).to.equal('#ff0000');
          expect(getPanel(picker).value).to.equal('#ff0000');
        });
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

    it('cancels Escape only while open', async () => {
      expect(simulateCancelableKeydown(picker, escapeKey)).to.be.false;

      await picker.show();
      expect(simulateCancelableKeydown(picker, escapeKey)).to.be.true;
    });

    it('stays open on an Escape that an IME handles', async () => {
      await picker.show();

      simulateComposingKeys(picker, escapeKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
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

  describe('Confirm mode', () => {
    beforeEach(async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker
          value="#ff0000"
          selection-commit="confirm"
          open
        ></igc-color-picker>`
      );
    });

    function getPart(name: string): HTMLElement {
      return picker.renderRoot.querySelector(`[part~="${name}"]`)!;
    }

    function valueEvents(eventSpy: SinonSpy): string[] {
      return eventSpy
        .getCalls()
        .map((call) => call.args[0])
        .filter((name) => name === 'igcInput' || name === 'igcChange');
    }

    it('is accessible', async () => {
      await expect(picker).shadowDom.to.be.accessible(axeHiddenLabelOptions);
      await expect(picker).lightDom.to.be.accessible(axeHiddenLabelOptions);
    });

    it('shows the preview, Cancel and Apply only in the confirm mode', async () => {
      expect(getPart('footer').hidden).to.be.false;
      expect(getPart('preview-initial').getAttribute('aria-label')).to.equal(
        'Initial color'
      );
      expect(getPart('cancel-button').textContent!.trim()).to.equal('Cancel');
      expect(getPart('apply-button').textContent!.trim()).to.equal('Apply');

      picker.selectionCommit = 'immediate';
      await elementUpdated(picker);

      expect(getPart('footer').hidden).to.be.true;
      expect(getPart('actions')).to.be.null;
    });

    it('shows the content of the footer slot in both modes', async () => {
      const content = document.createElement('a');
      content.slot = 'footer';
      content.href = '#';
      content.textContent = 'More colors';

      picker.selectionCommit = 'immediate';
      picker.append(content);
      await elementUpdated(picker);

      expect(getPart('footer').hidden).to.be.false;
      expect(content.assignedSlot?.name).to.equal('footer');
    });

    it('keeps a change in the popup as a draft', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      await pickSwatch(picker, '#00ff00');

      expect(picker.value).to.equal('#ff0000');
      expect(getPanel(picker).value).to.equal('#00ff00');
      expect(getAnchorPreview(picker).alpha).to.equal('rgb(255 0 0 / 1)');
      expect(
        getPart('preview-initial').style.getPropertyValue('--_alpha-preview')
      ).to.equal('rgb(255 0 0 / 1)');
      expect(
        getPart('preview-current').style.getPropertyValue('--_alpha-preview')
      ).to.equal('rgb(0 255 0 / 1)');
      expect(valueEvents(eventSpy)).to.be.empty;
    });

    it('applies the draft with one igcChange and closes', async () => {
      await pickSwatch(picker, '#00ff00');
      const eventSpy = spy(picker, 'emitEvent');

      simulateClick(getPart('apply-button'));
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
      expect(picker.open).to.be.false;
      expect(isFocused(getAnchor(picker))).to.be.true;
      expect(valueEvents(eventSpy)).to.eql(['igcChange']);
      expect(eventSpy).calledWith('igcChange', { detail: '#00ff00' });

      // The focus leaves after the report.
      picker.blur();
      expect(valueEvents(eventSpy)).to.eql(['igcChange']);
    });

    it('emits no igcChange for an Apply without a change', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      simulateClick(getPart('apply-button'));
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(valueEvents(eventSpy)).to.be.empty;
    });

    for (const [name, close] of [
      ['Cancel', () => simulateClick(getPart('cancel-button'))],
      ['Escape', () => simulateKeyboard(picker, escapeKey)],
      ['Alt + Arrow Up', () => simulateKeyboard(picker, [altKey, arrowUp])],
      ['an outside click', () => simulateClick(document.body)],
      [
        'a scroll close',
        async () => {
          picker.scrollStrategy = 'close';
          await elementUpdated(picker);
          await simulateScroll(picker.parentElement!, { top: 0 });
        },
      ],
      ['hide()', () => picker.hide()],
      [
        'open = false',
        () => {
          picker.open = false;
        },
      ],
      [
        'disabling',
        () => {
          picker.disabled = true;
        },
      ],
    ] as const) {
      it(`drops the draft on ${name}`, async () => {
        const eventSpy = spy(picker, 'emitEvent');

        await pickSwatch(picker, '#00ff00');
        await close();
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(picker.value).to.equal('#ff0000');
        expect(getPanel(picker).value).to.equal('#ff0000');
        expect(valueEvents(eventSpy)).to.be.empty;
      });
    }

    it('keeps the draft on Cancel, and applies it on Apply, when the app cancels the close', async () => {
      picker.addEventListener('igcClosing', (event) => event.preventDefault());
      await pickSwatch(picker, '#00ff00');

      simulateClick(getPart('cancel-button'));
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(getPanel(picker).value).to.equal('#00ff00');

      simulateClick(getPart('apply-button'));
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(picker.value).to.equal('#00ff00');
    });

    it('shows the value in the text field of the input mode', async () => {
      picker.mode = 'input';
      await elementUpdated(picker);
      await pickSwatch(picker, '#00ff00');

      expect(getAnchorField(picker).value).to.equal('#ff0000');
      expect(getAnchorPreview(picker).alpha).to.equal('rgb(255 0 0 / 1)');
    });

    it('shows the contrast of the draft', async () => {
      picker.contrastAgainst = 'white';
      await pickSwatch(picker, '#000000');

      const ratio = getPanelRoot(picker).querySelector(
        '[part="contrast-ratio"]'
      );

      expect(picker.value).to.equal('#ff0000');
      expect(ratio?.textContent).to.equal('Contrast 21:1');
    });

    it('takes an alpha commit into the draft', async () => {
      picker.showAlpha = true;
      picker.format = 'rgb';
      await elementUpdated(picker);
      const eventSpy = spy(picker, 'emitEvent');

      clearAlpha(picker);
      typeIntoAlpha(picker, '40');
      commitColorInput(getAlphaInput(picker), '40%');
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(picker.value).to.equal('rgb(255 0 0)');
      expect(getPanel(picker).value).to.equal('rgb(255 0 0 / 0.4)');
      expect(valueEvents(eventSpy)).to.be.empty;
    });

    it('applies on Enter on a swatch, and only picks on Space', async () => {
      picker.swatches = ['#00ff00', '#0000ff'];
      await elementUpdated(picker);
      const [green, blue] =
        getPanelRoot(picker).querySelectorAll<IgcColorSwatchComponent>(
          '[part~="swatch"]'
        );

      blue.focus();
      simulateKeyboard(blue, spaceBar);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(getPanel(picker).value).to.equal('#0000ff');

      green.focus();
      simulateKeyboard(green, enterKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(picker.value).to.equal('#00ff00');
    });

    it('applies on Enter on the canvas marker and on a slider', async () => {
      const marker =
        getCanvas(picker).renderRoot.querySelector<HTMLElement>(
          '[part~="marker"]'
        )!;

      simulateKeyboard(marker, arrowDown);
      simulateKeyboard(marker, enterKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(picker.value).to.not.equal('#ff0000');

      await picker.show();
      const hue = getHueSlider(picker);
      simulateInput(hue, { value: '120' });
      simulateKeyboard(hue, enterKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(ColorModel.parse(picker.value).h).to.be.closeTo(120, 1);
    });

    it('commits a typed color into the draft, and Enter there does not apply', async () => {
      const input = getColorInput(picker);

      commitColorInput(input, 'blue');
      simulateKeyboard(input.renderRoot.querySelector('input')!, enterKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(picker.value).to.equal('#ff0000');
      expect(getPanel(picker).value).to.equal('#0000ff');
    });

    it('restores the initial color from the preview', async () => {
      await pickSwatch(picker, '#00ff00');

      simulateClick(getPart('preview-initial'));
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
      expect(getPanel(picker).value).to.equal('#ff0000');
    });

    it('ends the draft for a new value from code, and keeps it for the same color', async () => {
      await pickSwatch(picker, '#00ff00');

      picker.value = 'rgb(255 0 0)';
      await elementUpdated(picker);
      expect(getPanel(picker).value).to.equal('#00ff00');

      picker.value = '#0000ff';
      await elementUpdated(picker);
      expect(getPanel(picker).value).to.equal('#0000ff');
    });

    it('keeps the draft in a new format', async () => {
      await pickSwatch(picker, '#00ff00');

      picker.format = 'rgb';
      await elementUpdated(picker);

      expect(picker.value).to.equal('rgb(255 0 0)');
      expect(getPanel(picker).value).to.equal('rgb(0 255 0)');
    });

    it('drops the draft when the confirm mode ends', async () => {
      await pickSwatch(picker, '#00ff00');

      picker.selectionCommit = 'immediate';
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
      expect(getPanel(picker).value).to.equal('#ff0000');
    });

    it('drops the draft and clears as a user change on the clear icon', async () => {
      picker.mode = 'input';
      await elementUpdated(picker);
      await pickSwatch(picker, '#00ff00');
      const eventSpy = spy(picker, 'emitEvent');

      simulateClick(getPart('clear-icon'));
      await elementUpdated(picker);

      expect(picker.value).to.equal('');
      expect(getPanel(picker).value).to.equal('');
      expect(valueEvents(eventSpy)).to.eql(['igcInput']);
    });

    it('drops the draft for a commit of the text field of the input mode', async () => {
      picker.mode = 'input';
      await elementUpdated(picker);
      await pickSwatch(picker, '#00ff00');

      commitColorInput(getAnchorField(picker), '#0000ff');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#0000ff');
      expect(getPanel(picker).value).to.equal('#0000ff');
    });

    it('keeps Enter for the controls in the immediate mode', async () => {
      picker.selectionCommit = 'immediate';
      await elementUpdated(picker);

      const hue = getHueSlider(picker);
      simulateKeyboard(hue, enterKey);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
    });
  });

  describe('Input mode', () => {
    function getInputAnchor(): IgcInputComponent {
      return getAnchorField(picker);
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

      // `--_color-preview` is the opaque half.
      // `--_alpha-preview` is the translucent whole.
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

        // The open dialog takes the focus, so the input loses `:focus-within`.
        // The placeholder keeps the Material outline notch cut.
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

      // A native button gives focus and Enter/Space activation.
      expect(anchor.tagName.toLowerCase()).to.equal('button');
      expect(anchor.getAttribute('type')).to.equal('button');
      expect(anchor.getAttribute('aria-label')).to.equal('Open color picker');
      expect(anchor.getAttribute('aria-haspopup')).to.equal('dialog');
      expect(anchor.getAttribute('aria-controls')).to.equal('picker');

      anchor.focus();
      expect(isFocused(anchor)).to.be.true;
    });

    it('reflects the open state on the prefix swatch, not on the text input', async () => {
      const native = getAnchorNativeInput(picker);

      expect(getAnchor(picker).getAttribute('aria-expanded')).to.equal('false');

      picker.open = true;
      await elementUpdated(picker);
      await elementUpdated(getInputAnchor());

      expect(getAnchor(picker).getAttribute('aria-expanded')).to.equal('true');
      expect(native.hasAttribute('aria-expanded')).to.be.false;
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

      // The input-mode swatch paints on its own background, so the empty mark
      // must win over the transparency grid at the same specificity.
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

    describe('Clear icon', () => {
      function getClearIcon(): HTMLElement | null {
        return picker.renderRoot.querySelector('[part="clear-icon"]');
      }

      it('shows the clear icon in the suffix only while a color is set', async () => {
        expect(getClearIcon()).to.be.null;

        picker.value = '#ff0000';
        await elementUpdated(picker);

        const icon = getClearIcon()!;
        expect(icon.slot).to.equal('suffix');
        expect(icon.parentElement).to.equal(getInputAnchor());

        picker.value = '';
        await elementUpdated(picker);

        expect(getClearIcon()).to.be.null;
      });

      it('names the clear icon as a button', async () => {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        const icon = getClearIcon()!;
        expect(icon.role).to.equal('button');
        expect(icon.ariaLabel).to.equal('Clear color');

        picker.resourceStrings = { color_picker_clear: 'Effacer' };
        await elementUpdated(picker);

        expect(getClearIcon()!.ariaLabel).to.equal('Effacer');
      });

      it('has no clear icon in default mode', async () => {
        picker = await fixture<IgcColorPickerComponent>(
          html`<igc-color-picker value="#ff0000"></igc-color-picker>`
        );

        expect(getClearIcon()).to.be.null;
      });

      it('fills its container, so the clear icon does not change its width', async () => {
        const container = await fixture<HTMLDivElement>(
          html`<div style="inline-size: 400px">
            <igc-color-picker mode="input"></igc-color-picker>
          </div>`
        );
        picker = container.querySelector('igc-color-picker')!;
        const field = getInputAnchor();

        expect(field.getBoundingClientRect().width).to.equal(400);

        picker.value = '#ff0000';
        await elementUpdated(picker);

        expect(getClearIcon()).to.exist;
        expect(field.getBoundingClientRect().width).to.equal(400);
      });

      it('clears with igcInput, and reports igcChange when the focus leaves', async () => {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        picker.dispatchEvent(
          new FocusEvent('focusin', { relatedTarget: null })
        );
        const eventSpy = spy(picker, 'emitEvent');

        simulateClick(getClearIcon()!);
        await elementUpdated(picker);

        expect(picker.value).to.equal('');
        expect(getInputAnchor().value).to.equal('');
        expect(isAnchorEmpty(picker)).to.be.true;
        expect(eventSpy).calledOnceWith('igcInput', { detail: '' });

        picker.dispatchEvent(
          new FocusEvent('focusout', { relatedTarget: null })
        );

        expect(eventSpy).calledTwice;
        expect(eventSpy.secondCall).calledWith('igcChange', { detail: '' });
      });

      it('keeps the focus in the text field on a click', async () => {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        const native = getAnchorNativeInput(picker);
        native.focus();

        const { x, y, width, height } = getClearIcon()!.getBoundingClientRect();
        await sendMouse({
          type: 'click',
          position: [Math.round(x + width / 2), Math.round(y + height / 2)],
        });
        await elementUpdated(picker);

        expect(picker.value).to.equal('');
        expect(native.matches(':focus')).to.be.true;
      });

      it('renders the content of the clear-icon slot', async () => {
        picker = await fixture<IgcColorPickerComponent>(
          html`<igc-color-picker mode="input" value="#ff0000">
            <span slot="clear-icon">x</span>
          </igc-color-picker>`
        );

        const slot = getClearIcon()!.querySelector<HTMLSlotElement>(
          'slot[name="clear-icon"]'
        )!;

        expect(slot.assignedElements()).to.have.lengthOf(1);
      });

      it('changes nothing on a click while disabled', async () => {
        picker.value = '#ff0000';
        picker.disabled = true;
        await elementUpdated(picker);

        const eventSpy = spy(picker, 'emitEvent');
        simulateClick(getClearIcon()!);
        await elementUpdated(picker);

        expect(picker.value).to.equal('#ff0000');
        expect(eventSpy).not.called;
      });

      it('clear() clears the value and the text, with no events', async () => {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        picker.dispatchEvent(
          new FocusEvent('focusin', { relatedTarget: null })
        );
        const eventSpy = spy(picker, 'emitEvent');

        picker.clear();
        await elementUpdated(picker);

        expect(picker.value).to.equal('');
        expect(getInputAnchor().value).to.equal('');
        expect(getClearIcon()).to.be.null;

        picker.dispatchEvent(
          new FocusEvent('focusout', { relatedTarget: null })
        );

        expect(eventSpy).not.called;
      });
    });

    describe('Field parts', () => {
      /** Parts of the picker and the parts of the field they name. */
      const forwarded = {
        input: 'container',
        'native-input': 'input',
        label: 'label',
        prefix: 'prefix',
        suffix: 'suffix',
      };

      it('exposes the text field as `field` and forwards its parts', () => {
        const field = getInputAnchor();

        expect(field.getAttribute('part')).to.equal('field');
        expect(field.getAttribute('exportparts')).to.equal(
          'container: input, input: native-input, label, prefix, suffix'
        );
      });

      it('styles the text field through the parts, not the inputs of the picker', async () => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(
          ['field', ...Object.keys(forwarded)]
            .map(
              (name) =>
                `igc-color-picker::part(${name}) { --probe-${name}: on; }`
            )
            .join('\n')
        );

        await withDocumentSheets([sheet], async () => {
          picker.value = '#ff0000';
          picker.open = true;
          await elementUpdated(picker);

          const field = getInputAnchor();
          const probe = (element: Element, name: string) =>
            getComputedStyle(element)
              .getPropertyValue(`--probe-${name}`)
              .trim();

          expect(probe(field, 'field')).to.equal('on');
          expect(probe(getColorInput(picker), 'field')).to.equal('');

          for (const [name, inner] of Object.entries(forwarded)) {
            const element = field.renderRoot.querySelector(
              `[part~="${inner}"]`
            )!;

            expect(element, name).to.exist;
            expect(probe(element, name), name).to.equal('on');
          }
        });
      });
    });
  });

  describe('Color panel', () => {
    const panelParts = [
      'picker-canvas',
      'marker',
      'dragging',
      'main-row',
      'alpha-row',
      'inputs-row',
      'buttons',
      'hue',
      'alpha',
      'alpha-input',
      'copy',
      'eye-dropper',
      'format-select',
      'swatches',
      'swatch',
      'selected',
      'view-switcher',
      'view-button',
      'active',
      'contrast',
      'contrast-ratio',
      'contrast-mark',
      'pass',
      'fail',
    ];

    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('shows the color panel in the popup', () => {
      const popup = picker.renderRoot.querySelector('[part="picker"]')!;

      expect(popup.querySelector('igc-color-panel')).to.equal(getPanel(picker));
    });

    it('forwards the parts of the panel as its own', () => {
      expect(
        getPanel(picker)
          .getAttribute('exportparts')!
          .split(',')
          .map((part) => part.trim())
      ).to.eql(panelParts);
    });

    it('styles the controls of the panel through its parts', async () => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('igc-color-picker::part(hue) { --probe: on; }');

      await withDocumentSheets([sheet], async () => {
        picker.open = true;
        await elementUpdated(picker);

        expect(
          getComputedStyle(getHueSlider(picker))
            .getPropertyValue('--probe')
            .trim()
        ).to.equal('on');
      });
    });

    it('passes its options and strings to the panel', async () => {
      picker.format = 'rgb';
      picker.showAlpha = true;
      picker.hideFormats = true;
      picker.swatches = ['#ff0000'];
      picker.resourceStrings = { color_picker_hue: 'Tone' };
      await elementUpdated(picker);

      const panel = getPanel(picker);

      expect(panel.format).to.equal('rgb');
      expect(panel.showAlpha).to.be.true;
      expect(panel.hideFormats).to.be.true;
      expect(panel.swatches).to.eql(['#ff0000']);
      expect(panel.resourceStrings.color_picker_hue).to.equal('Tone');
    });

    it('shows the OKLCH area in the popup for the oklch format', async () => {
      picker.format = 'oklch';
      picker.value = '#ff00ff';
      picker.open = true;
      await elementUpdated(picker);

      const canvas = getPanelRoot(picker).querySelector('igc-picker-canvas')!;

      expect(canvas.space).to.equal('oklch');
      expect(getHueSlider(picker).value).to.equal('328');
    });

    it('passes contrastAgainst to the panel', async () => {
      picker.value = '#000000';
      picker.contrastAgainst = 'white';
      await elementUpdated(picker);

      const panel = getPanel(picker);
      const ratio = panel.renderRoot.querySelector('[part="contrast-ratio"]');

      expect(panel.contrastAgainst).to.equal('white');
      expect(ratio?.textContent).to.equal('Contrast 21:1');
    });

    it('keeps the value of the panel equal to its own', async () => {
      picker.value = 'oklch(70% 0.1 200)';
      await elementUpdated(picker);

      expect(getPanel(picker).value).to.equal(picker.value);

      picker.format = 'hsl';
      await elementUpdated(picker);

      expect(getPanel(picker).value).to.equal(picker.value);
    });

    it('keeps the events of the panel inside', async () => {
      const leaked: Event[] = [];

      for (const type of ['igcInput', 'igcChange']) {
        picker.addEventListener(type, (event) => {
          if (event.composedPath()[0] !== picker) {
            leaked.push(event);
          }
        });
      }

      picker.open = true;
      await elementUpdated(picker);
      await pickSwatch(picker, '#00ff00');

      expect(leaked).to.be.empty;
    });

    it('shows its swatch children in the swatch list of the panel', async () => {
      picker = await fixture<IgcColorPickerComponent>(html`
        <igc-color-picker label="Choose a color">
          <igc-color-swatch color="#00ff00"></igc-color-swatch>
          <igc-color-swatch-group>
            <span slot="label">Brand</span>
            <igc-color-swatch color="#0000ff"></igc-color-swatch>
          </igc-color-swatch-group>
        </igc-color-picker>
      `);
      picker.open = true;
      await elementUpdated(picker);
      await nextFrame();
      await elementUpdated(picker);

      const [green, blue] =
        picker.querySelectorAll<IgcColorSwatchComponent>('igc-color-swatch');
      const list =
        getPanelRoot(picker).querySelector<HTMLElement>('[part="swatches"]')!;

      expect(list.hidden).to.be.false;
      expect(
        list.querySelector('slot')!.assignedElements({ flatten: true })
      ).to.eql([green, blue.parentElement]);

      // The swatch list is a stop of the focus trap of the popup.
      const trap = picker.renderRoot.querySelector('igc-focus-trap')!;
      expect(trap.focusableElements).to.include(green);

      const eventSpy = spy(picker, 'emitEvent');
      simulateClick(blue);
      await elementUpdated(picker);

      expect(picker.value).to.equal('#0000ff');
      expect(eventSpy).calledWith('igcInput', { detail: '#0000ff' });
    });

    it('passes its views and takes the view of the switcher', async () => {
      picker.views = 'gradient swatches';
      picker.activeView = 'swatches';
      picker.open = true;
      await elementUpdated(picker);

      const panel = getPanel(picker);
      expect(panel.views).to.equal('gradient swatches');
      expect(panel.activeView).to.equal('swatches');

      simulateClick(
        getPanelRoot(picker).querySelector<HTMLElement>(
          '[part~="view-button"][value="gradient"]'
        )!
      );
      await elementUpdated(picker);

      expect(picker.activeView).to.equal('gradient');
      expect(panel.activeView).to.equal('gradient');
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

      expect(getPanelRoot(picker).querySelector('[part="alpha-row"]')).to.be
        .null;

      picker.showAlpha = true;
      await elementUpdated(picker);

      expect(getPanelRoot(picker).querySelector('[part="alpha-row"]')).to.exist;
    });

    it('hides the format select when hideFormats is set', async () => {
      picker = await createDefaultColorPicker();
      picker.open = true;
      await elementUpdated(picker);
      expect(getPanelRoot(picker).querySelector('#format-select')).to.exist;

      picker.hideFormats = true;
      await elementUpdated(picker);
      expect(getPanelRoot(picker).querySelector('#format-select')).to.be.null;
    });

    it('runs the slider tracks in the direction of the ranges', async () => {
      const container = await fixture<HTMLElement>(
        html`<div><igc-color-picker open show-alpha></igc-color-picker></div>`
      );
      picker = container.querySelector('igc-color-picker')!;
      await expectSliderTracks(picker, 'ltr');

      container.dir = 'rtl';
      await expectSliderTracks(picker, 'rtl');

      container.removeAttribute('dir');
      picker.dir = 'rtl';
      await expectSliderTracks(picker, 'rtl');
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

    it('resets the anchor input on form reset in input mode', async () => {
      spec.setProperties({ mode: 'input' });
      await elementUpdated(spec.element);

      const input = spec.element.renderRoot.querySelector<IgcInputComponent>(
        'igc-input[slot="anchor"]'
      )!;
      commitColorInput(input, '#bada55');
      await elementUpdated(spec.element);
      expect(spec.element.value).to.equal('#bada55');

      spec.reset();
      await elementUpdated(spec.element);

      expect(spec.element.value).to.equal('');
      expect(input.value).to.equal('');
    });

    it('shows the invalid state of the picker on the anchor input at once', async () => {
      spec.setProperties({ mode: 'input' });
      await elementUpdated(spec.element);

      const input = spec.element.renderRoot.querySelector<IgcInputComponent>(
        'igc-input[slot="anchor"]'
      )!;

      spec.element.invalid = true;
      ValidityHelpers.hasInvalidStyles(input).to.be.true;

      spec.element.invalid = false;
      ValidityHelpers.hasInvalidStyles(input).to.be.false;
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

    it('styles a user change that fails validation at once', async () => {
      spec.element.setCustomValidity('invalid');
      await elementUpdated(spec.element);
      ValidityHelpers.hasInvalidStyles(spec.element).to.be.false;

      await pickSwatch(spec.element, '#ff0000');

      expect(spec.element.value).to.equal('#ff0000');
      ValidityHelpers.hasInvalidStyles(spec.element).to.be.true;
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

  describe('Initial format', () => {
    const rgb = 'rgb(186 218 85)';

    it('serializes a value attribute that comes before the format attribute', async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker value="#bada55" format="rgb"></igc-color-picker>`
      );

      expect(picker.value).to.equal(rgb);
    });

    it('serializes a value attribute that comes after the format attribute', async () => {
      picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker format="rgb" value="#bada55"></igc-color-picker>`
      );

      expect(picker.value).to.equal(rgb);
    });

    describe('with a default value set before the format', () => {
      const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(html`
        <igc-color-picker
          name="color-picker"
          .defaultValue=${'#bada55'}
          format=${'rgb'}
        ></igc-color-picker>
      `);

      beforeEach(async () => {
        await spec.setup(IgcColorPickerComponent.tagName);
      });

      it('stays pristine', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.equal(rgb);
      });

      it('submits the value in the format', () => {
        spec.assertSubmitHasValue(rgb);
      });

      it('restores the value in the format on form reset', () => {
        spec.setProperties({ value: '#ff0000' });

        spec.reset();
        expect(spec.element.value).to.equal(rgb);
      });
    });
  });

  describe('Value state motion', () => {
    const anchor = () =>
      picker.renderRoot.querySelector<IgcInputComponent>(
        'igc-input[slot="anchor"]'
      )!;

    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.mode = 'input';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('marks the input as a user change for a typed color', () => {
      commitColorInput(getColorInput(picker), '#00ff00');

      expect(picker.value).to.equal('#00ff00');
      expect(isUserChange(anchor())).to.be.true;
    });

    it('shows a value from code after a typed color at once', () => {
      commitColorInput(getColorInput(picker), '#00ff00');
      picker.value = '#ff0000';

      expect(isUserChange(anchor())).to.be.false;
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
    it('renders validation message slots', async () => {
      const testParameters: ValidationContainerTestsParams<IgcColorPickerComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } },
          { slots: ['customError'] },
          { slots: ['invalid'], props: { required: true } },
        ];

      await runValidationContainerTests(
        IgcColorPickerComponent,
        testParameters
      );
    });
  });

  runExternalLabelAssociationTests({
    tagName: IgcColorPickerComponent.tagName,
    hostAttributes: 'mode="input"',
    getNativeInput: getAnchorNativeInput,
  });

  describe('Default mode trigger', () => {
    runExternalLabelAssociationTests({
      tagName: IgcColorPickerComponent.tagName,
      getNativeInput: (host) =>
        (host as IgcColorPickerComponent).renderRoot.querySelector<HTMLElement>(
          '#trigger'
        )!,
    });
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
  });

  runFocusBeforeRenderTests(html`<igc-color-picker></igc-color-picker>`);

  runDisabledPopupTests(IgcColorPickerComponent, {
    getAriaTarget: getAnchor,
  });
});
