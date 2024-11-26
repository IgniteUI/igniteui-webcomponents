import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcLinearProgressComponent from './linear-progress.js';

function createNonAnimatingProgress() {
  return html`<igc-linear-progress
    animation-duration="0"
  ></igc-linear-progress>`;
}

describe('Linear progress component', () => {
  let progress: IgcLinearProgressComponent;

  const queryShadowRoot = (qs: string) =>
    progress.shadowRoot!.querySelector(qs);

  const getFillPart = () => queryShadowRoot(`[part~='fill']`);

  const updateProgress = async <T extends keyof IgcLinearProgressComponent>(
    prop: T,
    value: IgcLinearProgressComponent[T]
  ) => {
    Object.assign(progress, { [prop]: value });
    await elementUpdated(progress);
    await nextFrame();
  };

  before(() => defineComponents(IgcLinearProgressComponent));

  describe('Attributes and Properties', () => {
    beforeEach(async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        createNonAnimatingProgress()
      );
    });

    it('reflects the striped attribute', async () => {
      await updateProgress('striped', true);
      expect(queryShadowRoot(`[part~='striped']`)).not.to.be.null;

      await updateProgress('striped', false);
      expect(queryShadowRoot(`[part~='striped']`)).to.be.null;
    });

    it('reflects the variant attribute', async () => {
      const variants: IgcLinearProgressComponent['variant'][] = [
        'primary',
        'success',
        'info',
        'danger',
        'warning',
      ];

      for (const variant of variants) {
        await updateProgress('variant', variant);
        expect(progress).to.have.attribute('variant', variant);
      }
    });

    it('updates label alignment', async () => {
      const alignments: IgcLinearProgressComponent['labelAlign'][] = [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
      ];

      for (const alignment of alignments) {
        await updateProgress('labelAlign', alignment);
        expect(progress).to.have.attribute('label-align', alignment);
      }
    });

    it('reflects the progress fill based on value', async () => {
      await updateProgress('value', 50);
      const fill = getFillPart();
      expect(fill).not.to.be.null;
    });
  });

  describe('Rendering', () => {
    it('renders default slot content', async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        html`<igc-linear-progress>Custom Label</igc-linear-progress>`
      );
      const slot = progress.shadowRoot!.querySelector('slot');
      expect(slot).to.exist;
    });
  });
});
