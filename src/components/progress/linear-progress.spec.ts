import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';
import { defineComponents, IgcLinearProgressComponent } from '../../index.js';

describe('Linear progress component', () => {
  before(() => defineComponents(IgcLinearProgressComponent));

  let progress: IgcLinearProgressComponent;

  describe('', () => {
    beforeEach(async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        html`<igc-linear-progress></igc-linear-progress>`
      );
    });

    it('is initialized with sensible defaults', async () => {
      expect(progress.max).to.equal(100);
      expect(progress.value).to.equal(0);
      expect(progress.animationDuration).to.equal(500);
      expect(progress.striped).to.equal(false);
      expect(progress.indeterminate).to.equal(false);
      expect(progress.hideLabel).to.equal(false);
      expect(progress.variant).to.equal('primary');
      expect(progress.labelFormat).to.equal(undefined);
      expect(progress.labelAlign).to.equal('top-start');
    });

    it('is accessible', async () => {
      await expect(progress).to.be.accessible({
        ignoredRules: ['aria-progressbar-name'],
      });
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

    it('updates the value when it is increased/decreased', async () => {
      progress.value++;

      await elementUpdated(progress);
      expect(progress.value).to.equal(1);

      progress.value--;

      await elementUpdated(progress);
      expect(progress.value).to.equal(0);
    });

    it('correctly reflects indeterminate modifier', async () => {
      progress.indeterminate = true;

      await elementUpdated(progress);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;
    });

    it('correctly sets properties through attribute values', async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        html`<igc-linear-progress
          value="50"
          max="150"
          label-format="{0} val"
          animation-duration="2100"
          variant="warning"
          label-align="bottom"
        ></igc-linear-progress>`
      );

      await aTimeout(0);

      expect(progress.value).to.equal(50);
      expect(progress.max).to.equal(150);
      expect(progress.labelFormat).to.equal('{0} val');
      expect(progress.animationDuration).to.equal(2100);
      expect(progress.variant).to.equal('warning');
      expect(progress.labelAlign).to.equal('bottom');

      progress.setAttribute('indeterminate', '');
      progress.labelAlign = 'top-start';
      await elementUpdated(progress);

      expect(progress.indeterminate).to.equal(true);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;
      expect(progress.labelAlign).to.equal('top-start');

      progress.removeAttribute('indeterminate');
      await elementUpdated(progress);

      expect(progress.indeterminate).to.equal(false);
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;
      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.max = 20;
      await elementUpdated(progress);

      expect(progress.value).to.equal(20);
    });

    it('correctly reflects updated value in indeterminate mode when switched to determinate', async () => {
      progress.indeterminate = true;
      await elementUpdated(progress);

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;

      progress.value = 50;
      progress.indeterminate = false;
      await elementUpdated(progress);

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;
      expect(progress.value).to.equal(50);
    });

    it('handles animations correctly when toggling indeterminate and rtl mode', async () => {
      progress.indeterminate = true;
      await elementUpdated(progress);

      let animations = progress
        .shadowRoot!.querySelector('[part~="fill"]')
        ?.getAnimations() as Animation[];

      expect(animations.length).to.equal(1);
      expect(animations[0]).to.be.instanceOf(CSSAnimation);
      expect((animations[0] as CSSAnimation).animationName).to.equal(
        'indeterminate-bar'
      );
      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).not
        .to.be.null;

      progress.indeterminate = false;
      await elementUpdated(progress);

      animations = progress
        .shadowRoot!.querySelector('[part~="fill"]')
        ?.getAnimations() as Animation[];

      animations.forEach((anim) => {
        expect(anim).to.be.instanceOf(Animation);
        expect(anim).not.to.be.instanceOf(CSSAnimation);
      });

      expect(progress.shadowRoot!.querySelector('[part~="indeterminate"]')).to
        .be.null;

      progress.indeterminate = true;
      await elementUpdated(progress);

      animations = progress
        .shadowRoot!.querySelector('[part~="fill"]')
        ?.getAnimations() as Animation[];

      expect(animations.length).to.equal(1);
      expect(animations[0]).to.be.instanceOf(CSSAnimation);
      expect((animations[0] as CSSAnimation).animationName).to.equal(
        'indeterminate-bar'
      );

      progress.dir = 'rtl';
      await elementUpdated(progress);

      const fillElement = progress.shadowRoot!.querySelector(
        '[part~="fill"]'
      ) as Element;

      expect(getComputedStyle(fillElement).animationDirection).to.equal(
        'reverse'
      );
    });

    it('hides the default label when in indeterminate mode', async () => {
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);

      expect(defaultLabel).not.to.be.null;

      progress.indeterminate = true;
      await elementUpdated(progress);

      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;
    });

    it('shows/hides the default label depending on the hideLabel property', async () => {
      let defaultLabel =
        progress.shadowRoot!.querySelector(`span[part~="label"]`);

      expect(defaultLabel).not.to.be.null;

      progress.hideLabel = true;
      await elementUpdated(progress);

      defaultLabel = progress.shadowRoot!.querySelector(`span[part~="label"]`);
      expect(defaultLabel).to.be.null;
    });

    it('indeterminate and hideLabel properties should not affect the slotted label', async () => {
      progress = await fixture<IgcLinearProgressComponent>(
        html`<igc-linear-progress>
          <div>Label</div>
        </igc-linear-progress>`
      );

      let defaultLabel =
        progress.shadowRoot!.querySelector(`slot[part="label"]`);

      expect(defaultLabel).not.to.be.null;

      progress.hideLabel = true;
      await elementUpdated(progress);

      defaultLabel = progress.shadowRoot!.querySelector(`slot[part="label"]`);
      expect(defaultLabel).not.to.be.null;

      progress.indeterminate = true;
      await elementUpdated(progress);

      defaultLabel = progress.shadowRoot!.querySelector(`slot[part="label"]`);
      expect(defaultLabel).not.to.be.null;
    });

    it('correctly reflects striped modifier', async () => {
      progress.striped = true;

      await elementUpdated(progress);
      expect(progress.shadowRoot!.querySelector('[part~="striped"]')).not.to.be
        .null;
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
      let label = progress
        .shadowRoot!.querySelector('span[part~="label"]')
        ?.textContent?.trim();
      expect(label).to.equal('0%');

      progress.labelFormat = 'Task {0} of {1} completed';
      progress.value = 8;
      progress.max = 10;

      await elementUpdated(progress);

      label = progress
        .shadowRoot!.querySelector('span[part~="label"]')
        ?.textContent?.trim();

      expect(label).to.equal('Task 8 of 10 completed');
    });

    it('positions the text correctly based on the label-align value', async () => {
      const alignments = [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
      ];

      for (let index = 0; index < alignments.length; index++) {
        const val = alignments[index];

        progress.labelAlign = val as typeof progress.labelAlign;
        await elementUpdated(progress);

        expect(progress).to.have.attribute('label-align', val.toString());
      }
    });

    it('renders proper aria attributes', async () => {
      let divElement = progress.shadowRoot!.querySelector('div[part="track"]');
      expect(divElement).to.have.attribute('role', 'progressbar');
      expect(divElement).to.have.attribute('aria-valuemin', '0');
      expect(divElement).to.have.attribute(
        'aria-valuemax',
        progress.max.toString()
      );
      expect(divElement).to.have.attribute(
        'aria-valuenow',
        progress.value.toString()
      );

      progress.max = 150;
      progress.value = 50;
      await elementUpdated(progress);

      divElement = progress.shadowRoot!.querySelector('div[part="track"]');
      expect(divElement).to.have.attribute('aria-valuemax', '150');
      expect(divElement).to.have.attribute('aria-valuenow', '50');

      progress.indeterminate = true;
      await elementUpdated(progress);

      divElement = progress.shadowRoot!.querySelector('div[part="track"]');
      expect(divElement).not.to.have.attribute('aria-valuenow');
    });
  });
});
