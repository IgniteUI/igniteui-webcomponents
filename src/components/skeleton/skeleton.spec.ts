import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
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
      expect(first(getShapes(el)).part.contains('breathe')).to.be.true;

      el.animation = 'shimmer';
      await elementUpdated(el);

      expect(first(getShapes(el)).part.contains('shimmer')).to.be.true;
      expect(first(getShapes(el)).part.contains('breathe')).to.be.false;
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
  });

  //#endregion
});
