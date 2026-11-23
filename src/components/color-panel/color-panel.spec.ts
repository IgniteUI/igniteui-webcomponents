import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { type SinonSpy, spy } from 'sinon';

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
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
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
      expect(nameOf(own[0])).to.equal('#0000ff');
      // An empty string gives the no-color swatch.
      expect(nameOf(own[1])).to.equal('No color');

      own[0].focus();
      simulateKeyboard(own[0], endKey);
      expect(getDeepActiveElement()).to.equal(children.at(-1));

      simulateKeyboard(children.at(-1)!, homeKey);
      expect(getDeepActiveElement()).to.equal(own[0]);
    });

    it('names a swatch by its label, else its color, else "No color"', () => {
      expect(children.map(nameOf)).to.eql([
        'No color',
        'Green',
        'var(--brand)',
        '#ff000080',
      ]);
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

      panel.activeView = 'swatches';
      await settled();
      await expect(panel).shadowDom.to.be.accessible(options);
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
});
