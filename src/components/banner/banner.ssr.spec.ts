import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcBannerComponent from './banner.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-banner>You are currently offline!</igc-banner>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-banner`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcBannerComponent>(template, {
        modules: ['./banner-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
