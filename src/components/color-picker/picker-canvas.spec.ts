import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '#internals/testing/simulate.spec.js';
import IgcPickerCanvasComponent from './picker-canvas.js';

async function createCanvas() {
  return await fixture<IgcPickerCanvasComponent>(
    html`<igc-picker-canvas
      style="width: 300px; height: 200px;"
    ></igc-picker-canvas>`
  );
}

function getMarker(canvas: IgcPickerCanvasComponent): HTMLDivElement {
  return canvas.renderRoot.querySelector('[part~="marker"]')!;
}

describe('Picker canvas', () => {
  before(() => defineComponents(IgcPickerCanvasComponent));

  let canvas: IgcPickerCanvasComponent;

  beforeEach(async () => {
    canvas = await createCanvas();
  });

  describe('Rendering', () => {
    it('renders a focusable marker', () => {
      const marker = getMarker(canvas);
      expect(marker).to.exist;
      expect(marker.getAttribute('tabindex')).to.equal('0');
    });

    it('exposes the marker as a labelled slider', () => {
      const marker = getMarker(canvas);

      expect(marker.getAttribute('role')).to.equal('slider');
      expect(marker.getAttribute('aria-label')).to.equal(
        'Saturation and value'
      );
      expect(marker.getAttribute('aria-valuemin')).to.equal('0');
      expect(marker.getAttribute('aria-valuemax')).to.equal('100');
    });

    it('announces both axes through `aria-valuetext`', async () => {
      canvas.saturation = 62.4;
      canvas.brightness = 37.8;
      await elementUpdated(canvas);

      const marker = getMarker(canvas);

      // Vertical movement does not change `aria-valuenow`, so the value axis
      // would otherwise be announced as "no change".
      expect(marker.getAttribute('aria-valuenow')).to.equal('62');
      expect(marker.getAttribute('aria-valuetext')).to.equal(
        'Saturation 62%, brightness 38%'
      );
    });

    it('formats `aria-valuetext` with `markerValueFormat`', async () => {
      canvas.saturation = 62.4;
      canvas.brightness = 37.8;
      canvas.markerValueFormat = 'Sättigung {0} %, Helligkeit {1} %';
      await elementUpdated(canvas);

      expect(getMarker(canvas).getAttribute('aria-valuetext')).to.equal(
        'Sättigung 62 %, Helligkeit 38 %'
      );
    });

    it('allows overriding the marker label', async () => {
      canvas.markerLabel = 'Saturation et valeur';
      await elementUpdated(canvas);

      expect(getMarker(canvas).getAttribute('aria-label')).to.equal(
        'Saturation et valeur'
      );
    });

    it('`getMarkerDimensions()` returns half the marker size', () => {
      const rect = getMarker(canvas).getBoundingClientRect();
      const dimensions = canvas.getMarkerDimensions();

      expect(dimensions.width).to.equal(rect.width / 2);
      expect(dimensions.height).to.equal(rect.height / 2);
    });

    it('`getMarkerDimensions()` returns zero before the marker renders', () => {
      const detached = document.createElement(IgcPickerCanvasComponent.tagName);

      expect(detached.getMarkerDimensions()).to.eql({ width: 0, height: 0 });
    });

    it('reflects `x`/`y` into the marker position', async () => {
      canvas.x = 40;
      canvas.y = 20;
      await elementUpdated(canvas);

      const marker = getMarker(canvas);
      expect(marker.style.left).to.equal('40px');
      expect(marker.style.top).to.equal('20px');
    });

    it('sets the host color from `currentColor`', async () => {
      canvas.currentColor = 'red';
      await elementUpdated(canvas);

      expect(canvas.style.color).to.equal('red');
    });

    it('fills the marker with `markerColor`', async () => {
      canvas.markerColor = 'rgb(12, 34, 56)';
      await elementUpdated(canvas);

      expect(canvas.style.getPropertyValue('--_marker-fill')).to.equal(
        'rgb(12, 34, 56)'
      );
      expect(getComputedStyle(getMarker(canvas)).backgroundColor).to.equal(
        'rgb(12, 34, 56)'
      );
    });

    it('leaves the marker unfilled with no `markerColor`', () => {
      expect(getComputedStyle(getMarker(canvas)).backgroundColor).to.equal(
        'rgba(0, 0, 0, 0)'
      );
    });
  });

  describe('Keyboard interaction', () => {
    it('moves the marker with arrow keys and emits `igcColorPicked`', async () => {
      const { width, height } = canvas.getMarkerDimensions();
      const rect = canvas.getBoundingClientRect();

      // The marker center at 0%, 0%.
      canvas.x = -width;
      canvas.y = -height;
      await elementUpdated(canvas);

      const eventSpy = spy(canvas, 'emitEvent');

      simulateKeyboard(canvas, arrowRight);
      expect(canvas.x).to.be.closeTo(rect.width / 100 - width, 1e-9);
      expect(eventSpy).calledOnce;

      simulateKeyboard(canvas, arrowDown);
      expect(canvas.y).to.be.closeTo(rect.height / 100 - height, 1e-9);

      simulateKeyboard(canvas, arrowLeft);
      expect(canvas.x).to.equal(-width);

      simulateKeyboard(canvas, arrowUp);
      expect(canvas.y).to.equal(-height);

      expect(eventSpy.callCount).to.equal(4);
    });

    it('emits whole percentages of the canvas size', async () => {
      const { width, height } = canvas.getMarkerDimensions();

      // The marker center at 0%, 0%.
      canvas.x = -width;
      canvas.y = -height;
      await elementUpdated(canvas);

      const eventSpy = spy(canvas, 'emitEvent');

      simulateKeyboard(canvas, arrowRight);

      expect(eventSpy).calledWith('igcColorPicked', {
        detail: { x: 1, y: 0 },
        bubbles: false,
      });
    });

    it('clamps at the boundaries and stops emitting', async () => {
      const { width, height } = canvas.getMarkerDimensions();
      canvas.x = -width;
      canvas.y = -height;
      await elementUpdated(canvas);

      const eventSpy = spy(canvas, 'emitEvent');
      simulateKeyboard(canvas, arrowLeft);
      simulateKeyboard(canvas, arrowUp);

      expect(canvas.x).to.equal(-width);
      expect(canvas.y).to.equal(-height);
      expect(eventSpy).not.called;
    });

    describe('Steps in percent', () => {
      /** Puts the marker center at `x`% and `y`% of the canvas. */
      async function placeMarker(x: number, y: number): Promise<void> {
        const rect = canvas.getBoundingClientRect();
        const { width, height } = canvas.getMarkerDimensions();

        canvas.x = (x / 100) * rect.width - width;
        canvas.y = (y / 100) * rect.height - height;
        await elementUpdated(canvas);
      }

      /** Presses `key` and returns the detail of the `igcColorPicked` it emits. */
      function press(key: string | string[]): unknown {
        const eventSpy = spy(canvas, 'emitEvent');

        try {
          simulateKeyboard(canvas, key);
          return eventSpy.lastCall?.args[1]?.detail;
        } finally {
          eventSpy.restore();
        }
      }

      it('steps 1% of an axis with an arrow key', async () => {
        await placeMarker(50, 50);

        expect(press(arrowRight)).to.deep.equal({ x: 51, y: 50 });
        expect(press(arrowDown)).to.deep.equal({ x: 51, y: 51 });
        expect(press(arrowLeft)).to.deep.equal({ x: 50, y: 51 });
        expect(press(arrowUp)).to.deep.equal({ x: 50, y: 50 });
      });

      it('steps 10% with Shift + Arrow, Page Up, Page Down, Home and End', async () => {
        await placeMarker(50, 50);

        const steps: [string | string[], { x: number; y: number }][] = [
          [[shiftKey, arrowRight], { x: 60, y: 50 }],
          [[shiftKey, arrowDown], { x: 60, y: 60 }],
          [[shiftKey, arrowLeft], { x: 50, y: 60 }],
          [[shiftKey, arrowUp], { x: 50, y: 50 }],
          [pageDownKey, { x: 50, y: 60 }],
          [pageUpKey, { x: 50, y: 50 }],
          [endKey, { x: 60, y: 50 }],
          [homeKey, { x: 50, y: 50 }],
        ];

        for (const [key, detail] of steps) {
          expect(press(key), String(key)).to.deep.equal(detail);
        }
      });

      it('moves the same percentage at another canvas size', async () => {
        canvas.style.width = '150px';
        await placeMarker(20, 20);

        const rect = canvas.getBoundingClientRect();
        const { width, height } = canvas.getMarkerDimensions();

        expect(rect.width).to.equal(150);

        expect(press([shiftKey, arrowRight])).to.deep.equal({ x: 30, y: 20 });
        expect(canvas.x + width).to.be.closeTo(0.3 * rect.width, 1e-9);

        expect(press(arrowDown)).to.deep.equal({ x: 30, y: 21 });
        expect(canvas.y + height).to.be.closeTo(0.21 * rect.height, 1e-9);
      });

      it('snaps only the axis that moves to a whole percent', async () => {
        await placeMarker(40.4, 50);
        const x = canvas.x;

        expect(press(arrowDown)).to.deep.equal({ x: 40, y: 51 });
        expect(canvas.x).to.equal(x);
      });

      it('stops at the edges of the canvas', async () => {
        await placeMarker(95, 98);

        expect(press(endKey)).to.deep.equal({ x: 100, y: 98 });
        expect(press(pageDownKey)).to.deep.equal({ x: 100, y: 100 });
        expect(press(arrowRight)).to.be.undefined;
        expect(press(arrowDown)).to.be.undefined;
      });

      it('moves the marker in the direction of the arrow in RTL', async () => {
        canvas.dir = 'rtl';
        await placeMarker(50, 50);

        expect(press(arrowRight)).to.deep.equal({ x: 51, y: 50 });
        expect(press(homeKey)).to.deep.equal({ x: 41, y: 50 });
      });

      it('does nothing while the canvas has no size', async () => {
        canvas.style.display = 'none';
        await elementUpdated(canvas);

        expect(press(arrowRight)).to.be.undefined;
        expect(press(endKey)).to.be.undefined;
      });
    });
  });

  describe('Pointer interaction', () => {
    it('drags the marker on pointer down/move', () => {
      const rect = canvas.getBoundingClientRect();
      const { width, height } = canvas.getMarkerDimensions();
      const eventSpy = spy(canvas, 'emitEvent');

      simulatePointerDown(canvas, {
        clientX: rect.x + 50,
        clientY: rect.y + 40,
      });

      expect(canvas.x).to.equal(50 - width);
      expect(canvas.y).to.equal(40 - height);
      expect(eventSpy).calledOnce;

      simulatePointerMove(
        canvas,
        { clientX: rect.x + 50, clientY: rect.y + 40 },
        { x: 10, y: 5 }
      );

      expect(canvas.x).to.equal(60 - width);
      expect(canvas.y).to.equal(45 - height);
    });

    it('stops dragging and focuses the marker on lost pointer capture', () => {
      const rect = canvas.getBoundingClientRect();

      simulatePointerDown(canvas, {
        clientX: rect.x + 50,
        clientY: rect.y + 40,
      });
      simulateLostPointerCapture(canvas);

      const { x, y } = canvas;
      simulatePointerMove(canvas, {
        clientX: rect.x + 100,
        clientY: rect.y + 100,
      });

      expect(canvas.x).to.equal(x);
      expect(canvas.y).to.equal(y);
      expect(canvas.shadowRoot?.activeElement).to.equal(getMarker(canvas));
    });

    it('ignores a pointer down of a button other than the main one', () => {
      const rect = canvas.getBoundingClientRect();
      const { x, y } = canvas;
      const eventSpy = spy(canvas, 'emitEvent');

      simulatePointerDown(canvas, {
        button: 2,
        clientX: rect.x + 50,
        clientY: rect.y + 40,
      });
      simulatePointerMove(canvas, {
        clientX: rect.x + 100,
        clientY: rect.y + 100,
      });

      expect([canvas.x, canvas.y]).to.eql([x, y]);
      expect(eventSpy).not.called;
    });

    it('does not bubble the `igcColorPicked` event', () => {
      const parentSpy = spy();
      canvas.parentElement?.addEventListener('igcColorPicked', parentSpy);

      simulatePointerDown(canvas, { clientX: 10, clientY: 10 });

      expect(parentSpy).not.called;
    });

    it('measures the canvas once per drag rather than once per move', () => {
      const rect = canvas.getBoundingClientRect();
      const rectSpy = spy(canvas, 'getBoundingClientRect');

      simulatePointerDown(canvas, {
        clientX: rect.x + 20,
        clientY: rect.y + 20,
      });

      const afterPointerDown = rectSpy.callCount;

      for (let offset = 1; offset <= 5; offset++) {
        simulatePointerMove(
          canvas,
          { clientX: rect.x + 20, clientY: rect.y + 20 },
          { x: offset, y: offset }
        );
      }

      // Each read forces a layout, so a drag must not measure on each frame.
      expect(rectSpy.callCount).to.equal(afterPointerDown);

      rectSpy.restore();
    });

    it('re-measures for a drag that follows a resize', async () => {
      simulatePointerDown(canvas, { clientX: 10, clientY: 10 });
      simulateLostPointerCapture(canvas);

      canvas.style.width = '400px';
      await elementUpdated(canvas);

      const rect = canvas.getBoundingClientRect();
      const { width, height } = canvas.getMarkerDimensions();

      simulatePointerDown(canvas, {
        clientX: rect.x + 380,
        clientY: rect.y + 10,
      });

      // Clamped against the new width, not the stale one captured earlier.
      expect(canvas.x).to.equal(380 - width);
      expect(canvas.y).to.equal(10 - height);
    });
  });
});
