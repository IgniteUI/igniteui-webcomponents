import { html, fixture, expect, unsafeStatic } from '@open-wc/testing';
import { defineComponents } from '../../index';
import IgcAccordionComponent from './accordion';

describe('Accordion', () => {
  before(() => {
    defineComponents(IgcAccordionComponent);
  });

  let accordion: IgcAccordionComponent;

  describe('', () => {
    beforeEach(async () => {
      accordion = await createAccordionComponent(testTemplate);
    });

    it('Passes the a11y audit', async () => {
      await expect(accordion).shadowDom.to.be.accessible();
    });

    it('Should render accordion w/ expansion panels', async () => {
      expect(accordion.panels.length).to.equal(3);
      expect(accordion).to.contain('igc-expansion-panel');
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
