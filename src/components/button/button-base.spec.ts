import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { IgcButtonBaseComponent } from './button-base';
import { IgcButtonComponent } from './button';

const DIFF_OPTIONS = { ignoreChildren: ['button'], ignoreAttributes: ['part'] };

describe('ButtonBase component', () => {
  let el: IgcButtonBaseComponent;
  beforeEach(async () => {
    el = await fixture<IgcButtonComponent>(html`<igc-button />`);
  });

  it('is created with the proper default values', async () => {
    expect(el.disabled).to.equal(false);
    expect(el.variant).to.equal('flat');
    expect(el.dir).to.equal('');

    expect(el).shadowDom.to.equal(`<button class="large flat"/>`, DIFF_OPTIONS);
  });

  it('sets disabled property successfully', async () => {
    el.disabled = true;
    expect(el.disabled).to.be.true;
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="disabled large flat" disabled/>`,
      DIFF_OPTIONS
    );

    el.disabled = false;
    expect(el.disabled).to.be.false;
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(`<button class="large flat"/>`, DIFF_OPTIONS);
  });

  it('sets variant property successfully', async () => {
    el.variant = 'raised';
    expect(el.variant).to.equal('raised');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="large raised"/>`,
      DIFF_OPTIONS
    );

    el.variant = 'outlined';
    expect(el.variant).to.equal('outlined');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="large outlined"/>`,
      DIFF_OPTIONS
    );

    el.variant = 'fab';
    expect(el.variant).to.equal('fab');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(`<button class="large fab"/>`, DIFF_OPTIONS);

    el.variant = 'flat';
    expect(el.variant).to.equal('flat');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(`<button class="large flat"/>`, DIFF_OPTIONS);
  });
});
