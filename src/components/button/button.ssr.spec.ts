import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcButtonComponent from './button.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-button variant="outlined">Click</igc-button>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-button`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcButtonComponent>(template, {
        modules: ['./button-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
