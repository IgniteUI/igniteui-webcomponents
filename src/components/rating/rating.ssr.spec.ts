import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcRatingComponent from './rating.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-rating value="3"></igc-rating>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-rating`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcRatingComponent>(template, {
        modules: ['./rating-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
