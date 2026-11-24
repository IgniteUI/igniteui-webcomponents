import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import {
  type SinonFakeTimers,
  type SinonSpy,
  spy,
  stub,
  useFakeTimers,
} from 'sinon';

import { internalsOf } from '#internals/controllers/internals.js';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  axeHiddenLabelOptions,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { getDeepActiveElement } from '#internals/utils/dom.js';
import { configureTheme } from '#theming/config.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcColorPickerComponent from '../color-picker/color-picker.js';
import type IgcPickerCanvasComponent from '../color-picker/picker-canvas.js';
import type IgcInputComponent from '../input/input.js';
import type IgcSelectComponent from '../select/select.js';
import IgcColorPanelComponent from './color-panel.js';
import type IgcColorSwatchGroupComponent from './color-swatch-group.js';
import type IgcColorSwatchComponent from './color-swatch.js';
import { swatchKey } from './common.js';

function query<T extends Element>(
  panel: IgcColorPanelComponent,
  selector: string
): T {
  return panel.renderRoot.querySelector<T>(selector)!;
}

const getBase = (panel: IgcColorPanelComponent) =>
  query<HTMLElement>(panel, '[part="base"]');
const getCanvas = (panel: IgcColorPanelComponent) =>
  query<IgcPickerCanvasComponent>(panel, 'igc-picker-canvas');
const getHue = (panel: IgcColorPanelComponent) =>
  query<HTMLInputElement>(panel, '[part="hue"]');
const getAlphaSlider = (panel: IgcColorPanelComponent) =>
  query<HTMLInputElement>(panel, '[part="alpha"]');
const getCopy = (panel: IgcColorPanelComponent) =>
  query<IgcIconButtonComponent>(panel, '[part="copy"]');
const getColorInput = (panel: IgcColorPanelComponent) =>
  query<IgcInputComponent>(panel, '#color-input');
const getAlphaInput = (panel: IgcColorPanelComponent) =>
  query<IgcInputComponent>(panel, '#alpha');
const getFormatSelect = (panel: IgcColorPanelComponent) =>
  query<IgcSelectComponent>(panel, '#format-select');
const getSwatchList = (panel: IgcColorPanelComponent) =>
  query<HTMLElement>(panel, '[part="swatches"]');
const getOwnSwatches = (panel: IgcColorPanelComponent) =>
  Array.from(
    panel.renderRoot.querySelectorAll<IgcColorSwatchComponent>(
      '[part~="swatch"]'
    )
  );
const getViewButtons = (panel: IgcColorPanelComponent) =>
  Array.from(
    panel.renderRoot.querySelectorAll<HTMLElement>('[part~="view-button"]')
  );
const getContrast = (panel: IgcColorPanelComponent) =>
  panel.renderRoot.querySelector<HTMLElement>('[part="contrast"]');

/** The texts of the contrast readout and the parts of its marks, or `null` without a readout. */
function readout(
  panel: IgcColorPanelComponent
): { ratio: string; marks: [string, string][] } | null {
  const contrast = getContrast(panel);

  if (!contrast) {
    return null;
  }

  return {
    ratio: contrast.querySelector('[part="contrast-ratio"]')!.textContent!,
    marks: Array.from(
      contrast.querySelectorAll('[part~="contrast-mark"]'),
      (mark) => [mark.getAttribute('part')!, mark.textContent!.trim()]
    ),
  };
}

/** Whether the swatch shows as the selected option. */
function isSelected(swatch: IgcColorSwatchComponent): boolean {
  const selected = swatch.matches(':state(ig-selected)');

  expect(internalsOf(swatch)?.getARIA('ariaSelected')).to.equal(`${selected}`);
  return selected;
}

/** The name of the swatch, as the accessibility tree and axe see it. */
function nameOf(swatch: IgcColorSwatchComponent): string | null {
  const name = internalsOf(swatch)?.getARIA('ariaLabel') ?? null;

  expect(swatch.getAttribute('aria-label')).to.equal(name);
  return name;
}

/** The swatch children connect, then the panel reads their colors. */
async function swatchesSettled(panel: IgcColorPanelComponent): Promise<void> {
  await nextFrame();
  await elementUpdated(panel);
}

/** Focuses `swatch` and presses `key` on it. */
function pressOn(swatch: Element, key: string | string[]): void {
  (swatch as HTMLElement).focus();
  simulateKeyboard(swatch, key);
}

/** The names and details of the events that `emitEvent` sent. */
function emitted(eventSpy: SinonSpy): [string, unknown][] {
  return eventSpy
    .getCalls()
    .map((call) => [call.args[0], call.args[1]?.detail]);
}

function commitText(input: IgcInputComponent, value: string): void {
  input.value = value;
  input.dispatchEvent(
    new CustomEvent('igcChange', {
      detail: value,
      bubbles: true,
      composed: true,
    })
  );
}

function slide(slider: HTMLInputElement, value: string): void {
  simulateInput(slider, { value });
}

function release(slider: HTMLInputElement): void {
  slider.dispatchEvent(new Event('change', { bubbles: true }));
}

/** The marker offsets that put its center on `s`% and `100 - v`% of the canvas. */
function markerOffsets(
  canvas: IgcPickerCanvasComponent,
  s: number,
  v: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const marker = canvas.getMarkerDimensions();

  return {
    x: (s / 100) * rect.width - marker.width,
    y: ((100 - v) / 100) * rect.height - marker.height,
  };
}

describe('Color panel', () => {
  before(() => defineComponents(IgcColorPanelComponent));
  afterEach(() => resetMouse());

  let panel: IgcColorPanelComponent;

  beforeEach(async () => {
    panel = await fixture<IgcColorPanelComponent>(
      html`<igc-color-panel value="#ff0000"></igc-color-panel>`
    );
  });

  describe('Rendering', () => {
    it('is accessible', async () => {
      panel.showAlpha = true;
      panel.swatches = ['#ff0000', '#00ff00'];
      await elementUpdated(panel);

      const options = axeHiddenLabelOptions;

      await expect(panel).shadowDom.to.be.accessible(options);
      await expect(panel).lightDom.to.be.accessible(options);
    });

    it('renders the controls in the base part', async () => {
      const base = getBase(panel);

      for (const part of ['picker-canvas', 'main-row', 'inputs-row']) {
        expect(base.querySelector(`[part="${part}"]`), part).to.exist;
      }

      expect(base.querySelector('[part="alpha-row"]')).to.be.null;
      expect(getSwatchList(panel).hidden).to.be.true;

      panel.showAlpha = true;
      panel.hideFormats = true;
      panel.swatches = ['#ff0000'];
      await elementUpdated(panel);

      expect(base.querySelector('[part="alpha-row"]')).to.exist;
      expect(getSwatchList(panel).hidden).to.be.false;
      expect(getFormatSelect(panel)).to.be.null;
    });

    it('paints its own surface alone in the page', async () => {
      // The border color comes from the theme palette.
      await withDocumentSheets([bootstrap.styleSheet!], () => {
        const style = getComputedStyle(getBase(panel));

        expect(style.borderTopWidth).to.equal('1px');
        expect(style.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
      });
    });

    it('leaves the surface to the popup of the color picker', async () => {
      defineComponents(IgcColorPickerComponent);

      const picker = await fixture<IgcColorPickerComponent>(
        html`<igc-color-picker open></igc-color-picker>`
      );
      const popup = picker.renderRoot.querySelector('[part="picker"]')!;
      const inner = picker.renderRoot.querySelector('igc-color-panel')!;

      await withDocumentSheets([bootstrap.styleSheet!], () => {
        const base = getComputedStyle(getBase(inner));

        expect(getComputedStyle(popup).borderTopWidth).to.equal('1px');
        expect(base.borderTopWidth).to.equal('0px');
        expect(base.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
      });
    });
  });

  describe('Value and format', () => {
    it('parses any CSS color and writes it in the format', async () => {
      panel.value = 'oklch(70% 0.1 200)';
      expect(panel.value).to.equal('#40b1b7');

      panel.format = 'rgb';
      await elementUpdated(panel);

      expect(panel.value).to.equal('rgb(64 177 183)');
      expect(getColorInput(panel).value).to.equal('rgb(64 177 183)');
    });

    it('writes a color and hints the notation in the oklch format', async () => {
      panel.format = 'oklch';
      await elementUpdated(panel);

      expect(panel.value).to.equal('oklch(62.8% 0.25768 29.23)');
      expect(getColorInput(panel).value).to.equal(panel.value);

      panel.value = '';
      await elementUpdated(panel);

      expect(getColorInput(panel).placeholder).to.equal('oklch(l% c h)');
    });

    it('clears for an invalid color and a color that depends on its context', () => {
      for (const value of ['not-a-color', 'currentcolor', 'var(--brand)']) {
        panel.value = '#ff0000';
        panel.value = value;

        expect(panel.value, value).to.equal('');
      }
    });

    it('keeps the hue of a gray for a write of the same color', async () => {
      panel.value = '#808080';
      await elementUpdated(panel);

      slide(getHue(panel), '200');
      await elementUpdated(panel);

      expect(panel.value).to.equal('#808080');

      panel.value = 'rgb(128 128 128)';
      await elementUpdated(panel);

      expect(getHue(panel).value).to.equal('200');
    });

    it('lists the formats with their names from the resource strings', async () => {
      const select = getFormatSelect(panel);

      expect(select.items.map(({ value }) => value)).to.eql([
        'hex',
        'rgb',
        'hsl',
        'oklch',
      ]);
      expect(select.items.map(({ textContent }) => textContent)).to.eql([
        'Hex',
        'RGB',
        'HSL',
        'OKLCH',
      ]);

      panel.resourceStrings = { color_picker_format_oklch: 'Perceptual' };
      await elementUpdated(panel);

      expect(select.items[3].textContent).to.equal('Perceptual');
    });

    it('emits no events for a value from code or a format switch', async () => {
      const eventSpy = spy(panel, 'emitEvent');

      panel.value = '#00ff00';
      panel.format = 'hsl';
      await elementUpdated(panel);

      const select = getFormatSelect(panel);
      simulateClick(select.renderRoot.querySelector('igc-input')!);
      await elementUpdated(select);
      simulateClick(select.items[1]);
      await elementUpdated(panel);

      expect(panel.format).to.equal('rgb');
      expect(panel.value).to.equal('rgb(0 255 0)');
      expect(eventSpy).not.called;
    });
  });

  describe('Events', () => {
    let eventSpy: SinonSpy;

    beforeEach(async () => {
      // Let the marker take its place first.
      await nextFrame();
      eventSpy = spy(panel, 'emitEvent');
    });

    it('emits igcInput while a slider moves and igcChange on its change', async () => {
      const hue = getHue(panel);

      slide(hue, '120');
      slide(hue, '240');
      expect(emitted(eventSpy)).to.eql([
        ['igcInput', '#00ff00'],
        ['igcInput', '#0000ff'],
      ]);

      release(hue);
      release(hue);
      expect(emitted(eventSpy).slice(2)).to.eql([['igcChange', '#0000ff']]);
    });

    it('emits igcInput and igcChange for each key on the canvas', () => {
      simulateKeyboard(getCanvas(panel), arrowDown);

      expect(emitted(eventSpy).map(([name]) => name)).to.eql([
        'igcInput',
        'igcChange',
      ]);
    });

    it('emits igcInput during a drag and one igcChange at its end', async () => {
      const canvas = getCanvas(panel);
      const { x, y } = canvas.getBoundingClientRect();

      // A real mouse, because Firefox refuses pointer capture for a synthetic
      // pointer event.
      await sendMouse({ type: 'move', position: [x + 20, y + 20] });
      await sendMouse({ type: 'down' });
      await sendMouse({ type: 'move', position: [x + 40, y + 30] });
      await sendMouse({ type: 'move', position: [x + 60, y + 40] });

      const inputs = emitted(eventSpy).length;
      expect(inputs).to.be.greaterThan(1);
      expect(eventSpy).not.calledWith('igcChange');

      await sendMouse({ type: 'up' });
      await elementUpdated(panel);

      expect(eventSpy.callCount).to.equal(inputs + 1);
      expect(eventSpy.lastCall).calledWith('igcChange', {
        detail: panel.value,
      });
    });

    it('emits only igcChange for a commit of the color text', async () => {
      commitText(getColorInput(panel), 'blue');
      await elementUpdated(panel);

      expect(emitted(eventSpy)).to.eql([['igcChange', '#0000ff']]);
    });

    it('reverts an invalid color text with no events', async () => {
      const input = getColorInput(panel);

      commitText(input, 'not-a-color');
      await elementUpdated(panel);

      expect(input.value).to.equal('#ff0000');
      expect(panel.value).to.equal('#ff0000');
      expect(eventSpy).not.called;
    });

    it('emits igcInput and igcChange for a swatch', async () => {
      panel.swatches = ['#00ff00'];
      await elementUpdated(panel);

      simulateClick(query<HTMLElement>(panel, '[part="swatch"]'));

      expect(emitted(eventSpy)).to.eql([
        ['igcInput', '#00ff00'],
        ['igcChange', '#00ff00'],
      ]);
    });

    it('emits igcInput while the alpha is typed and igcChange on its commit', async () => {
      panel.showAlpha = true;
      panel.format = 'rgb';
      await elementUpdated(panel);

      const alpha = getAlphaInput(panel);
      const editor = alpha.renderRoot.querySelector('input')!;

      editor.value = '40%';
      simulateInput(editor, {
        skipValueProperty: true,
        inputType: 'insertText',
        bubbles: true,
        composed: true,
      });
      expect(emitted(eventSpy)).to.eql([['igcInput', 'rgb(255 0 0 / 0.4)']]);

      alpha.dispatchEvent(
        new CustomEvent('igcChange', {
          detail: '40%',
          bubbles: true,
          composed: true,
        })
      );
      expect(emitted(eventSpy).slice(1)).to.eql([
        ['igcChange', 'rgb(255 0 0 / 0.4)'],
      ]);
    });

    it('emits igcInput and igcChange for each step of the alpha keys', async () => {
      panel.showAlpha = true;
      panel.value = 'rgb(255 0 0 / 0.5)';
      panel.format = 'rgb';
      await elementUpdated(panel);
      eventSpy.resetHistory();

      simulateKeyboard(getAlphaInput(panel), arrowUp);

      expect(emitted(eventSpy)).to.eql([
        ['igcInput', 'rgb(255 0 0 / 0.51)'],
        ['igcChange', 'rgb(255 0 0 / 0.51)'],
      ]);
    });

    it('emits no igcChange when a change returns to the reported color', () => {
      const hue = getHue(panel);

      slide(hue, '120');
      slide(hue, '0');
      release(hue);

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('takes a value from code as the reported color', () => {
      panel.value = '#00ff00';

      slide(getHue(panel), '120');
      release(getHue(panel));

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('keeps the events of its inner elements inside', async () => {
      const leaked: string[] = [];

      for (const type of [
        'igcInput',
        'igcChange',
        'igcOpening',
        'igcColorPicked',
      ]) {
        panel.addEventListener(type, (event) => {
          if (event.composedPath()[0] !== panel) {
            leaked.push(type);
          }
        });
      }

      const input = getColorInput(panel);
      simulateInput(input.renderRoot.querySelector('input')!, {
        value: 'blue',
      });
      commitText(input, 'blue');
      simulateKeyboard(getCanvas(panel), arrowDown);
      simulateClick(
        getFormatSelect(panel).renderRoot.querySelector('igc-input')!
      );
      await elementUpdated(panel);

      expect(leaked).to.be.empty;
    });
  });

  describe('Eye dropper', () => {
    let original: unknown;

    beforeEach(() => {
      original = (globalThis as any).EyeDropper;
      (globalThis as any).EyeDropper = class {
        public open() {
          return Promise.resolve({ sRGBHex: '#112233' });
        }
      };
    });

    afterEach(() => {
      (globalThis as any).EyeDropper = original;
    });

    it('emits igcInput and igcChange for a pick', async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel></igc-color-panel>`
      );
      const eventSpy = spy(panel, 'emitEvent');

      simulateClick(query<HTMLElement>(panel, '[part="eye-dropper"]'));
      await new Promise((resolve) => setTimeout(resolve));

      expect(emitted(eventSpy)).to.eql([
        ['igcInput', '#112233'],
        ['igcChange', '#112233'],
      ]);
    });
  });

  describe('Marker', () => {
    it('moves the marker to a value from code', async () => {
      panel.value = 'hsl(0 100% 25%)';
      await elementUpdated(panel);
      await nextFrame();

      const canvas = getCanvas(panel);
      const { x, y } = markerOffsets(canvas, 100, 50);

      expect(canvas.x).to.be.closeTo(x, 0.5);
      expect(canvas.y).to.be.closeTo(y, 0.5);
    });

    it('places the marker when a hidden panel shows', async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel
          value="#800000"
          style="display: none"
        ></igc-color-panel>`
      );

      panel.style.display = '';
      // The resize observer reports the new size after the layout.
      await nextFrame();
      await nextFrame();

      const canvas = getCanvas(panel);
      const { x, y } = markerOffsets(canvas, 100, 50);

      expect(canvas.x).to.be.closeTo(x, 0.5);
      expect(canvas.y).to.be.closeTo(y, 0.5);
    });
  });
  describe('Value text', () => {
    beforeEach(async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel
          show-alpha
          value="rgb(0 0 255 / 0.25)"
        ></igc-color-panel>`
      );
      await elementUpdated(getCanvas(panel));
    });

    const markerText = () =>
      getCanvas(panel)
        .renderRoot.querySelector('[part~="marker"]')!
        .getAttribute('aria-valuetext');

    it('gives the hue slider the angle and the name of the hue', async () => {
      expect(getHue(panel).getAttribute('aria-valuetext')).to.equal(
        '240 degrees, blue'
      );

      panel.value = '#ff8000';
      await elementUpdated(panel);

      expect(getHue(panel).getAttribute('aria-valuetext')).to.equal(
        '30 degrees, orange'
      );
    });

    it('gives the alpha slider the alpha percentage', () => {
      expect(getAlphaSlider(panel).getAttribute('aria-valuetext')).to.equal(
        '25%'
      );
    });

    it('adds the color name to the value text of the canvas marker', async () => {
      expect(markerText()).to.equal(
        'Saturation 100%, brightness 100%, vibrant blue'
      );

      panel.value = '#808080';
      await elementUpdated(panel);
      await elementUpdated(getCanvas(panel));

      expect(markerText()).to.equal('Saturation 0%, brightness 50%, gray');
    });

    it('gives an empty value no color name', async () => {
      panel.value = '';
      await elementUpdated(panel);
      await elementUpdated(getCanvas(panel));

      expect(markerText()).to.equal('Saturation 0%, brightness 100%');
      expect(getHue(panel).getAttribute('aria-valuetext')).to.equal(
        '0 degrees, red'
      );
    });

    it('formats the numbers in the locale of the panel', async () => {
      panel.locale = 'de';
      await elementUpdated(panel);

      const angle = new Intl.NumberFormat('de', {
        style: 'unit',
        unit: 'degree',
        unitDisplay: 'long',
      });
      const percent = new Intl.NumberFormat('de', { style: 'percent' });

      expect(getHue(panel).getAttribute('aria-valuetext')).to.equal(
        `${angle.format(240)}, blue`
      );
      expect(getAlphaSlider(panel).getAttribute('aria-valuetext')).to.equal(
        percent.format(0.25)
      );
    });

    it('takes the words and the order from the resource strings', async () => {
      panel.resourceStrings = {
        color_picker_value_with_name: '{1} ({0})',
        color_picker_name_blue: 'Blau',
        color_picker_name_vibrant: 'kräftiges',
      };
      await elementUpdated(panel);
      await elementUpdated(getCanvas(panel));

      expect(getHue(panel).getAttribute('aria-valuetext')).to.equal(
        'Blau (240 degrees)'
      );
      expect(markerText()).to.equal(
        'kräftiges Blau (Saturation 100%, brightness 100%)'
      );
    });
  });

  describe('Copy', () => {
    let clock: SinonFakeTimers | undefined;

    beforeEach(async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel value="#ff0000"></igc-color-panel>`
      );
    });

    afterEach(() => {
      clock?.restore();
      clock = undefined;
    });

    /** The icon and the name of the copy button. */
    function copyButton(): [string, string] {
      const button = getCopy(panel);
      return [button.name ?? '', button.textContent!.trim()];
    }

    const idle: [string, string] = [
      'copy_content',
      'Copy color value to clipboard',
    ];

    async function copy(): Promise<void> {
      simulateClick(getCopy(panel));
      // The result shows after the clipboard promise settles.
      await nextFrame();
      await elementUpdated(panel);
    }

    async function tick(ms: number): Promise<void> {
      clock!.tick(ms);
      await elementUpdated(panel);
    }

    it('shows the success icon and "Copied" for a second after a copy', async () => {
      const writeText = stub(navigator.clipboard, 'writeText').resolves();
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      try {
        expect(copyButton()).to.eql(idle);

        simulateClick(getCopy(panel));
        await writeText.firstCall.returnValue;
        await elementUpdated(panel);

        expect(writeText).calledOnceWith('#ff0000');
        expect(copyButton()).to.eql(['copy_success', 'Copied']);

        await tick(999);
        expect(copyButton()).to.eql(['copy_success', 'Copied']);

        await tick(1);
        expect(copyButton()).to.eql(idle);
      } finally {
        writeText.restore();
      }
    });

    it('shows the error icon and "Copy failed" after a failed copy', async () => {
      const writeText = stub(navigator.clipboard, 'writeText').rejects(
        new DOMException('Denied', 'NotAllowedError')
      );

      try {
        await copy();
        expect(copyButton()).to.eql(['error', 'Copy failed']);
        await expect(panel).shadowDom.to.be.accessible(axeHiddenLabelOptions);
        await expect(panel).lightDom.to.be.accessible(axeHiddenLabelOptions);
      } finally {
        writeText.restore();
      }
    });

    it('shows "Copy failed" without a clipboard', async () => {
      const clipboard = stub(navigator, 'clipboard').value(undefined);

      try {
        await copy();
        expect(copyButton()).to.eql(['error', 'Copy failed']);
      } finally {
        clipboard.restore();
      }
    });

    it('shows the copy icon again one second after the latest copy', async () => {
      const writeText = stub(navigator.clipboard, 'writeText').resolves();
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      try {
        simulateClick(getCopy(panel));
        await writeText.firstCall.returnValue;
        await tick(600);

        simulateClick(getCopy(panel));
        await writeText.secondCall.returnValue;
        await tick(600);
        expect(copyButton()).to.eql(['copy_success', 'Copied']);

        await tick(400);
        expect(copyButton()).to.eql(idle);
      } finally {
        writeText.restore();
      }
    });

    it('shows only the result of the latest copy', async () => {
      const first = Promise.withResolvers<void>();
      const writeText = stub(navigator.clipboard, 'writeText');
      writeText.onFirstCall().returns(first.promise);
      writeText.onSecondCall().resolves();

      try {
        simulateClick(getCopy(panel));
        await copy();
        expect(copyButton()).to.eql(['copy_success', 'Copied']);
        await expect(panel).shadowDom.to.be.accessible(axeHiddenLabelOptions);
        await expect(panel).lightDom.to.be.accessible(axeHiddenLabelOptions);

        // The first copy fails after the second one ends.
        first.reject(new DOMException('Denied', 'NotAllowedError'));
        await nextFrame();
        await elementUpdated(panel);

        expect(copyButton()).to.eql(['copy_success', 'Copied']);
      } finally {
        writeText.restore();
      }
    });

    it('shows nothing for a copy that ends after a disconnect', async () => {
      const pending = Promise.withResolvers<void>();
      const writeText = stub(navigator.clipboard, 'writeText').returns(
        pending.promise
      );

      try {
        simulateClick(getCopy(panel));
        const parent = panel.parentElement!;

        panel.remove();
        parent.append(panel);
        pending.resolve();
        await nextFrame();
        await elementUpdated(panel);

        expect(copyButton()).to.eql(idle);
      } finally {
        writeText.restore();
      }
    });

    it('shows the copy icon again when the panel disconnects', async () => {
      const writeText = stub(navigator.clipboard, 'writeText').resolves();

      try {
        await copy();
        const parent = panel.parentElement!;

        panel.remove();
        parent.append(panel);
        await elementUpdated(panel);

        expect(copyButton()).to.eql(idle);
      } finally {
        writeText.restore();
      }
    });
  });

  describe('Swatches', () => {
    let children: IgcColorSwatchComponent[];
    let group: IgcColorSwatchGroupComponent;

    beforeEach(async () => {
      panel = await fixture<IgcColorPanelComponent>(html`
        <igc-color-panel value="#ff0000" style="--brand: #123456">
          <igc-color-swatch></igc-color-swatch>
          <igc-color-swatch color="#00ff00" label="Green"></igc-color-swatch>
          <igc-color-swatch-group>
            <span slot="label">Brand</span>
            <igc-color-swatch color="var(--brand)"></igc-color-swatch>
            <igc-color-swatch color="#ff000080"></igc-color-swatch>
          </igc-color-swatch-group>
        </igc-color-panel>
      `);
      children = Array.from(panel.querySelectorAll('igc-color-swatch'));
      group = panel.querySelector('igc-color-swatch-group')!;
      await swatchesSettled(panel);
    });

    it('is accessible', async () => {
      panel.swatches = ['#ff0000', '#0000ff'];
      await swatchesSettled(panel);

      const options = axeHiddenLabelOptions;

      await expect(panel).shadowDom.to.be.accessible(options);
      await expect(panel).lightDom.to.be.accessible(options);
    });

    it('shows the swatch children in a named listbox', () => {
      const list = getSwatchList(panel);

      expect(list.hidden).to.be.false;
      expect(list.role).to.equal('listbox');
      expect(list.ariaLabel).to.equal('Color swatches');
      expect(children.map((swatch) => swatch.role)).to.eql([
        'option',
        'option',
        'option',
        'option',
      ]);
    });

    it('renders the swatches property in front of the children', async () => {
      panel.swatches = ['#0000ff', ''];
      await swatchesSettled(panel);

      const own = getOwnSwatches(panel);

      expect(own.map((swatch) => swatch.color)).to.eql(['#0000ff', '']);
      expect(nameOf(own[0])).to.equal('vibrant blue');
      // An empty string gives the no-color swatch.
      expect(nameOf(own[1])).to.equal('No color');

      own[0].focus();
      simulateKeyboard(own[0], endKey);
      expect(getDeepActiveElement()).to.equal(children.at(-1));

      simulateKeyboard(children.at(-1)!, homeKey);
      expect(getDeepActiveElement()).to.equal(own[0]);
    });

    it('names a swatch by its label, else its color name, else "No color"', () => {
      // `var(--brand)` is #123456. The alpha of #ff000080 is 50%.
      expect(children.map(nameOf)).to.eql([
        'No color',
        'Green',
        'dark blue',
        'vibrant red, alpha 50%',
      ]);
    });

    it('names a swatch with the words and the locale of the panel', async () => {
      panel.locale = 'fr';
      panel.resourceStrings = {
        color_picker_name_pattern: '{2} {0} {1}',
        color_picker_name_red: 'rouge',
        color_picker_name_vibrant: 'vif',
      };
      await swatchesSettled(panel);
      await elementUpdated(children[3]);

      const percent = new Intl.NumberFormat('fr', { style: 'percent' });

      expect(nameOf(children[3])).to.equal(
        `rouge vif, alpha ${percent.format(0.5)}`
      );
    });

    it('names a swatch by its color string while the color is invalid', async () => {
      children[3].color = 'not-a-color';
      await swatchesSettled(panel);

      expect(nameOf(children[3])).to.equal('not-a-color');
    });

    it('renames a swatch when its color changes', async () => {
      children[3].color = '#00ffff';
      await elementUpdated(children[3]);

      expect(nameOf(children[3])).to.equal('vibrant cyan');
    });

    it('names the no-color swatch with the resource strings of the panel', async () => {
      panel.resourceStrings = { color_picker_no_color: 'Sans couleur' };
      await swatchesSettled(panel);
      await elementUpdated(children[0]);

      expect(nameOf(children[0])).to.equal('Sans couleur');
    });

    it('names a group by its label', () => {
      const internals = internalsOf(group);

      expect(internals?.getARIA('role')).to.equal('group');
      expect(internals?.getARIA('ariaLabel')).to.equal('Brand');
      expect(group.renderRoot.querySelector('[part="label"]')).to.exist;
    });

    it('selects the swatch that has the color of the value, alpha included', async () => {
      expect(children.map(isSelected)).to.eql([false, false, false, false]);

      panel.value = 'rgb(255 0 0 / 0.5)';
      await swatchesSettled(panel);
      expect(children.map(isSelected)).to.eql([false, false, false, true]);

      panel.value = 'lime';
      await swatchesSettled(panel);
      expect(children.map(isSelected)).to.eql([false, true, false, false]);
    });

    it('marks a selected swatch of the swatches property with a part', async () => {
      panel.swatches = ['#ff0000', '#0000ff'];
      await swatchesSettled(panel);

      const own = getOwnSwatches(panel);

      expect(own.map((swatch) => swatch.part.value)).to.eql([
        'swatch selected',
        'swatch',
      ]);
      // A child is not a part of the panel.
      expect(children[1].hasAttribute('part')).to.be.false;
    });

    it('selects only the first swatch that has the color of the value', async () => {
      children[3].color = 'lime';
      panel.value = '#00ff00';
      await elementUpdated(children[3]);
      await swatchesSettled(panel);

      expect(children[3][swatchKey]).to.equal(children[1][swatchKey]);
      expect(children.map(isSelected)).to.eql([false, true, false, false]);
      expect(children[1].tabIndex).to.equal(0);
    });

    it('selects the no-color swatch while the value is empty', async () => {
      panel.value = '';
      await swatchesSettled(panel);

      expect(isSelected(children[0])).to.be.true;
    });

    it('resolves a var() swatch from its context', async () => {
      panel.value = '#123456';
      await swatchesSettled(panel);
      expect(isSelected(children[2])).to.be.true;

      panel.format = 'rgb';
      panel.value = '';
      await swatchesSettled(panel);

      const eventSpy = spy(panel, 'emitEvent');
      simulateClick(children[2]);

      expect(panel.value).to.equal('rgb(18 52 86)');
      expect(emitted(eventSpy)).to.eql([
        ['igcInput', 'rgb(18 52 86)'],
        ['igcChange', 'rgb(18 52 86)'],
      ]);
    });

    it('resolves a var() swatch again when the panel shows', async () => {
      panel.style.display = 'none';
      panel.style.setProperty('--brand', '#abcdef');
      await nextFrame();

      panel.style.display = '';
      // The resize observer reports the new size after the layout.
      await nextFrame();
      await swatchesSettled(panel);

      panel.value = '#abcdef';
      await swatchesSettled(panel);

      expect(isSelected(children[2])).to.be.true;
    });

    it('emits igcInput and igcChange for a pick of a child swatch', () => {
      const eventSpy = spy(panel, 'emitEvent');
      simulateClick(children[1]);

      expect(panel.value).to.equal('#00ff00');
      expect(emitted(eventSpy)).to.eql([
        ['igcInput', '#00ff00'],
        ['igcChange', '#00ff00'],
      ]);
    });

    it('clears the value with a pick of the no-color swatch', () => {
      const eventSpy = spy(panel, 'emitEvent');
      simulateClick(children[0]);

      expect(panel.value).to.equal('');
      expect(emitted(eventSpy)).to.eql([
        ['igcInput', ''],
        ['igcChange', ''],
      ]);
    });

    it('ignores a pick of a swatch with an invalid color', async () => {
      children[1].color = 'not-a-color';
      // An undefined variable, and a variable that is not a color.
      children[2].color = 'var(--undefined)';
      children[3].color = 'var(--not-a-color)';
      panel.style.setProperty('--not-a-color', '12px');
      await swatchesSettled(panel);

      const eventSpy = spy(panel, 'emitEvent');

      for (const swatch of children.slice(1)) {
        simulateClick(swatch);
      }

      expect(panel.value).to.equal('#ff0000');
      expect(eventSpy).not.called;
    });

    it('follows swatch children that the app adds and removes', async () => {
      const swatch = document.createElement('igc-color-swatch');
      swatch.color = '#ff0000';
      group.append(swatch);
      await swatchesSettled(panel);

      expect(isSelected(swatch)).to.be.true;
      expect(swatch.tabIndex).to.equal(0);

      swatch.remove();
      await swatchesSettled(panel);

      expect(children[0].tabIndex).to.equal(0);
    });

    it('hides the list without swatches', async () => {
      panel.replaceChildren();
      await swatchesSettled(panel);

      expect(getSwatchList(panel).hidden).to.be.true;
    });
  });

  describe('Swatch keyboard', () => {
    let swatches: IgcColorSwatchComponent[];

    beforeEach(async () => {
      // Ten swatches in rows of eight.
      panel.swatches = [
        '#000000',
        '#111111',
        '#222222',
        '#333333',
        '#444444',
        '#555555',
        '#666666',
        '#777777',
        '#888888',
        '#999999',
      ];
      await swatchesSettled(panel);
      swatches = getOwnSwatches(panel);
    });

    it('has one tab stop: the selected swatch, else the first one', async () => {
      expect(swatches.map((swatch) => swatch.tabIndex)).to.eql([
        0, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      ]);

      panel.value = '#333333';
      await swatchesSettled(panel);

      expect(swatches.findIndex((swatch) => swatch.tabIndex === 0)).to.equal(3);
    });

    it('moves the focus with the arrow keys in reading order', () => {
      pressOn(swatches[0], arrowRight);
      expect(getDeepActiveElement()).to.equal(swatches[1]);
      expect(swatches[1].tabIndex).to.equal(0);
      expect(swatches[0].tabIndex).to.equal(-1);

      pressOn(swatches[1], arrowLeft);
      expect(getDeepActiveElement()).to.equal(swatches[0]);

      // The ends wrap.
      pressOn(swatches[0], arrowLeft);
      expect(getDeepActiveElement()).to.equal(swatches[9]);
    });

    it('swaps the left and right arrows in a right-to-left layout', async () => {
      panel.dir = 'rtl';
      await elementUpdated(panel);

      pressOn(swatches[1], arrowRight);
      expect(getDeepActiveElement()).to.equal(swatches[0]);
    });

    it('moves the focus to the next and previous row', () => {
      pressOn(swatches[1], arrowDown);
      expect(getDeepActiveElement()).to.equal(swatches[9]);

      pressOn(swatches[9], arrowUp);
      expect(getDeepActiveElement()).to.equal(swatches[1]);

      // No row above the first one.
      pressOn(swatches[1], arrowUp);
      expect(getDeepActiveElement()).to.equal(swatches[1]);
    });

    it('moves to the nearest swatch of a shorter next row', () => {
      pressOn(swatches[7], arrowDown);
      expect(getDeepActiveElement()).to.equal(swatches[9]);
    });

    it('moves the focus to the first and last swatch', () => {
      pressOn(swatches[4], endKey);
      expect(getDeepActiveElement()).to.equal(swatches[9]);

      pressOn(swatches[9], homeKey);
      expect(getDeepActiveElement()).to.equal(swatches[0]);
    });

    it('picks the focused swatch with Enter and Space, as one change', () => {
      const eventSpy = spy(panel, 'emitEvent');

      pressOn(swatches[2], enterKey);
      expect(panel.value).to.equal('#222222');

      pressOn(swatches[3], spaceBar);
      expect(panel.value).to.equal('#333333');

      expect(emitted(eventSpy)).to.eql([
        ['igcInput', '#222222'],
        ['igcChange', '#222222'],
        ['igcInput', '#333333'],
        ['igcChange', '#333333'],
      ]);
    });

    it('does not pick a swatch with the arrow keys', () => {
      const eventSpy = spy(panel, 'emitEvent');

      pressOn(swatches[0], arrowRight);
      pressOn(swatches[1], arrowDown);

      expect(panel.value).to.equal('#ff0000');
      expect(eventSpy).not.called;
    });

    it('moves the tab stop to a clicked swatch', () => {
      simulateClick(swatches[5]);
      swatches[5].focus();

      expect(swatches[5].tabIndex).to.equal(0);
      expect(swatches[0].tabIndex).to.equal(-1);
    });
  });

  describe('Views', () => {
    beforeEach(async () => {
      panel.swatches = ['#00ff00'];
      await swatchesSettled(panel);
    });

    it('shows the gradient view with the swatch list below it by default', () => {
      expect(panel.activeView).to.equal('gradient');
      expect(query(panel, '[part="view-switcher"]')).to.be.null;
      expect(getCanvas(panel)).to.exist;
      expect(getSwatchList(panel).hidden).to.be.false;
      expect(query(panel, 'igc-divider')).to.exist;
    });

    it('is accessible with both views', async () => {
      // The switcher buttons become radios when the group context arrives.
      const settled = async () => {
        await elementUpdated(panel);
        await nextFrame();
      };
      const options = axeHiddenLabelOptions;

      panel.views = 'gradient swatches';
      await settled();
      await expect(panel).shadowDom.to.be.accessible(options);
      await expect(panel).lightDom.to.be.accessible(options);

      panel.activeView = 'swatches';
      await settled();
      await expect(panel).shadowDom.to.be.accessible(options);
      await expect(panel).lightDom.to.be.accessible(options);
    });

    it('shows a view switcher for both views', async () => {
      panel.views = 'gradient swatches';
      await elementUpdated(panel);

      expect(getViewButtons(panel).map((button) => button.part.value)).to.eql([
        'view-button active',
        'view-button',
      ]);
      expect(
        getViewButtons(panel).map((button) => button.textContent?.trim())
      ).to.eql(['Gradient', 'Swatches']);
      // The swatch list is in the swatch view only.
      expect(getCanvas(panel)).to.exist;
      expect(getSwatchList(panel).hidden).to.be.true;
    });

    it('shows only the swatch list in the swatch view', async () => {
      panel.views = 'gradient swatches';
      panel.activeView = 'swatches';
      await elementUpdated(panel);

      expect(getCanvas(panel)).to.be.null;
      expect(query(panel, '[part="inputs-row"]')).to.be.null;
      expect(query(panel, 'igc-divider')).to.be.null;
      expect(getSwatchList(panel).hidden).to.be.false;
      expect(getViewButtons(panel).map((button) => button.part.value)).to.eql([
        'view-button',
        'view-button active',
      ]);
    });

    it('switches the view on a click of the switcher, with no events', async () => {
      panel.views = 'gradient swatches';
      await elementUpdated(panel);

      const eventSpy = spy(panel, 'emitEvent');
      simulateClick(getViewButtons(panel)[1]);
      await elementUpdated(panel);

      expect(panel.activeView).to.equal('swatches');
      expect(getCanvas(panel)).to.be.null;
      expect(eventSpy).not.called;
    });

    it('places the marker when the gradient view shows again', async () => {
      panel.views = 'gradient swatches';
      panel.activeView = 'swatches';
      panel.value = '#800000';
      await elementUpdated(panel);

      panel.activeView = 'gradient';
      await elementUpdated(panel);
      await nextFrame();

      const canvas = getCanvas(panel);
      const { x, y } = markerOffsets(canvas, 100, 50);

      expect(canvas.x).to.be.closeTo(x, 0.5);
      expect(canvas.y).to.be.closeTo(y, 0.5);
    });

    it('shows the first view of views for a view that it does not have', async () => {
      panel.views = 'swatches';
      await elementUpdated(panel);

      expect(panel.activeView).to.equal('swatches');
      expect(query(panel, '[part="view-switcher"]')).to.be.null;
      expect(getSwatchList(panel).hidden).to.be.false;
    });

    it('ignores unknown view tokens', async () => {
      panel.views = 'palette  wheel';
      await elementUpdated(panel);

      expect(panel.activeView).to.equal('gradient');
      expect(getCanvas(panel)).to.exist;

      panel.views = 'swatches gradient swatches';
      await elementUpdated(panel);

      expect(
        getViewButtons(panel).map((button) => button.getAttribute('value'))
      ).to.eql(['gradient', 'swatches']);
    });
  });

  describe('Contrast', () => {
    beforeEach(async () => {
      panel.value = '#767676';
      panel.contrastAgainst = '#ffffff';
      await elementUpdated(panel);
    });

    it('is accessible', async () => {
      await expect(panel).shadowDom.to.be.accessible(axeHiddenLabelOptions);
      await expect(panel).lightDom.to.be.accessible(axeHiddenLabelOptions);
    });

    it('hides the readout without a color to compare with', async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel value="#767676"></igc-color-panel>`
      );

      expect(panel.contrastAgainst).to.equal('');
      expect(readout(panel)).to.be.null;
    });

    it('shows the ratio and the AA and AAA levels for normal text', async () => {
      expect(readout(panel)).to.eql({
        ratio: 'Contrast 4.54:1',
        marks: [
          ['contrast-mark pass', 'AA pass'],
          ['contrast-mark fail', 'AAA fail'],
        ],
      });

      panel.value = '#000000';
      await elementUpdated(panel);

      expect(readout(panel)).to.eql({
        ratio: 'Contrast 21:1',
        marks: [
          ['contrast-mark pass', 'AA pass'],
          ['contrast-mark pass', 'AAA pass'],
        ],
      });
    });

    it('takes the attribute', async () => {
      panel = await fixture<IgcColorPanelComponent>(
        html`<igc-color-panel
          value="#777777"
          contrast-against="white"
        ></igc-color-panel>`
      );

      expect(readout(panel)?.ratio).to.equal('Contrast 4.47:1');
      expect(readout(panel)?.marks[0]).to.eql([
        'contrast-mark fail',
        'AA fail',
      ]);
    });

    it('follows the color that the user picks', async () => {
      commitText(getColorInput(panel), '#595959');
      await elementUpdated(panel);

      expect(readout(panel)?.marks).to.eql([
        ['contrast-mark pass', 'AA pass'],
        ['contrast-mark pass', 'AAA pass'],
      ]);
    });

    it('puts the value over the color and the color over white, with their alpha', async () => {
      panel.value = 'rgb(0 0 0 / 0.5)';
      await elementUpdated(panel);

      expect(readout(panel)?.ratio).to.equal('Contrast 3.97:1');

      panel.value = '#ffffff';
      panel.contrastAgainst = 'rgb(0 0 0 / 0.5)';
      await elementUpdated(panel);

      expect(readout(panel)?.ratio).to.equal('Contrast 3.97:1');
    });

    it('hides the readout for an empty value', async () => {
      panel.value = '';
      await elementUpdated(panel);

      expect(readout(panel)).to.be.null;
    });

    it('hides the readout for an invalid color and a var() that is not a color', async () => {
      panel.style.setProperty('--not-a-color', '12px');

      for (const color of [
        'nope',
        'var(--undefined)',
        'var(--not-a-color)',
        '',
      ]) {
        panel.contrastAgainst = color;
        await elementUpdated(panel);

        expect(readout(panel), color).to.be.null;
      }
    });

    it('resolves a color that depends on its context from the panel', async () => {
      panel.value = '#ffffff';
      panel.style.color = '#000000';
      panel.style.setProperty('--surface', 'light-dark(#000000, #ffffff)');

      for (const color of [
        'currentcolor',
        'light-dark(#000000, #ffffff)',
        'var(--surface)',
      ]) {
        panel.contrastAgainst = color;
        await elementUpdated(panel);

        expect(readout(panel)?.ratio, color).to.equal('Contrast 21:1');
      }
    });

    it('resolves var() from the custom properties of the panel', async () => {
      panel.style.setProperty('--surface', '#000000');
      panel.value = '#ffffff';
      panel.contrastAgainst = 'color-mix(in srgb, var(--surface) 100%, white)';
      await elementUpdated(panel);

      expect(readout(panel)?.ratio).to.equal('Contrast 21:1');
      expect(panel.style.getPropertyValue('--_context-color')).to.equal('');
      expect(panel.style.outlineColor).to.equal('');
    });

    it('resolves var() again when the panel shows', async () => {
      panel.style.setProperty('--surface', '#ffffff');
      panel.contrastAgainst = 'var(--surface)';
      await elementUpdated(panel);

      panel.style.display = 'none';
      panel.style.setProperty('--surface', '#000000');
      await nextFrame();

      panel.style.display = '';
      // The resize observer reports the new size after the layout.
      await nextFrame();
      await elementUpdated(panel);

      expect(readout(panel)?.ratio).to.equal('Contrast 4.62:1');
    });

    it('resolves var() again when the theme changes', async () => {
      panel.style.setProperty('--surface', '#ffffff');
      panel.contrastAgainst = 'var(--surface)';
      await elementUpdated(panel);

      panel.style.setProperty('--surface', '#000000');
      await elementUpdated(panel);
      expect(readout(panel)?.ratio).to.equal('Contrast 4.54:1');

      try {
        configureTheme('material');
        await elementUpdated(panel);

        expect(readout(panel)?.ratio).to.equal('Contrast 4.62:1');
      } finally {
        configureTheme('bootstrap');
      }
    });

    it('shows the readout at the end of the panel in both views', async () => {
      panel.swatches = ['#00ff00'];
      panel.views = 'gradient swatches';
      await elementUpdated(panel);

      expect(getBase(panel).lastElementChild).to.equal(getContrast(panel));

      panel.activeView = 'swatches';
      await elementUpdated(panel);

      expect(getBase(panel).lastElementChild).to.equal(getContrast(panel));
      expect(readout(panel)?.ratio).to.equal('Contrast 4.54:1');
    });

    it('takes the text from the resource strings and the number format from the locale', async () => {
      panel.locale = 'de';
      panel.resourceStrings = {
        color_picker_contrast_ratio: 'Kontrast {0}:1',
        color_picker_contrast_pass: '{0} bestanden',
        color_picker_contrast_fail: '{0} nicht bestanden',
        color_picker_contrast_aa: 'Stufe AA',
      };
      await elementUpdated(panel);

      expect(readout(panel)).to.eql({
        ratio: 'Kontrast 4,54:1',
        marks: [
          ['contrast-mark pass', 'Stufe AA bestanden'],
          ['contrast-mark fail', 'AAA nicht bestanden'],
        ],
      });
    });
  });
});
