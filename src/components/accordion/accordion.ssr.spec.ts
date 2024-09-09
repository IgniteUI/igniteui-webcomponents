import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcAccordionComponent from './accordion.js';

afterEach(() => cleanupFixtures());

const template = html`
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
  </igc-accordion>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-accordion`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcAccordionComponent>(template, {
        modules: ['./accordion-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
