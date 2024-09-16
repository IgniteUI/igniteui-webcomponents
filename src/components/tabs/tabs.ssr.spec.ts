import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcTabsComponent from './tabs.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-tabs>
    <igc-tab panel="first">Tab 1</igc-tab>
    <igc-tab panel="second" selected>Tab 2</igc-tab>
    <igc-tab panel="third">Tab 3</igc-tab>
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
    <igc-tab-panel id="third">Content 3</igc-tab-panel>
  </igc-tabs>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-tabs`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcTabsComponent>(template, {
        modules: ['./tabs-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
