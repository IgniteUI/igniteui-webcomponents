import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcToastComponent from './toast.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-toast open>Snackbar</igc-toast>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-toast`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcToastComponent>(template, {
        modules: ['./toast-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
