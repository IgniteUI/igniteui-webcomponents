import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import {
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
  shiftKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcAccordionComponent from './accordion.js';

describe('Accordion', () => {
  before(() => {
    defineComponents(IgcAccordionComponent);
  });

  let accordion: IgcAccordionComponent;
  let panels: IgcExpansionPanelComponent[];

  function getPanelHeader(panel: IgcExpansionPanelComponent) {
    return panel.renderRoot.querySelector<HTMLDivElement>(
      'div[part="header"]'
    )!;
  }

  function verifyPanelsOpenState(state: boolean[]) {
    expect(panels.map(({ open }) => open)).to.eql(state);
  }

  describe('Nested', () => {
    beforeEach(async () => {
      accordion = await fixture<IgcAccordionComponent>(createNestedAccordion());
    });

    it('is accessible', async () => {
      await expect(accordion).to.be.accessible();
      await expect(accordion).shadowDom.to.be.accessible();
    });

    it('should support rendering nested accordions', async () => {
      expect(accordion.panels).lengthOf(2);
      const panel = accordion.panels[0];

      await panel.show();

      const content = panel.renderRoot
        .querySelector<HTMLSlotElement>('slot:not([name])')!
        .assignedElements();
      expect(content[0].matches(IgcAccordionComponent.tagName)).to.be.true;
    });

    it('should navigate between direct child panels', async () => {
      const [first, last] = accordion.panels;

      simulateKeyboard(first, arrowDown);
      await elementUpdated(accordion);
      expect(last).to.equal(document.activeElement);

      simulateKeyboard(last, arrowUp);
      await elementUpdated(accordion);
      expect(first).to.equal(document.activeElement);
    });
  });

  describe('Default', () => {
    beforeEach(async () => {
      accordion = await fixture<IgcAccordionComponent>(createAccordion());
    });

    it('is accessible', async () => {
      await expect(accordion).to.be.accessible();
      await expect(accordion).shadowDom.to.be.accessible();
    });

    it('should render accordion w/ expansion panels and calculate them properly', async () => {
      expect(accordion.panels).lengthOf(3);
      expect(accordion).to.contain(IgcExpansionPanelComponent.tagName);
    });
  });

  describe('Expand & Collapse', () => {
    beforeEach(async () => {
      accordion = await fixture<IgcAccordionComponent>(createAccordion());
      panels = accordion.panels;
    });

    it('should update the current expansion state when `hideAll` is invoked', async () => {
      await accordion.hideAll();
      expect(panels.every((panel) => !panel.open)).to.be.true;
    });

    it('should update the current expansion state when `showAll` is invoked', async () => {
      await accordion.showAll();
      expect(panels.every((panel) => panel.open)).to.be.true;
    });

    it('should expand only one panel when `singleExpand` is set', async () => {
      accordion.singleExpand = true;
      await elementUpdated(accordion);

      simulateClick(getPanelHeader(panels[2]));
      await elementUpdated(accordion);
      verifyPanelsOpenState([false, false, true]);

      simulateClick(getPanelHeader(panels[0]));
      await elementUpdated(accordion);
      verifyPanelsOpenState([true, false, false]);
    });

    it('should expand multiple panels when `singleExpand` is not set', async () => {
      simulateClick(getPanelHeader(panels[2]));
      await elementUpdated(accordion);
      verifyPanelsOpenState([true, true, true]);
    });

    it('should preserve expanded panel when `singleExpand` is changed', async () => {
      accordion.singleExpand = true;
      simulateClick(getPanelHeader(panels[2]));
      await elementUpdated(accordion);

      verifyPanelsOpenState([false, false, true]);

      accordion.singleExpand = false;
      await elementUpdated(accordion);
      verifyPanelsOpenState([false, false, true]);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      accordion = await fixture<IgcAccordionComponent>(createAccordion());
      panels = accordion.panels;
    });

    it('should not navigate to a disabled panel', async () => {
      panels[1].disabled = true;
      await elementUpdated(panels[1]);

      simulateKeyboard(panels[0], arrowDown);
      await elementUpdated(accordion);

      expect(panels[1].matches(':focus')).to.be.false;
      expect(panels[2].matches(':focus')).to.be.true;
    });

    it('should navigate to the panel below on ArrowDown keypress', async () => {
      for (let i = 0; i < panels.length; i++) {
        simulateKeyboard(panels[i], arrowDown);
        await elementUpdated(accordion);
        expect(panels[Math.min(i + 1, 2)].matches(':focus')).to.be.true;
      }
    });

    it('should navigate to the panel above on ArrowUp keypress', async () => {
      for (let i = 2; i > 0; i--) {
        simulateKeyboard(panels[i], arrowUp);
        await elementUpdated(accordion);
        expect(panels[Math.max(i - 1, 0)].matches(':focus')).to.be.true;
      }
    });

    it('should expand the focused panel on Alt+ArrowDown keypress', async () => {
      simulateClick(getPanelHeader(panels[0]));
      await elementUpdated(accordion);

      expect(panels[0].matches(':focus')).to.be.true;
      expect(panels[0].open).to.be.false;

      simulateKeyboard(getPanelHeader(panels[0]), [altKey, arrowDown]);
      await elementUpdated(accordion);

      expect(panels[0].matches(':focus')).to.be.true;
      expect(panels[0].open).to.be.true;
    });

    it('should collapse the focused panel on Alt+ArrowUp keypress', async () => {
      simulateClick(getPanelHeader(panels[2]));
      await elementUpdated(accordion);

      expect(panels[2].matches(':focus')).to.be.true;
      expect(panels[2].open).to.be.true;

      simulateKeyboard(getPanelHeader(panels[2]), [altKey, arrowUp]);
      await elementUpdated(accordion);

      expect(panels[2].matches(':focus')).to.be.true;
      expect(panels[2].open).to.be.false;
    });

    it('should expand all non-disabled panels on Shift+Alt+ArrowDown keypress', async () => {
      await accordion.hideAll();
      verifyPanelsOpenState([false, false, false]);

      simulateKeyboard(panels[2], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);
      verifyPanelsOpenState([true, true, true]);
    });

    it('should not expand any disabled panels on Shift+Alt+ArrowDown keypress', async () => {
      panels[1].disabled = true;
      await panels[1].hide();

      simulateKeyboard(panels[2], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);
      verifyPanelsOpenState([true, false, true]);
    });

    it('should expand only the focused panel when `singleExpand` is set on Shift+Alt+ArrowDown keypress', async () => {
      accordion.singleExpand = true;
      simulateClick(getPanelHeader(panels[0]));
      await accordion.hideAll();

      expect(panels[0].matches(':focus')).to.be.true;
      verifyPanelsOpenState([false, false, false]);

      simulateKeyboard(panels[0], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);
      verifyPanelsOpenState([true, false, false]);
    });

    it('should collapse all non-disabled panels on Shift+Alt+ArrowUp keypress', async () => {
      await accordion.showAll();
      verifyPanelsOpenState([true, true, true]);

      simulateKeyboard(panels[2], [shiftKey, altKey, arrowUp]);
      await elementUpdated(accordion);
      verifyPanelsOpenState([false, false, false]);
    });

    it('should not collapse any disabled panels on Shift+Alt+ArrowUp keypress', async () => {
      panels[1].disabled = true;
      await accordion.showAll();
      verifyPanelsOpenState([true, true, true]);

      simulateKeyboard(panels[2], [shiftKey, altKey, arrowUp]);
      await elementUpdated(accordion);
      verifyPanelsOpenState([false, true, false]);
    });

    it('should navigate to first non-disabled panel on Home keypress', async () => {
      panels[0].disabled = true;
      await elementUpdated(accordion);

      simulateClick(getPanelHeader(panels[2]));
      await elementUpdated(accordion);
      expect(panels[2].matches(':focus')).to.be.true;

      simulateKeyboard(panels[2], homeKey);
      await elementUpdated(accordion);

      expect(panels[1].matches(':focus')).to.be.true;
      expect(panels[0].matches(':focus')).to.be.false;
    });

    it('should navigate to last non-disabled panel on End keypress', async () => {
      panels[2].disabled = true;
      await elementUpdated(accordion);

      simulateClick(getPanelHeader(panels[0]));
      await elementUpdated(accordion);
      expect(panels[0].matches(':focus')).to.be.true;

      simulateKeyboard(panels[0], endKey);
      await elementUpdated(accordion);

      expect(panels[1].matches(':focus')).to.be.true;
      expect(panels[2].matches(':focus')).to.be.false;
    });
  });
});

function createAccordion() {
  return html`
    <igc-accordion>
      <igc-expansion-panel open>
        <h1 slot="title">Expansion panel 1 title</h1>
        <h2 slot="subtitle">Expansion panel 1 subtitle</h2>
        <p>Sample content</p>
      </igc-expansion-panel>
      <igc-expansion-panel open>
        <h1 slot="title">Expansion panel 2 title</h1>
        <h2 slot="subtitle">Expansion panel 2 subtitle</h2>
        <p>Sample content</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <h1 slot="title">Expansion panel 3 title</h1>
        <h2 slot="subtitle">Expansion panel 3 subtitle</h2>
        <p>Sample content</p>
      </igc-expansion-panel>
    </igc-accordion>
  `;
}

function createNestedAccordion() {
  return html`
    <igc-accordion>
      <igc-expansion-panel open>
        <h1 slot="title">Expansion panel 1 title</h1>
        <h2 slot="subtitle">Expansion panel 1 subtitle</h2>
        <igc-accordion>
          <igc-expansion-panel>
            <h1 slot="title">Expansion panel 1.1 title</h1>
            <h2 slot="subtitle">Expansion panel 1.1 subtitle</h2>
            <p>Sample content 1.1</p>
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
      <igc-expansion-panel open>
        <h1 slot="title">Expansion panel 2 title</h1>
        <h2 slot="subtitle">Expansion panel 2 subtitle</h2>
        <p>Sample content 2</p>
      </igc-expansion-panel>
    </igc-accordion>
  `;
}
