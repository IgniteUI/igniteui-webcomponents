import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcBadgeComponent from './badge.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-badge shape="square"></igc-badge>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-accordion`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcBadgeComponent>(template, {
        modules: ['./badge-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
