import { expect } from '@open-wc/testing';
import { type SinonStub, stub } from 'sinon';
import { type IgniteComponent, registerComponent } from './register.js';

function createComponent(tagName: string): IgniteComponent {
  return class extends HTMLElement {
    public static readonly tagName = tagName;

    public static register(): void {
      registerComponent(this);
    }
  };
}

describe('registerComponent', () => {
  let warn: SinonStub;

  beforeEach(() => {
    warn = stub(console, 'warn');
  });

  afterEach(() => {
    warn.restore();
  });

  it('defines a component whose tag is free', () => {
    const component = createComponent('igc-register-spec-free');

    registerComponent(component);

    expect(customElements.get(component.tagName)).to.equal(component);
    expect(warn.called).to.be.false;
  });

  it('registers the dependencies before the component', () => {
    const dependency = createComponent('igc-register-spec-dependency');
    const component = createComponent('igc-register-spec-dependent');

    registerComponent(component, dependency);

    expect(customElements.get(dependency.tagName)).to.equal(dependency);
    expect(customElements.get(component.tagName)).to.equal(component);
  });

  it('does not warn when the same class registers again', () => {
    const component = createComponent('igc-register-spec-again');

    registerComponent(component);
    registerComponent(component);

    expect(warn.called).to.be.false;
  });

  it('warns once when another class owns the tag', () => {
    const owner = createComponent('igc-register-spec-owned');
    const other = createComponent(owner.tagName);

    customElements.define(owner.tagName, owner);
    registerComponent(other);
    registerComponent(other);

    expect(customElements.get(owner.tagName)).to.equal(owner);
    expect(warn.calledOnce).to.be.true;
    expect(warn.firstCall.args[0]).to.contain(`<${owner.tagName}>`);
  });
});
