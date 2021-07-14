import { expect, fixture, html } from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { IgcButtonBaseComponent } from './button-base';
import { IgcLinkButtonComponent } from './link-button';

describe('ButtonBase component', () => {
  let el: IgcButtonBaseComponent;
  beforeEach(async () => {
    el = await fixture<IgcLinkButtonComponent>(html`<igc-link-button />`);
  });

  it('is created with the proper default values', async () => {
    expect(el.disabled).to.equal(false);
    expect(el.variant).to.equal('flat');
    expect(el.dir).to.equal('');
  });

  it('sets disabled property successfully', async () => {
    el.disabled = true;
    expect(el.disabled).to.be.true;
    el.disabled = false;
    expect(el.disabled).to.be.false;
  });

  it('sets variant property successfully', async () => {
    el.variant = 'raised';
    expect(el.variant).to.equal('raised');
    el.variant = 'outlined';
    expect(el.variant).to.equal('outlined');
    el.variant = 'fab';
    expect(el.variant).to.equal('fab');
    el.variant = 'flat';
    expect(el.variant).to.equal('flat');
  });

  it('sets direction property successfully', async () => {
    el.dir = 'rtl';
    expect(el.dir).to.equal('rtl');
    el.dir = 'ltr';
    expect(el.dir).to.equal('ltr');
  });
});
