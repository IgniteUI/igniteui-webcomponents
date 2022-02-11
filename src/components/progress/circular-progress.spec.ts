import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents, IgcCircularProgressComponent } from '../../index.js';

describe('Circular progress component', () => {
  before(() => defineComponents(IgcCircularProgressComponent));

  let progress: IgcCircularProgressComponent;

  describe('', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        html`<igc-circular-progress></igc-circular-progress>`
      );
    });

    it('is initialized with sensible defaults', async () => {
      expect(progress.max).to.equal(100);
      expect(progress.value).to.equal(0);
      expect(progress.animationDuration).to.equal(2000);
      expect(progress.indeterminate).to.equal(false);
      expect(progress.variant).to.equal('primary');
      expect(progress.labelFormat).to.equal(undefined);
    });

    it('is accessible', async () => {
      await expect(progress).to.be.accessible();
    });

    it('updates its value correctly', async () => {
      progress.value = 50;

      await elementUpdated(progress);
      expect(progress.value).to.equal(50);
    });

    it('correctly handles negative values', async () => {
      progress.value = -10;

      await elementUpdated(progress);
      expect(progress.value).to.equal(0);
    });

    it('correctly handles values > max', async () => {
      progress.value = 200;

      await elementUpdated(progress);
      expect(progress.value).to.equal(100);
    });

    it('correctly clamps its value when max is changed and new max < value', async () => {
      progress.value = 50;
      progress.max = 25;

      await elementUpdated(progress);
      expect(progress.value).to.equal(25);
    });

    it('does not change its value when max is changed and new max > value', async () => {
      progress.value = 95;
      progress.max = 150;

      await elementUpdated(progress);
      expect(progress.value).to.equal(95);
    });

    it('correctly reflects indeterminate modifier', async () => {
      progress.indeterminate = true;

      await elementUpdated(progress);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;
    });

    it('correctly reflects its variant', async () => {
      const variants = ['primary', 'success', 'info', 'danger', 'warning'];

      for (const variant of variants) {
        progress.variant = variant as any;
        await elementUpdated(progress);
        expect(progress.shadowRoot!.querySelector(`[part~="${variant}"]`)).not
          .to.be.null;
      }
    });

    it('correctly applies a custom label format', async () => {
      progress.labelFormat = 'Task {0} of {1} completed';
      progress.value = 8;
      progress.max = 10;

      await elementUpdated(progress);
      expect(
        progress
          .shadowRoot!.querySelector('[part~="text"]')
          ?.textContent?.trim()
      ).to.equal('Task 8 of 10 completed');
    });
  });
});
