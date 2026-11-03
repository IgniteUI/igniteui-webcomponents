import { defineCE, expect, fixture, html } from '@open-wc/testing';
import { finishAnimationsFor } from '../testing/helpers.spec.js';
import { isPopoverOpen } from '../utils/dom.js';
import { IgcBaseAlertLikeComponent } from './alert.js';

describe('Alert-like base component', () => {
  let tag: string;

  before(() => {
    tag = defineCE(class extends IgcBaseAlertLikeComponent {});
  });

  it('does not open in `container` positioning without a visible ancestor', async () => {
    const alert = document.createElement(tag) as IgcBaseAlertLikeComponent;
    alert.positioning = 'container';

    // A detached component has no visible ancestor.
    expect(await alert.show()).to.be.false;
    expect(alert.open).to.be.false;
  });

  it('resolves `hide()` to `false` during a `show()` that finds no visible ancestor', async () => {
    const alert = document.createElement(tag) as IgcBaseAlertLikeComponent;
    alert.positioning = 'container';

    const showing = alert.show();
    const hiding = alert.hide();

    expect(await showing).to.be.false;
    expect(await hiding).to.be.false;
    expect(alert.open).to.be.false;
  });

  it('opens on a `show()` in the same task after a refused one', async () => {
    const container = await fixture<HTMLElement>(html`<div></div>`);
    const alert = document.createElement(tag) as IgcBaseAlertLikeComponent;
    alert.positioning = 'container';
    alert.keepOpen = true;

    const refused = alert.show();
    container.append(alert);
    const showing = alert.show();
    finishAnimationsFor(alert);

    expect(await refused).to.be.false;
    expect(await showing).to.be.true;
    expect(alert.open).to.be.true;
  });

  it('opens once it gets a visible ancestor', async () => {
    const container = await fixture<HTMLElement>(html`<div></div>`);
    const alert = document.createElement(tag) as IgcBaseAlertLikeComponent;
    alert.positioning = 'container';
    alert.keepOpen = true;

    expect(await alert.show()).to.be.false;

    container.append(alert);
    await alert.updateComplete;

    expect(await alert.show()).to.be.true;
    expect(alert.open).to.be.true;
    expect(isPopoverOpen(alert)).to.be.true;
  });
});
