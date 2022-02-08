import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import PopperTestComponent from './test.component.spec.js';
import { igcToggle } from './toggle.directive.js';
import { IToggleOptions } from './utilities.js';

describe('Toggle directive', () => {
  let popper: any;
  let target: HTMLElement;

  before(() => {
    customElements.define('test-popper', PopperTestComponent);
  });
  beforeEach(async () => {
    target = (await fixture(html`<span>Toggle</span>`)) as HTMLSpanElement;
  });

  afterEach(() => {
    [...document.getElementsByTagName('test-popper')].forEach((el) => {
      el.remove();
    });
  });

  it('is created with the values specified.', () => {
    let values = (igcToggle(target, false) as any).values;
    expect(values.length).to.equal(2);
    expect(values[0]).to.be.instanceof(HTMLSpanElement);
    expect(values[1]).to.equal(false);

    values = (
      igcToggle(target, true, {
        placement: 'top-start',
        positionStrategy: 'fixed',
      }) as any
    ).values;
    expect(values.length).to.equal(3);
    expect(values[0]).to.be.instanceof(HTMLSpanElement);
    expect(values[1]).to.equal(true);
    expect(values[2].placement).to.equal('top-start');
    expect(values[2].positionStrategy).to.equal('fixed');
  });

  it('successfully creates & shows the popper element.', async () => {
    popper = await createPopper(target, true);

    await expect(popper).to.be.accessible();
    const classList = popper.renderRoot.children[0].classList;
    expect(classList.contains('igc-toggle')).to.be.true;
    expect(classList.contains('igc-toggle-hidden')).to.be.false;
  });

  it('successfully creates the popper element with default options.', async () => {
    popper = await createPopper(target, false);

    expect(
      popper.renderRoot.children[0].classList.contains('igc-toggle-hidden')
    ).to.be.true;
    const popperEl = popper.renderRoot.children[0];
    const attributes = popperEl.attributes;

    expect(attributes.getNamedItem('data-popper-placement')?.value).to.equal(
      'bottom-start'
    );
    expect(attributes.getNamedItem('style')?.value).to.contain(
      'position: absolute'
    );
  });

  it('creates a popper with the passed options.', async () => {
    popper = await createPopper(target, true, {
      placement: 'bottom-end',
      positionStrategy: 'fixed',
    });

    const attributes = getAttributes(popper);
    expect(getPlacementValue(attributes)).to.equal('bottom-end');
    expect(getStyleValue(attributes)).to.contain('position: fixed');
  });

  it('does not create the popper without a target.', async () => {
    const div = document.querySelector('input') as HTMLElement;
    popper = await createPopper(div, true, {
      placement: 'bottom-end',
      positionStrategy: 'absolute',
    });

    const popperEl = popper.renderRoot.children[0];
    expect(popperEl.classList.contains('igc-toggle')).to.be.true;

    const attributes = popperEl.attributes;
    expect(attributes.getNamedItem('data-popper-placement')).not.to.exist;
    expect(attributes.getNamedItem('style')?.value).not.to.contain(
      'position: absolute'
    );
  });

  it('honors the flip option.', async () => {
    popper = await createPopper(target, true, {
      placement: 'left-start',
      positionStrategy: 'fixed',
      flip: true,
    });

    verifyPlacement(popper, 'right-start');
    popper = await createPopper(target, true, {
      placement: 'left-start',
      positionStrategy: 'absolute',
      flip: false,
    });
    verifyPlacement(popper, 'left-start');
  });

  it('properly reflects the offset if specified.', async () => {
    popper = await createPopper(target, true, {
      placement: 'right-start',
      positionStrategy: 'absolute',
      offset: { x: 100, y: 10 },
    });

    let targetRect = target.getBoundingClientRect();
    let toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.x).to.eq(Math.round(targetRect.right + 100));
    expect(toggleRect.y).to.eq(Math.round(targetRect.y + 10));

    document.getElementsByTagName('test-popper')[0].remove();

    popper = await createPopper(target, true, {
      placement: 'bottom-end',
      positionStrategy: 'absolute',
      offset: { x: 100, y: 10 },
    });

    targetRect = target.getBoundingClientRect();
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(Math.round(toggleRect.right)).to.eq(
      Math.round(targetRect.right + 100)
    );
    expect(toggleRect.y).to.eq(Math.round(targetRect.bottom + 10));

    document.getElementsByTagName('test-popper')[0].remove();

    popper = await createPopper(target, true, {
      placement: 'bottom-start',
      positionStrategy: 'absolute',
    });

    targetRect = target.getBoundingClientRect();
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.x).to.eq(targetRect.x);
    expect(toggleRect.y).to.eq(Math.round(targetRect.bottom));
  });

  it('honors the preventOverflow option.', async () => {
    target = document.body;
    popper = await createPopper(target, true, {
      placement: 'top',
      positionStrategy: 'absolute',
      preventOverflow: { altAxis: true },
    });

    let toggleRect = popper.renderRoot.children[0].getBoundingClientRect();
    expect(toggleRect.y).to.equal(0);

    popper = await createPopper(target, true, {
      placement: 'top',
      positionStrategy: 'absolute',
    });
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();
    expect(toggleRect.y).to.be.lessThan(0);
  });

  const createPopper = async (
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions
  ) => {
    const el = await fixture(new PopperTestComponent(target, open, options));

    await elementUpdated(el);
    await nextFrame();
    return el;
  };

  const getAttributes = (popper: any) => {
    const popperEl = popper.renderRoot.children[0];
    return popperEl.attributes;
  };

  const getPlacementValue = (attributes: any) => {
    return attributes.getNamedItem('data-popper-placement')?.value;
  };

  const getStyleValue = (attributes: any) => {
    return attributes.getNamedItem('style')?.value;
  };

  const verifyPlacement = (popper: any, placement: string) => {
    expect(getPlacementValue(getAttributes(popper))).to.equal(placement);
  };
});
