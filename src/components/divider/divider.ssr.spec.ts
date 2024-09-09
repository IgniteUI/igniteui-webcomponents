import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcDividerComponent from './divider.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-divider type="dashed"></igc-divider>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-divider`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcDividerComponent>(template, {
        modules: ['./divider-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
