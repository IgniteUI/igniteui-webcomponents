import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';

import { IgcExpansionPanelComponent, defineComponents } from '../../index.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
  shiftKey,
} from '../common/controllers/key-bindings.js';
import { simulateKeyboard } from '../common/utils.spec.js';
import IgcAccordionComponent from './accordion.js';

describe('Accordion', () => {
  before(() => {
    defineComponents(IgcAccordionComponent, IgcExpansionPanelComponent);
  });

  let accordion: IgcAccordionComponent;

  beforeEach(async () => {
    accordion = await createAccordionComponent(testTemplate);
  });

  describe('Basic', () => {
    it('Passes the a11y audit', async () => {
      await expect(accordion).shadowDom.to.be.accessible();
    });

    it('Should render accordion w/ expansion panels and calculate them properly', async () => {
      expect(accordion.panels.length).to.equal(3);
      expect(accordion).to.contain('igc-expansion-panel');
    });

    it('Should be able to render nested accordions', async () => {
      accordion = await createAccordionComponent(nestedAccTemplate);
      expect(accordion.panels.length).to.equal(2);

      accordion.panels[0].show();
      await elementUpdated(accordion);

      const contentSlot = accordion.panels[0].shadowRoot!.querySelector(
        'slot:not([name])'
      ) as HTMLSlotElement;
      const contentElements = contentSlot.assignedElements();
      expect(contentElements[0].tagName.toLowerCase()).to.equal(
        'igc-accordion'
      );
    });
  });

  describe('Expand/Collapse', () => {
    it('Should update the current expansion state when hideAll is invoked', async () => {
      accordion.hideAll();
      await elementUpdated(accordion);

      accordion.panels.forEach((p) => expect(p.open).to.be.false);
    });

    it('Should update the current expansion state when showAll is invoked', async () => {
      accordion.showAll();
      await elementUpdated(accordion);

      accordion.panels.forEach((p) => expect(p.open).to.be.true);
    });

    it('Should be able to expand only one panel when singleExpand is set to true', async () => {
      accordion.singleExpand = true;
      await elementUpdated(accordion);

      const header3 =
        accordion.panels[2].shadowRoot?.querySelector('div[part="header"]');
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;

      const header1 =
        accordion.panels[0].shadowRoot?.querySelector('div[part="header"]');
      header1?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should be able to expand multiple panels when singleExpand is set to false', async () => {
      expect(accordion.singleExpand).to.be.false;
      expect(accordion.panels[2].open).to.be.false;

      const header3 =
        accordion.panels[2].shadowRoot?.querySelector('div[part="header"]');
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.true;
      expect(accordion.panels[2].open).to.be.true;
    });

    it('Should preserve expanded panel when singleExpand is changed from false to true', async () => {
      expect(accordion.singleExpand).to.be.false;
      accordion.singleExpand = true;
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.true;
      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should preserve expanded panel when singleExpand is changed from true to false', async () => {
      accordion.singleExpand = true;
      await elementUpdated(accordion);

      const header3 =
        accordion.panels[2].shadowRoot?.querySelector('div[part="header"]');
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;

      accordion.singleExpand = false;
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;
    });
  });

  describe('Keyboard navigation', () => {
    it('Should navigate to the panel below on ArrowDown key press', async () => {
      simulateKeyboard(accordion.panels[0], arrowDown);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);

      // Should not navigate to a disabled panel
      accordion.panels[2].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[1], arrowDown);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);
    });

    it('Should navigate to the panel above on Arrow Up key press', async () => {
      simulateKeyboard(accordion.panels[2], arrowUp);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);

      // Should not navigate to a disabled panel
      accordion.panels[0].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[1], arrowUp);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);
    });

    it('Should navigate between direct child panels only (nested accordion scenario)', async () => {
      accordion = await createAccordionComponent(nestedAccTemplate);

      simulateKeyboard(accordion.panels[0], arrowDown);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);
      let titleSlot = accordion.panels[1].shadowRoot!.querySelector(
        'slot[name="title"]'
      ) as HTMLSlotElement;

      let elements = titleSlot.assignedElements();
      expect((elements[0] as HTMLElement).innerText).to.equal(
        'Expansion panel 2 title'
      );

      simulateKeyboard(accordion.panels[1], arrowUp);
      await elementUpdated(accordion);

      expect(accordion.panels[0]).to.equal(document.activeElement);
      titleSlot = accordion.panels[0].shadowRoot!.querySelector(
        'slot[name="title"]'
      ) as HTMLSlotElement;

      elements = titleSlot.assignedElements();
      expect((elements[0] as HTMLElement).innerText).to.equal(
        'Expansion panel 1 title'
      );
    });

    it('Should expand the focused panel on ALT + Arrow Down key press', async () => {
      const header1 = accordion.panels[0].shadowRoot?.querySelector(
        'div[part="header"]'
      ) as HTMLElement;
      header1?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0]).to.equal(document.activeElement);
      expect(accordion.panels[0].open).to.be.false;

      simulateKeyboard(header1, [altKey, arrowDown]);
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
    });

    it('Should collapse the focused panel on ALT + Arrow Up key press', async () => {
      const header3 = accordion.panels[2].shadowRoot?.querySelector(
        'div[part="header"]'
      ) as HTMLElement;
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[2]).to.equal(document.activeElement);
      expect(accordion.panels[2].open).to.be.true;

      simulateKeyboard(header3, [altKey, arrowUp]);
      await elementUpdated(accordion);

      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should expand all panels when singleExpand is false on Shift + Alt + Arrow Down key press', async () => {
      expect(accordion.singleExpand).to.be.false;
      expect(accordion.panels[2].open).to.be.false;

      simulateKeyboard(accordion.panels[2], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);

      accordion.panels.forEach((p) => expect(p.open).to.be.true);

      // Should not expand disabled panels on Shift + Alt + Arrow Down
      accordion.panels[1].hide();
      accordion.panels[1].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[2], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;
    });

    it('Should expand only the focused panel when singleExpand is true on Shift + Alt + Arrow Down key press', async () => {
      accordion.singleExpand = true;

      const header1 = accordion.panels[0].shadowRoot?.querySelector(
        'div[part="header"]'
      ) as HTMLElement;
      header1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      accordion.hideAll();
      await elementUpdated(accordion);

      expect(accordion.panels[0]).to.equal(document.activeElement);
      expect(accordion.panels[0].open).to.be.false;

      simulateKeyboard(accordion.panels[0], [shiftKey, altKey, arrowDown]);
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should collapse all panels on Shift + Alt + Arrow Up key press', async () => {
      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.true;

      simulateKeyboard(accordion.panels[0], [shiftKey, altKey, arrowUp]);
      await elementUpdated(accordion);

      accordion.panels.forEach((p) => expect(p.open).to.be.false);

      accordion.singleExpand = true;
      accordion.panels[0].show();
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[0], [shiftKey, altKey, arrowUp]);
      await elementUpdated(accordion);

      accordion.panels.forEach((p) => expect(p.open).to.be.false);

      // Should not collapse disabled panels on Shift + Alt + Arrow Up
      accordion.panels[1].show();
      accordion.panels[1].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[2], [shiftKey, altKey, arrowUp]);
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.true;
      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should navigate to the first panel on Home key press', async () => {
      simulateKeyboard(accordion.panels[2], homeKey);
      await elementUpdated(accordion);

      expect(accordion.panels[0]).to.equal(document.activeElement);

      // Should navigate to the first enabled panel in case there are disabled ones
      accordion.panels[0].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[2], homeKey);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);
    });

    it('Should navigate to the last panel on End key press', async () => {
      simulateKeyboard(accordion.panels[0], endKey);
      await elementUpdated(accordion);

      expect(accordion.panels[2]).to.equal(document.activeElement);

      // Should navigate to the last enabled panel in case there are disabled ones
      accordion.panels[2].disabled = true;
      await elementUpdated(accordion);

      simulateKeyboard(accordion.panels[0], endKey);
      await elementUpdated(accordion);

      expect(accordion.panels[1]).to.equal(document.activeElement);
    });
  });

  const createAccordionComponent = (
    template = `<igc-accordion></igc-accordion>`
  ) => {
    return fixture<IgcAccordionComponent>(html`${unsafeStatic(template)}`);
  };
});

const testTemplate = `
<igc-accordion>
    <igc-expansion-panel open>
        <h1 slot="title">
            Expansion panel 1 title
        </h1>
        <h2 slot="subtitle">Expansion panel 1 subtitle</h2>
        <p>Sample content 1</p>
    </igc-expansion-panel>
    <igc-expansion-panel open>
        <h1 slot="title">
            Expansion panel 2 title
        </h1>
        <h2 slot="subtitle">Expansion panel 2 subtitle</h2>
        <p>Sample content 2</p>
    </igc-expansion-panel>
    <igc-expansion-panel>
        <h1 slot="title">
            Expansion panel 3 title
        </h1>
        <h2 slot="subtitle">Expansion panel 3 subtitle</h2>
        <p>Sample content 3</p>
    </igc-expansion-panel>
</igc-accordion>
`;

const nestedAccTemplate = `
<igc-accordion>
    <igc-expansion-panel open>
        <h1 slot="title">
            Expansion panel 1 title
        </h1>
        <h2 slot="subtitle">Expansion panel 1 subtitle</h2>
        <igc-accordion>
          <igc-expansion-panel>
              <h1 slot="title">
                  Expansion panel 1.1 title
              </h1>
              <h2 slot="subtitle">Expansion panel 1.1 subtitle</h2>
              <p>Sample content 1.1</p>
          </igc-expansion-panel>
        </igc-accordion>
    </igc-expansion-panel>
    <igc-expansion-panel open>
      <h1 slot="title">
          Expansion panel 2 title
      </h1>
      <h2 slot="subtitle">Expansion panel 2 subtitle</h2>
      <p>Sample content 2</p>
    </igc-expansion-panel>
</igc-accordion>
`;
