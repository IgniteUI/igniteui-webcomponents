import { expect, fixture, html } from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { IgcButtonComponent } from '../button/button';
import { IgcBaseComponent } from './component-base';

describe('Base component', () => {
  let el: IgcBaseComponent;
  beforeEach(async () => {
    el = await fixture<IgcButtonComponent>(html`<igc-button />`);
  });

  it('is created with the default size value', async () => {
    expect(el.size).to.equal('large');
  });

  it('changes size property values successfully', async () => {
    el.size = 'medium';
    expect(el.size).to.equal('medium');
    el.size = 'small';
    expect(el.size).to.equal('small');
    el.size = 'large';
    expect(el.size).to.equal('large');
  });
});
