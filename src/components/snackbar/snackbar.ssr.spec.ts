import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcSnackbarComponent from './snackbar.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-snackbar open>Snackbar</igc-snackbar>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-snackbar`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcSnackbarComponent>(template, {
        modules: ['./snackbar-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
