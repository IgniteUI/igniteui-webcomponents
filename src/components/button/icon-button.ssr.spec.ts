import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcIconButtonComponent from './icon-button.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-icon-button name="icon" variant="outlined">Click</igc-icon-button>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-icon-button`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcIconButtonComponent>(template, {
        modules: ['./icon-button-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
