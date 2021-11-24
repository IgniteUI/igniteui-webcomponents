import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { DirectiveResult } from 'lit/directive.js';
// import { IgcToggleController } from './toggle.controller';
import { igcToggle, IgcToggleDirective } from './toggle.directive.js';
import { IToggleOptions } from './utilities.js';

describe.only('Toggle Directive', () => {
  let toggleDir: DirectiveResult<typeof IgcToggleDirective>;
  let popper: PopperTestComponent;
  let target: HTMLDivElement;

  beforeEach(async () => {
    target = (await fixture(html`<div>Toggle</div>`)) as HTMLDivElement;
    popper = await fixture<PopperTestComponent>(
      html`<test-popper .target=${target}></test-popper>`
    );
    // popper.target = target;
    await elementUpdated(popper);
    toggleDir = popper.toggleDirective;
  });

  it('is created successfully', () => {
    expect(toggleDir).not.to.be.undefined;
  });

  it('is created with the values specified.', () => {
    const values = toggleDir.values;
    expect(values.length).to.equal(2);
    expect(values[0]).to.be.instanceof(HTMLDivElement);
    expect(values[1]).to.equal(false);
  });

  it('default options are properly set.', () => {
    expect((toggleDir as any)._defaultOptions).to.equal({
      placement: 'bottom-start',
      strategy: 'absolute',
      flip: false,
    });
  });

  it('successfully creates the popper element.', () => {
    expect(popper).to.be.accessible;
    expect((toggleDir as any)._instance).not.to.be.undefined;
  });
});

class PopperTestComponent extends LitElement {
  public toggleDirective!: DirectiveResult<typeof IgcToggleDirective>;
  public target!: HTMLElement;
  public options!: IToggleOptions;
  protected render() {
    this.toggleDirective = igcToggle(this.target, false, this.options);
    return html`${this.toggleDirective}
      <div>Toggle Content</div>`;
  }
}

window.customElements.define('test-popper', PopperTestComponent);
