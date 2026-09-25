import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { isFocused } from '#internals/testing/helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { setStyles } from '#internals/utils/dom.js';
import IgcSkeletonComponent from './skeleton.js';

describe('Skeleton', () => {
  before(() => defineComponents(IgcSkeletonComponent));

  //#region Helpers

  function getShapes(el: IgcSkeletonComponent): Element[] {
    return Array.from(el.renderRoot.querySelectorAll('[part~="shape"]'));
  }

  function getOverlay(el: IgcSkeletonComponent): Element | null {
    return el.renderRoot.querySelector('[part="overlay"]');
  }

  /** Creates a loading skeleton with two leaf nodes guaranteed to have dimensions. */
  async function createLoadingSkeleton(
    animation: IgcSkeletonComponent['animation'] = 'breathe'
  ): Promise<IgcSkeletonComponent> {
    const el = await fixture<IgcSkeletonComponent>(html`
      <igc-skeleton loading animation=${animation}>
        <div
          style="display: flex; flex-direction: column; gap: 4px; width: 200px;"
        >
          <span style="display: block; height: 16px; width: 100%;">Name</span>
          <span style="display: block; height: 14px; width: 80%;">Role</span>
        </div>
      </igc-skeleton>
    `);
    await nextFrame();
    await elementUpdated(el);
    return el;
  }

  /** Waits for a measurement and for the one that new resize targets trigger. */
  async function settle(el: IgcSkeletonComponent): Promise<void> {
    await nextFrame();
    await nextFrame();
    await elementUpdated(el);
  }

  /** Creates a loading skeleton over `content`, built without a template. */
  async function createSkeletonWith(
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    const el = await fixture<IgcSkeletonComponent>(
      html`<igc-skeleton loading></igc-skeleton>`
    );
    el.append(...content);
    await settle(el);
    return el;
  }

  function block(width: number, height: number): HTMLElement {
    const element = document.createElement('span');
    setStyles(element, {
      display: 'block',
      width: `${width}px`,
      height: `${height}px`,
    });
    return element;
  }

  function expectAligned(shape: Element, source: Element): void {
    const a = shape.getBoundingClientRect();
    const b = source.getBoundingClientRect();

    expect(a.left).to.be.closeTo(b.left, 0.5);
    expect(a.top).to.be.closeTo(b.top, 0.5);
    expect(a.width).to.be.closeTo(b.width, 0.5);
    expect(a.height).to.be.closeTo(b.height, 0.5);
  }

  //#endregion

  //#region Accessibility

  describe('Accessibility', () => {
    it('passes the a11y audit in idle state', async () => {
      const el = await fixture<IgcSkeletonComponent>(html`
        <igc-skeleton><span>Content</span></igc-skeleton>
      `);

      await expect(el).dom.to.be.accessible();
      await expect(el).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit in loading state', async () => {
      const el = await createLoadingSkeleton();

      await expect(el).dom.to.be.accessible();
      await expect(el).shadowDom.to.be.accessible();
    });

    it('makes the content inert while loading', async () => {
      const el = await fixture<IgcSkeletonComponent>(html`
        <igc-skeleton loading><button>Action</button></igc-skeleton>
      `);
      const button = el.querySelector('button')!;

      button.focus();
      expect(isFocused(button)).to.be.false;

      el.loading = false;
      await elementUpdated(el);

      button.focus();
      expect(isFocused(button)).to.be.true;
    });
  });

  //#endregion

  //#region Default values

  describe('Defaults', () => {
    it('initializes with correct default property values', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      expect(el.loading).to.be.false;
      expect(el.animation).to.equal('breathe');
    });

    it('does not reflect `loading` attribute when false', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      expect(el).dom.not.to.have.attribute('loading');
    });

    it('overlay is always present in the shadow DOM', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      expect(getOverlay(el)).to.exist;
    });

    it('renders no shape placeholders when not loading', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      expect(getShapes(el)).to.be.empty;
    });
  });

  //#endregion

  //#region `loading` property

  describe('`loading` property', () => {
    it('reflects to attribute', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      el.loading = true;
      await elementUpdated(el);
      expect(el).dom.to.have.attribute('loading');

      el.loading = false;
      await elementUpdated(el);
      expect(el).dom.not.to.have.attribute('loading');
    });

    it('renders shape placeholders when set to true', async () => {
      const el = await createLoadingSkeleton();
      expect(getShapes(el)).not.to.be.empty;
    });

    it('removes all shape placeholders when set to false', async () => {
      const el = await createLoadingSkeleton();
      expect(getShapes(el)).not.to.be.empty;

      el.loading = false;
      await elementUpdated(el);

      expect(getShapes(el)).to.be.empty;
    });

    it('sets `revealing` custom state on loading → false transition', async () => {
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.true;
    });

    it('removes `revealing` custom state after 600ms', async () => {
      const clock: SinonFakeTimers = useFakeTimers({ toFake: ['setTimeout'] });

      try {
        const el = await createLoadingSkeleton();

        el.loading = false;
        await elementUpdated(el);
        expect(el.matches(':state(revealing)')).to.be.true;

        clock.tick(600);
        expect(el.matches(':state(revealing)')).to.be.false;
      } finally {
        clock.restore();
      }
    });

    it('does not set `revealing` custom state when loading was never true', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton><span>Content</span></igc-skeleton>`
      );

      // loading was already false — no transition occurred
      el.loading = false;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });

    it('cancels pending `revealing` custom state when loading is set back to true', async () => {
      const clock: SinonFakeTimers = useFakeTimers({ toFake: ['setTimeout'] });

      try {
        const el = await createLoadingSkeleton();

        el.loading = false;
        await elementUpdated(el);
        expect(el.matches(':state(revealing)')).to.be.true;

        el.loading = true;
        await elementUpdated(el);
        clock.tick(600);

        // The reveal timer was cancelled — revealing state should not be present
        expect(el.matches(':state(revealing)')).to.be.false;
      } finally {
        clock.restore();
      }
    });

    it('sets `ariaBusy` from `loading`', async () => {
      const el = await createLoadingSkeleton();
      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('true');

      el.loading = false;
      await elementUpdated(el);

      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('false');
    });

    it('lets a `::part(overlay)` rule set the overlay opacity', async () => {
      const style = document.createElement('style');
      style.textContent =
        'igc-skeleton::part(overlay) { opacity: 0.8; transition: none; }';
      document.head.append(style);

      try {
        const el = await createLoadingSkeleton();
        expect(getComputedStyle(getOverlay(el)!).opacity).to.equal('0.8');
      } finally {
        style.remove();
      }
    });

    it('ends the `revealing` state at once when loading starts again', async () => {
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);
      el.loading = true;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });
  });

  //#endregion

  //#region `animation` property

  describe('`animation` property', () => {
    const animations = ['pulse', 'breathe', 'shimmer', 'wave', 'glow'] as const;

    for (const animation of animations) {
      it(`applies \`${animation}\` part to all shapes`, async () => {
        const el = await createLoadingSkeleton(animation);
        const shapes = getShapes(el);

        expect(shapes).not.to.be.empty;
        expect(shapes.every((shape) => shape.part.contains(animation))).to.be
          .true;
      });
    }

    it('updates shape parts when `animation` changes', async () => {
      const el = await createLoadingSkeleton('breathe');
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.true;

      el.animation = 'shimmer';
      await elementUpdated(el);

      expect(firstOf(getShapes(el)).part.contains('shimmer')).to.be.true;
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.false;
    });

    it('sets `--_wave-delay` on each shape for `wave` animation', async () => {
      const el = await createLoadingSkeleton('wave');
      const shapes = getShapes(el) as HTMLElement[];
      const [firstShape, secondShape, _] = shapes;

      expect(shapes.length).to.be.at.least(2);

      expect(firstShape.style.getPropertyValue('--_wave-delay')).to.equal('0s');
      expect(secondShape.style.getPropertyValue('--_wave-delay')).to.equal(
        '0.1s'
      );
    });

    it('does not set `--_wave-delay` for non-wave animations', async () => {
      const el = await createLoadingSkeleton('shimmer');
      const shapes = getShapes(el) as HTMLElement[];
      expect(
        shapes.every(
          (shape) => shape.style.getPropertyValue('--_wave-delay') === ''
        )
      ).to.be.true;
    });

    it('staggers the `wave` delay in exact steps', async () => {
      const el = await createSkeletonWith(
        block(10, 10),
        block(10, 10),
        block(10, 10),
        block(10, 10)
      );
      el.animation = 'wave';
      await elementUpdated(el);

      const shape = getShapes(el)[3] as HTMLElement;
      expect(shape.style.getPropertyValue('--_wave-delay')).to.equal('0.3s');
    });
  });

  //#endregion

  //#region Content projection

  describe('Content projection', () => {
    it('renders slotted content', async () => {
      const el = await fixture<IgcSkeletonComponent>(html`
        <igc-skeleton>
          <span id="projected">Hello</span>
        </igc-skeleton>
      `);

      expect(el.querySelector('#projected')).to.exist;
    });

    it('measures the correct number of leaf nodes as shapes', async () => {
      const el = await createLoadingSkeleton();

      // The template in createLoadingSkeleton contains exactly 2 leaf <span> elements
      expect(getShapes(el)).to.have.lengthOf(2);
    });
  });

  //#endregion

  //#region Measurement

  describe('Measurement', () => {
    it('aligns shapes with their sources when the host has a border', async () => {
      const source = block(50, 20);
      const el = await createSkeletonWith(source);
      el.style.border = '10px solid';
      await settle(el);

      expectAligned(firstOf(getShapes(el)), source);
    });

    it('renders a shape for each text run next to sibling elements', async () => {
      const paragraph = document.createElement('p');
      const bold = document.createElement('b');
      bold.textContent = 'world';
      paragraph.append(
        document.createTextNode('Hello '),
        bold,
        document.createTextNode(' ')
      );
      const el = await createSkeletonWith(paragraph);

      // "Hello " and <b>. The trailing whitespace gets no shape.
      expect(getShapes(el)).to.have.lengthOf(2);
    });

    it('renders a shape for text projected directly into the host', async () => {
      const el = await createSkeletonWith(document.createTextNode('Loading'));
      expect(getShapes(el)).to.have.lengthOf(1);
    });

    it('skips hidden and zero-size elements', async () => {
      const hidden = block(50, 20);
      hidden.style.display = 'none';
      const el = await createSkeletonWith(block(50, 20), block(0, 20), hidden);

      expect(getShapes(el)).to.have.lengthOf(1);
    });

    it('keeps the border radius of a source and falls back when it has none', async () => {
      const rounded = block(50, 20);
      rounded.style.borderRadius = '4px';
      const el = await createSkeletonWith(rounded, block(50, 20));
      const [first, second] = getShapes(el) as HTMLElement[];

      const fallback = getComputedStyle(getOverlay(el)!).borderRadius;

      expect(first.style.borderRadius).to.equal('4px');
      expect(second.style.borderRadius).to.be.empty;
      expect(fallback).not.to.equal('0px');
      expect(getComputedStyle(second).borderRadius).to.equal(fallback);
    });

    it('updates the shapes when content is added', async () => {
      const el = await createSkeletonWith(block(50, 20));

      el.append(block(50, 20));
      await settle(el);

      expect(getShapes(el)).to.have.lengthOf(2);
    });

    it('updates the shapes when an attribute changes a source', async () => {
      const source = block(50, 20);
      const el = await createSkeletonWith(source);
      el.style.width = '200px';
      await settle(el);

      source.style.marginLeft = '30px';
      await settle(el);

      expectAligned(firstOf(getShapes(el)), source);
    });

    it('updates the shapes when a source resizes inside a fixed-size host', async () => {
      const source = block(50, 20);
      source.classList.add('skeleton-probe');
      const el = await createSkeletonWith(source);
      el.style.width = '200px';
      await settle(el);

      // A document style changes nothing that the mutation observer sees.
      const style = document.createElement('style');
      style.textContent = '.skeleton-probe { width: 120px !important; }';
      document.head.append(style);

      try {
        await settle(el);
        expectAligned(firstOf(getShapes(el)), source);
      } finally {
        style.remove();
      }
    });
  });

  //#endregion

  //#region Lifecycle

  describe('Lifecycle', () => {
    it('clears the reveal timer and does not throw on disconnect', async () => {
      const clock: SinonFakeTimers = useFakeTimers({ toFake: ['setTimeout'] });

      try {
        const el = await createLoadingSkeleton();

        el.loading = false;
        await elementUpdated(el);
        expect(el.matches(':state(revealing)')).to.be.true;

        // Disconnect before timer fires
        el.remove();

        // Ticking the clock should not throw even though the element is detached
        expect(() => clock.tick(600)).not.to.throw();
      } finally {
        clock.restore();
      }
    });

    it('does not update on content changes after a reconnect while not loading', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton></igc-skeleton>`
      );
      const container = document.createElement('div');
      el.append(container);
      const parent = el.parentElement!;
      el.remove();
      parent.append(el);
      await elementUpdated(el);

      const requestUpdate = spy(el, 'requestUpdate');
      container.append(block(10, 10));
      await settle(el);

      expect(requestUpdate.called).to.be.false;
    });

    it('ends the `revealing` state on disconnect', async () => {
      const el = await createLoadingSkeleton();
      const parent = el.parentElement!;

      el.loading = false;
      await elementUpdated(el);
      el.remove();
      parent.append(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });
  });

  //#endregion
});
