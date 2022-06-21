import {
  html,
  fixture,
  expect,
  unsafeStatic,
  elementUpdated,
} from '@open-wc/testing';
import { defineComponents } from '../../index.js';
import IgcAccordionComponent from './accordion.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';

describe('Accordion', () => {
  before(() => {
    defineComponents(IgcExpansionPanelComponent, IgcAccordionComponent);
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
      expect(accordion.panels.length).to.equal(1);

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

    it('Should be able to expand only one panel when singleBranchExpand is set to true', async () => {
      accordion.singleBranchExpand = true;
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

    it('Should be able to expand multiple panels when singleBranchExpand is set to false', async () => {
      expect(accordion.singleBranchExpand).to.be.false;
      expect(accordion.panels[2].open).to.be.false;

      const header3 =
        accordion.panels[2].shadowRoot?.querySelector('div[part="header"]');
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.true;
      expect(accordion.panels[2].open).to.be.true;
    });

    it('Should preserve expanded panel when singleBranchExpand is changed from false to true', async () => {
      expect(accordion.singleBranchExpand).to.be.false;
      accordion.singleBranchExpand = true;
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.true;
      expect(accordion.panels[1].open).to.be.true;
      expect(accordion.panels[2].open).to.be.false;
    });

    it('Should preserve expanded panel when singleBranchExpand is changed from true to false', async () => {
      accordion.singleBranchExpand = true;
      await elementUpdated(accordion);

      const header3 =
        accordion.panels[2].shadowRoot?.querySelector('div[part="header"]');
      header3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;

      accordion.singleBranchExpand = false;
      await elementUpdated(accordion);

      expect(accordion.panels[0].open).to.be.false;
      expect(accordion.panels[1].open).to.be.false;
      expect(accordion.panels[2].open).to.be.true;
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
    <igc-expansion-panel>
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
</igc-accordion>
`;
