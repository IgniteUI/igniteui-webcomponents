import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcChipComponent from './chip.js';

describe('Chip', () => {
  const DIFF_OPTIONS = {
    ignoreAttributes: ['style'],
  };

  before(() => {
    defineComponents(IgcChipComponent);
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
});
