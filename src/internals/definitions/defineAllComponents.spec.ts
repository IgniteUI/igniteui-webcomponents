import { expect } from '@open-wc/testing';
import IgcButtonComponent from '../../components/button/button.js';
import IgcVirtualScrollComponent from '../../components/virtualization/virtualization.js';
import { defineAllComponents } from './defineAllComponents.js';

describe('defineAllComponents', () => {
  it('registers every component of the library', () => {
    defineAllComponents();

    expect(customElements.get(IgcButtonComponent.tagName)).to.equal(
      IgcButtonComponent
    );
    expect(customElements.get(IgcVirtualScrollComponent.tagName)).to.equal(
      IgcVirtualScrollComponent
    );
  });

  it('can run again without errors', () => {
    expect(() => defineAllComponents()).to.not.throw();
  });
});
