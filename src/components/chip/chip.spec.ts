import { html, fixture, expect, elementUpdated } from '@open-wc/testing';
import { IgcChipComponent } from '../../index.js';

describe('Chip', () => {
  before(() => {
    IgcChipComponent.register();
  });

  it('should initialize with default values', async () => {
    const chip = await fixture<IgcChipComponent>(html`<igc-chip></igc-chip>`);

    expect(chip).dom.to.equal(`<igc-chip size="medium"></igc-chip>`);
  });

  it('should change variant correctly', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip variant="info" size="medium"></igc-chip>`
    );

    expect(chip.variant).to.equal('info');

    chip.variant = 'primary';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="primary" size="medium"></igc-chip>`
    );

    chip.variant = 'danger';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="danger" size="medium"></igc-chip>`
    );

    chip.variant = 'success';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(
      `<igc-chip variant="success" size="medium"></igc-chip>`
    );
  });

  it('should change the size property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip size="large"></igc-chip>`
    );

    expect(chip.size).to.equal('large');

    chip.size = 'small';
    await elementUpdated(chip);
    expect(chip).dom.to.equal(`<igc-chip size="small"></igc-chip>`);
  });

  it('should toggle the disabled property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip size="medium"></igc-chip>`
    );

    chip.disabled = true;
    expect(chip.disabled).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal(`<igc-chip size="medium" disabled></igc-chip>`);

    chip.disabled = false;
    expect(chip.disabled).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal(`<igc-chip size="medium"></igc-chip>`);
  });

  it('should toggle the selectable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip size="medium"></igc-chip>`
    );

    chip.selectable = true;
    expect(chip.selectable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal(`<igc-chip size="medium" selectable></igc-chip>`);

    chip.selectable = false;
    expect(chip.selectable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal(`<igc-chip size="medium"></igc-chip>`);
  });

  it('should toggle the removable property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip size="medium"></igc-chip>`
    );

    chip.removable = true;
    expect(chip.removable).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal(`<igc-chip size="medium" removable></igc-chip>`);

    chip.removable = false;
    expect(chip.removable).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal(`<igc-chip size="medium"></igc-chip>`);
  });

  it('should toggle selected property successfully', async () => {
    const chip = await fixture<IgcChipComponent>(
      html`<igc-chip size="medium"></igc-chip>`
    );

    chip.selected = true;
    expect(chip.selected).to.be.true;
    await elementUpdated(chip);
    expect(chip).dom.to.equal(`<igc-chip size="medium" selected></igc-chip>`);

    chip.selected = false;
    expect(chip.selected).to.be.false;
    await elementUpdated(chip);

    expect(chip).dom.to.equal(`<igc-chip size="medium"></igc-chip>`);
  });
});
