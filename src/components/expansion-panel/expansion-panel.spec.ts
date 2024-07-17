import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';

import {
  altKey,
  arrowDown,
  arrowUp,
  enterKey,
  spaceBar,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateKeyboard } from '../common/utils.spec.js';
import type IgcIconComponent from '../icon/icon.js';
import IgcExpansionPanelComponent from './expansion-panel.js';

type ExpansionSlots =
  | ''
  | 'title'
  | 'subtitle'
  | 'indicator'
  | 'indicator-expanded';

type ExpansionParts = 'header' | 'title' | 'subtitle' | 'content' | 'indicator';

describe('Expansion Panel', () => {
  before(() => {
    defineComponents(IgcExpansionPanelComponent);
  });

  let panel: IgcExpansionPanelComponent;
  let eventSpy: ReturnType<typeof spy>;

  const getSlot = (name: ExpansionSlots = '') => {
    return panel.shadowRoot!.querySelector<HTMLSlotElement>(
      `slot${name ? `[name=${name}]` : ':not([name])'}`
    ) as HTMLSlotElement;
  };

  const getDOMPart = (name: ExpansionParts) => {
    return panel.shadowRoot!.querySelector(`[part=${name}]`) as HTMLElement;
  };

  const createDefaultPanel = () => html`
    <igc-expansion-panel id="panel">
      <h3 slot="title">Title</h3>
      <h3 slot="subtitle">Subtitle</h3>
      <p>Content</p>
    </igc-expansion-panel>
  `;

  const verifyStateAndEventSequence = (
    state: { open: boolean } = { open: false }
  ) => {
    expect(panel.open).to.equal(state.open);
    expect(eventSpy.callCount).to.equal(2);
    expect(eventSpy.firstCall).calledWith(
      state.open ? 'igcOpening' : 'igcClosing',
      { cancelable: true, detail: panel }
    );
    expect(eventSpy.secondCall).calledWith(
      state.open ? 'igcOpened' : 'igcClosed',
      {
        detail: panel,
      }
    );
  };

  describe('DOM structure', () => {
    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createDefaultPanel());
    });

    it('is accessible', async () => {
      await expect(panel).shadowDom.to.be.accessible();
      await expect(panel).to.be.accessible();
    });

    it('has proper default Shadow DOM', async () => {
      expect(panel).shadowDom.to.equal(
        `<div
          aria-controls="panel-content"
          aria-disabled="false"
          aria-expanded="false"
          id="panel-header"
          part="header"
          role="button"
          tabindex="0"
        >
          <div part="indicator" aria-hidden="true">
            <slot name="indicator">
              <igc-icon collection="default" name="expand"></igc-icon>
            </slot>
            <slot name="indicator-expanded" hidden>
            </slot>
          </div>
          <div>
            <slot name="title" part="title"></slot>
            <slot name="subtitle" part="subtitle"></slot>
          </div>
        </div>
        <div
          aria-hidden="true"
          inert
          aria-labelledby="panel-header"
          id="panel-content"
          part="content"
          role="region"
        >
          <slot></slot>
        </div>
      `
      );
    });

    it('has correct slot projection', async () => {
      const slots: ExpansionSlots[] = ['', 'title', 'subtitle'];

      for (const slot of slots) {
        expect(getSlot(slot).assignedNodes().length).to.be.greaterThan(0);
      }
    });
  });

  describe('DOM structure - indicator slots', () => {
    const getIcon = (name: string) =>
      panel.querySelector(`[name=${name}]`) as IgcIconComponent;

    const createPanel = (openState = false) => html`
      <igc-expansion-panel id="panel" ?open=${openState}>
        <h2 slot="title">Title</h2>
        <h3 slot="subtitle">Subtitle</h3>
        <igc-icon
          slot="indicator"
          name=${openState ? 'open-state' : 'closed-state'}
        ></igc-icon>
        Content
      </igc-expansion-panel>
    `;

    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createPanel());
    });

    it('has correct indicator slot state based on projected content', async () => {
      expect(getSlot('indicator').assignedElements().length).to.equal(1);
      expect(getSlot('indicator').hidden).to.be.false;
      expect(getIcon('closed-state')).not.to.be.null;
      expect(getSlot('indicator-expanded').hidden).to.be.true;
    });

    it('renders `indicator` slot in correct state if `indicator-expanded` is not projected', async () => {
      expect(panel.open).to.be.false;
      expect(getIcon('closed-state')).not.to.be.null;
      panel.remove();

      panel = await fixture<IgcExpansionPanelComponent>(createPanel(true));

      expect(panel.open).to.be.true;
      expect(getIcon('closed-state')).to.be.null;
      expect(getIcon('open-state')).not.to.be.null;
    });

    it('renders `indicator-expanded` instead of `indicator` on open state if projected', async () => {
      const element = document.createElement('igc-icon');
      element.setAttribute('name', 'expand-icon');
      element.setAttribute('slot', 'indicator-expanded');

      panel.appendChild(element);
      panel.open = true;
      await elementUpdated(panel);

      expect(getSlot('indicator').hidden).to.be.true;
      expect(getSlot('indicator-expanded').hidden).to.be.false;
      expect(getSlot('indicator-expanded').assignedElements().length).to.equal(
        1
      );

      panel.open = false;
      await elementUpdated(panel);

      expect(getSlot('indicator').hidden).to.be.false;
      expect(getSlot('indicator-expanded').hidden).to.be.true;
    });
  });

  describe('Properties', () => {
    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createDefaultPanel());
    });

    it('should control expanded/collapsed state through open attribute', async () => {
      expect(panel).to.not.have.attribute('open');
      expect(getDOMPart('content')).dom.to.equal(
        `<div
          aria-hidden="true"
          aria-labelledby="panel-header"
          id="panel-content"
          inert
          part="content"
          role="region"
        >
          <slot></slot>
        </div>`
      );

      panel.open = true;
      await elementUpdated(panel);

      expect(panel).to.have.attribute('open');
      expect(getDOMPart('content')).dom.to.equal(
        `<div
          aria-hidden="false"
          aria-labelledby="panel-header"
          id="panel-content"
          part="content"
          role="region"
        >
          <slot></slot>
        </div>`
      );
    });

    it('should set indicator position correctly', async () => {
      const positions: IgcExpansionPanelComponent['indicatorPosition'][] = [
        'none',
        'start',
        'end',
      ];

      for (const position of positions) {
        panel.indicatorPosition = position;
        await elementUpdated(panel);

        expect(panel).dom.to.equal(
          `<igc-expansion-panel id="panel" indicator-position="${position}">
            <p>Content</p>
          </igc-expansion-panel>`,
          { ignoreTags: ['h2', 'h3'] }
        );
      }
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createDefaultPanel());
    });

    it('should toggle open state on `show()/hide()` methods', async () => {
      panel.show();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;
      expect(getDOMPart('content')).to.not.have.attribute('inert');

      panel.hide();
      await elementUpdated(panel);

      expect(panel.open).to.be.false;
      expect(getDOMPart('content')).to.have.attribute('inert');
    });

    it('should toggle open state on `toggle()`', async () => {
      panel.toggle();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;
      expect(getDOMPart('content')).to.not.have.attribute('inert');

      panel.toggle();
      await elementUpdated(panel);

      expect(panel.open).to.be.false;
      expect(getDOMPart('content')).to.have.attribute('inert');
    });
  });

  describe('User interactions', () => {
    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createDefaultPanel());
      eventSpy = spy(panel, 'emitEvent');
    });

    it('should expand/collapse on header click', async () => {
      const header = getDOMPart('header');

      header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      verifyStateAndEventSequence({ open: true });

      eventSpy.resetHistory();

      header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      verifyStateAndEventSequence({ open: false });
    });

    it('should expand/collapse on "activation" keydown', async () => {
      const header = getDOMPart('header');

      simulateKeyboard(header, spaceBar);
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      verifyStateAndEventSequence({ open: true });

      eventSpy.resetHistory();

      simulateKeyboard(header, enterKey);
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      verifyStateAndEventSequence({ open: false });
    });

    it('should expand/collapse on Alt + Arrow keys', async () => {
      const header = getDOMPart('header');

      simulateKeyboard(header, [altKey, arrowDown]);
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      verifyStateAndEventSequence({ open: true });

      eventSpy.resetHistory();

      simulateKeyboard(header, [altKey, arrowUp]);
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      verifyStateAndEventSequence({ open: false });
    });

    it('should not expand when disabled', async () => {
      const header = getDOMPart('header');

      panel.disabled = true;
      await elementUpdated(panel);

      simulateKeyboard(header, enterKey);
      await elementUpdated(panel);

      expect(panel.open).to.be.false;
      expect(eventSpy.callCount).to.equal(0);

      header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;
      expect(eventSpy.callCount).to.equal(0);
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      panel = await fixture<IgcExpansionPanelComponent>(createDefaultPanel());
      eventSpy = spy(panel, 'emitEvent');
    });

    it('does not emit duplicate events for expanded/collapsed state on Alt + Arrow keys', async () => {
      const header = getDOMPart('header');

      simulateKeyboard(header, [altKey, arrowDown]);
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      verifyStateAndEventSequence({ open: true });

      simulateKeyboard(header, [altKey, arrowDown]);
      await elementUpdated(panel);

      expect(eventSpy.callCount).to.equal(2);

      eventSpy.resetHistory();

      simulateKeyboard(header, [altKey, arrowUp]);
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      verifyStateAndEventSequence({ open: false });

      simulateKeyboard(header, [altKey, arrowUp]);
      await elementUpdated(panel);

      expect(eventSpy.callCount).to.equal(2);
    });

    it('should be able to cancel -ing events', async () => {
      const header = getDOMPart('header');

      panel.addEventListener('igcOpening', (e) => e.preventDefault(), {
        once: true,
      });

      simulateKeyboard(header, enterKey);
      await elementUpdated(panel);

      expect(panel.open).to.be.false;
      expect(eventSpy).calledOnceWith('igcOpening', {
        cancelable: true,
        detail: panel,
      });

      eventSpy.resetHistory();

      panel.open = true;
      await elementUpdated(panel);

      panel.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      simulateKeyboard(header, enterKey);
      await elementUpdated(panel);

      expect(panel.open).to.be.true;
      expect(eventSpy).calledOnceWith('igcClosing', {
        cancelable: true,
        detail: panel,
      });
    });
  });
});
