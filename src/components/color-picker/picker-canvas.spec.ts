import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { asPercent } from '../common/util.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcPickerCanvasComponent from './picker-canvas.js';

async function createCanvas() {
  return await fixture<IgcPickerCanvasComponent>(
    html`<igc-picker-canvas
      style="width: 300px; height: 200px;"
    ></igc-picker-canvas>`
  );
}

function getMarker(canvas: IgcPickerCanvasComponent): HTMLDivElement {
  return canvas.renderRoot.querySelector('[part="marker"]')!;
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

    it('`getMarkerDimensions()` returns half the marker size', () => {
      const rect = getMarker(canvas).getBoundingClientRect();
      const dimensions = canvas.getMarkerDimensions();

      expect(dimensions.width).to.equal(rect.width / 2);
      expect(dimensions.height).to.equal(rect.height / 2);
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

      expect(canvas.style.getPropertyValue('--_marker-color')).to.equal(
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
    it('moves the marker with arrow keys and emits `igcColorPicked`', () => {
      const eventSpy = spy(canvas, 'emitEvent');

      simulateKeyboard(canvas, arrowRight);
      expect(canvas.x).to.equal(1);
      expect(eventSpy).calledOnce;

      simulateKeyboard(canvas, arrowDown);
      expect(canvas.y).to.equal(1);

      simulateKeyboard(canvas, arrowLeft);
      expect(canvas.x).to.equal(0);

      simulateKeyboard(canvas, arrowUp);
      expect(canvas.y).to.equal(0);

      expect(eventSpy.callCount).to.equal(4);
    });

    it('emits rounded percentages relative to the canvas size', () => {
      const eventSpy = spy(canvas, 'emitEvent');
      const { width, height } = canvas.getMarkerDimensions();
      const rect = canvas.getBoundingClientRect();

      simulateKeyboard(canvas, arrowRight);

      expect(eventSpy).calledWith('igcColorPicked', {
        detail: {
          x: Math.round(asPercent(1 + width, rect.width)),
          y: Math.round(asPercent(height, rect.height)),
        },
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

    it('does not bubble the `igcColorPicked` event', () => {
      const parentSpy = spy();
      canvas.parentElement?.addEventListener('igcColorPicked', parentSpy);

      simulatePointerDown(canvas, { clientX: 10, clientY: 10 });

      expect(parentSpy).not.called;
    });
  });
});
