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

  describe('Basic', () => {
    beforeEach(async () => {
      accordion = await createAccordionComponent(testTemplate);
    });

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

    const createAccordionComponent = (
      template = `<igc-accordion></igc-accordion>`
    ) => {
      return fixture<IgcAccordionComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

const testTemplate = `
<igc-accordion>
    <igc-expansion-panel>
        <h1 slot="title">
            Expansion panel 1 title
        </h1>
        <h2 slot="subtitle">Expansion panel 1 subtitle</h2>
        <p>Sample content 1</p> 
    </igc-expansion-panel>
    <igc-expansion-panel>
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
