import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcExpansionPanelComponent from './expansion-panel.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-expansion-panel id="panel">
    <h3 slot="title">Title</h3>
    <h3 slot="subtitle">Subtitle</h3>
    <p>Content</p>
  </igc-expansion-panel>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-expansion-panel`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcExpansionPanelComponent>(template, {
        modules: ['./expansion-panel-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
