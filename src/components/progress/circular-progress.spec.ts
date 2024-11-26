import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { getAnimationsFor } from '../common/utils.spec.js';
import IgcCircularProgressComponent from './circular-progress.js';

function createNonAnimatingProgress() {
  return html`<igc-circular-progress
    animation-duration="0"
  ></igc-circular-progress>`;
}

function createSlottedGradientProgress() {
  return html`
    <igc-circular-progress>
      <igc-circular-gradient
        slot="gradient"
        offset="50%"
        color="#ff0079"
        opacity="0.8"
      ></igc-circular-gradient>
    </igc-circular-progress>
  `;
}

describe('Circular progress component', () => {
  let progress: IgcCircularProgressComponent;

  const queryShadowRoot = (qs: string) =>
    progress.shadowRoot!.querySelector(qs);

  const getSvgPart = () => queryShadowRoot(`[part~='svg']`);
  // const getLabelPart = () => queryShadowRoot(`[part~='value']`);

  const updateProgress = async <T extends keyof IgcCircularProgressComponent>(
    prop: T,
    value: IgcCircularProgressComponent[T]
  ) => {
    Object.assign(progress, { [prop]: value });
    await elementUpdated(progress);
    await nextFrame();
  };

  before(() => defineComponents(IgcCircularProgressComponent));

  describe('Attributes and Properties', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        createNonAnimatingProgress()
      );
    });

    it('reflects variant attribute', async () => {
      const variants: IgcCircularProgressComponent['variant'][] = [
        'primary',
        'success',
        'danger',
      ];

      for (const variant of variants) {
        await updateProgress('variant', variant);
        expect(progress).to.have.attribute('variant', variant);
      }
    });

    // it('handles indeterminate state transitions', async () => {
    //   await updateProgress('value', 30);
    //   expect(progress.getAttribute('aria-valuenow')).to.equal('30'); // Ensure value is set
    //
    //   await updateProgress('indeterminate', true);
    //   expect(progress.getAttribute('aria-valuenow')).to.be.null; // Indeterminate clears aria-valuenow
    //
    //   await updateProgress('indeterminate', false);
    //   expect(progress.getAttribute('aria-valuenow')).to.equal('30'); // Restores value
    // });

    // it('applies custom label format', async () => {
    //   // Set a custom label format
    //   await updateProgress('labelFormat', 'Completed {0} of {1}');
    //   await updateProgress('value', 75);
    //   await updateProgress('max', 100);
    //
    //   const label = getLabelPart();
    //   expect(label?.textContent?.trim()).to.equal('Completed 75 of 100');
    // });
  });

  describe('Rendering and Gradients', () => {
    beforeEach(async () => {
      progress = await fixture(createSlottedGradientProgress());
    });

    it('renders slotted gradient correctly', async () => {
      const gradients = progress.querySelectorAll('igc-circular-gradient');
      expect(gradients).to.have.lengthOf(1);

      const stop = queryShadowRoot('linearGradient stop');
      expect(stop).to.have.attribute('offset', '50%');
      expect(stop).to.have.attribute('stop-color', '#ff0079');
      expect(stop).to.have.attribute('stop-opacity', '0.8');
    });
  });

  describe('Animation and RTL', () => {
    beforeEach(async () => {
      progress = await fixture<IgcCircularProgressComponent>(
        createNonAnimatingProgress()
      );
    });

    it('switches animation direction based on text direction', async () => {
      progress.dir = 'rtl';
      await updateProgress('indeterminate', true);

      const animations = getAnimationsFor(getSvgPart()!);
      expect(animations).not.to.be.empty;
      expect(getComputedStyle(getSvgPart()!).animationDirection).to.equal(
        'reverse'
      );

      progress.dir = 'ltr';
      await elementUpdated(progress);

      expect(getComputedStyle(getSvgPart()!).animationDirection).to.equal(
        'normal'
      );
    });
  });
});
