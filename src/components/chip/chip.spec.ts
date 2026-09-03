import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcChipComponent from './chip.js';

describe('Chip', () => {
  const DIFF_OPTIONS = {
    ignoreAttributes: ['style'],
  };

  before(() => {
    defineComponents(IgcChipComponent);
  });

  it('passes the a11y audit', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip>Chip</igc-chip>`
    );

    await expect(chip).shadowDom.to.be.accessible();
    await expect(chip).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should change variant correctly', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip variant="info"></igc-chip>`
    );

    expect(chip.variant).to.equal('info');

    chip.variant = 'primary';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="primary"></igc-chip>`,
      DIFF_OPTIONS
    );

    chip.variant = 'danger';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="danger"></igc-chip>`,
      DIFF_OPTIONS
    );

    chip.variant = 'success';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="success"></igc-chip>`,
      DIFF_OPTIONS
    );
  });

  it('should toggle the disabled property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.disabled = true;
    expect(chip.disabled).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip disabled></igc-chip>', DIFF_OPTIONS);

    chip.disabled = false;
    expect(chip.disabled).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the outlined property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.outlined = true;
    expect(chip.outlined).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip outlined></igc-chip>', DIFF_OPTIONS);

    chip.outlined = false;
    expect(chip.outlined).to.be.false;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the selectable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.selectable = true;
    expect(chip.selectable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip selectable></igc-chip>', DIFF_OPTIONS);

    chip.selectable = false;
    expect(chip.selectable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle the removable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.removable = true;
    expect(chip.removable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip removable></igc-chip>', DIFF_OPTIONS);

    chip.removable = false;
    expect(chip.removable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  it('should toggle selected property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    chip.selected = true;
    expect(chip.selected).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal('<igc-chip selected></igc-chip>', DIFF_OPTIONS);

    chip.selected = false;
    expect(chip.selected).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal('<igc-chip></igc-chip>', DIFF_OPTIONS);
  });

  describe('Accessibility', () => {
    it('passes the a11y audit in every interactive state', async () => {
      const states = [
        html`<igc-chip removable>Chip</igc-chip>`,
        html`<igc-chip selectable selected>Chip</igc-chip>`,
        html`<igc-chip selectable selected removable outlined>Chip</igc-chip>`,
        html`<igc-chip disabled selectable removable>Chip</igc-chip>`,
      ];

      for (const state of states) {
        const chip = await fixture<IgcChipComponent>(state);

        await expect(chip).shadowDom.to.be.accessible();
        await expect(chip).to.be.accessible();
      }
    });

    it('keeps the remove control out of the action control', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );

      const action = chip.renderRoot.querySelector('[part="action"]')!;
      const remove = chip.renderRoot.querySelector('[part="remove"]')!;

      expect(action.contains(remove)).to.be.false;
      expect(action.querySelector('[tabindex]')).to.be.null;
    });

    it('does not leak the state icon into the accessible name', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable selected>Chip</igc-chip>`
      );

      const icon = chip.renderRoot.querySelector('igc-icon[name="selected"]')!;

      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      expect(icon.hasAttribute('aria-label')).to.be.false;
    });

    it('exposes the selection state through aria-pressed', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const action = chip.renderRoot.querySelector('[part="action"]')!;

      expect(action.getAttribute('aria-pressed')).to.equal('false');

      chip.selected = true;
      await elementUpdated(chip);
      expect(action.getAttribute('aria-pressed')).to.equal('true');

      chip.selectable = false;
      await elementUpdated(chip);
      expect(action.hasAttribute('aria-pressed')).to.be.false;
    });
  });

  describe('Rendering', () => {
    it('keeps the prefix hidden when selected but not selectable', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selected>Chip</igc-chip>`
      );
      const prefix = chip.renderRoot.querySelector('[part="prefix"]')!;

      expect(prefix.hasAttribute('hidden')).to.be.true;

      chip.selectable = true;
      await elementUpdated(chip);
      expect(prefix.hasAttribute('hidden')).to.be.false;
    });

    it('keeps the suffix hidden when only the remove control is rendered', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );

      expect(
        chip.renderRoot.querySelector('[part="suffix"]')!.hasAttribute('hidden')
      ).to.be.true;
      expect(chip.renderRoot.querySelector('[part="remove"]')).to.not.be.null;
    });

    it('does not render the remove control for a disabled chip', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip disabled removable>Chip</igc-chip>`
      );

      expect(chip.renderRoot.querySelector('[part="remove"]')).to.be.null;
    });
  });

  describe('Events', () => {
    it('emits igcRemove when the remove control is activated', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip removable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcRemove', eventSpy);

      (
        chip.renderRoot.querySelector('igc-icon[name="remove"]') as HTMLElement
      ).click();

      expect(eventSpy).calledOnce;
    });

    it('does not emit igcSelect when the remove control is activated', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable removable>Chip</igc-chip>`
      );
      const removeSpy = spy();
      const selectSpy = spy();
      chip.addEventListener('igcRemove', removeSpy);
      chip.addEventListener('igcSelect', selectSpy);

      const icon = chip.renderRoot.querySelector(
        'igc-icon[name="remove"]'
      ) as HTMLElement;

      icon.click();
      icon.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Enter',
          bubbles: true,
          composed: true,
        })
      );
      await elementUpdated(chip);

      expect(removeSpy.callCount).to.equal(2);
      expect(selectSpy).to.not.be.called;
      expect(chip.selected).to.be.false;
    });

    it('does not intercept the activation keys of a non-removable chip', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcRemove', eventSpy);

      const action = chip.renderRoot.querySelector('[part="action"]')!;

      // The remove keybindings are scoped to the remove control. Left unscoped
      // they fall back to the host and cancel the default action of the keys
      // that activate the chip itself - `Space` selection among them.
      for (const key of ['Enter', ' ']) {
        const event = new KeyboardEvent('keyup', {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        action.dispatchEvent(event);

        expect(event.defaultPrevented).to.be.false;
      }

      expect(eventSpy).to.not.be.called;
    });

    it('emits igcSelect from the action control', async () => {
      const chip = await fixture<IgcChipComponent>(
        html`<igc-chip selectable>Chip</igc-chip>`
      );
      const eventSpy = spy();
      chip.addEventListener('igcSelect', eventSpy);

      (chip.renderRoot.querySelector('[part="action"]') as HTMLElement).click();
      await elementUpdated(chip);

      expect(chip.selected).to.be.true;
      expect(eventSpy).calledOnce;
      expect(eventSpy.firstCall.args[0].detail).to.be.true;
    });
  });
});
