import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import {
  INNER_EVENTS_HOOK,
  takeInnerEventLeaks,
} from '#internals/testing/inner-events.spec.js';
import { stopPropagation } from '#internals/utils/events.js';

/** A composite with an inner element that stops `igcPing`, and one that does not. */
class IgcInnerEventProbe extends LitElement {
  protected override render() {
    return html`
      <div id="open"></div>
      <div id="stopped" @igcPing=${stopPropagation}></div>
    `;
  }
}

// Root teardown hooks of this file. The checks of the guard run after them.
afterEach('spec teardown', () => {});
after('spec teardown', () => {});

describe('Inner event guard', () => {
  let probe: IgcInnerEventProbe;

  function ping(target: Element, init?: CustomEventInit): void {
    target.dispatchEvent(
      new CustomEvent('igcPing', { bubbles: true, composed: true, ...init })
    );
  }

  function inner(id: string): Element {
    return probe.renderRoot.querySelector(`#${id}`)!;
  }

  before(() => {
    if (!customElements.get('igc-inner-event-probe')) {
      customElements.define('igc-inner-event-probe', IgcInnerEventProbe);
    }
  });

  beforeEach(async () => {
    probe = await fixture(
      html`<igc-inner-event-probe></igc-inner-event-probe>`
    );
  });

  afterEach(() => {
    takeInnerEventLeaks();
  });

  it('records an inner event that reaches the host', () => {
    ping(inner('open'));

    expect(takeInnerEventLeaks()).to.deep.equal([
      'igc-inner-event-probe > div: igcPing',
    ]);
  });

  it('records a composed inner event that does not bubble', () => {
    ping(inner('open'), { bubbles: false });

    expect(takeInnerEventLeaks()).to.deep.equal([
      'igc-inner-event-probe > div: igcPing',
    ]);
  });

  it('ignores an inner event that the composite stops', () => {
    ping(inner('stopped'));

    expect(takeInnerEventLeaks()).to.be.empty;
  });

  it('ignores the events of the host and non-composed inner events', () => {
    ping(probe);
    ping(inner('open'), { composed: false });

    expect(takeInnerEventLeaks()).to.be.empty;
  });

  it('checks after the root teardown hooks of the spec file', function () {
    let root = this.test!.parent!;

    while (root.parent) {
      root = root.parent;
    }

    // `getHooks` is not in the typings of mocha.
    const hooks = root as unknown as { getHooks(name: string): Mocha.Hook[] };

    for (const name of ['afterEach', 'afterAll']) {
      const [spec, guard] = hooks.getHooks(name).slice(-2);

      // Mocha adds the suite to the title of a hook that has run.
      expect(spec.title).to.include('hook: spec teardown');
      expect(guard.title).to.include(`hook: ${INNER_EVENTS_HOOK}`);
    }
  });
});
