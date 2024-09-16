import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcNavbarComponent from './navbar.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-navbar>Navigation</igc-navbar>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-navbar`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcNavbarComponent>(template, {
        modules: ['./navbar-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
