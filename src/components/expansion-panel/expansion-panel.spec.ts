import { html, fixture, expect, unsafeStatic } from '@open-wc/testing';
import { defineComponents, IgcExpansionPanelComponent } from '../../index';

describe('Expansion Panel', () => {
  before(() => {
    defineComponents(IgcExpansionPanelComponent);
  });

  let panel: IgcExpansionPanelComponent;

  describe('', () => {
    beforeEach(async () => {
      panel = await createExpansionPanelComponent();
    });

    it('verify panel slots are rendered successfully.', async () => {
      /*const panel = await fixture<IgcExpansionPanelComponent>(
          html`<igc-expansion-panel></igc-expansion-panel>`
        );*/
      expect(panel).to.exist;
    });

    const createExpansionPanelComponent = (
      template = `<igc-expansion-panel></igc-expansion-panel>`
    ) => {
      return fixture<IgcExpansionPanelComponent>(
        html`${unsafeStatic(template)}`
      );
    };
  });
});
