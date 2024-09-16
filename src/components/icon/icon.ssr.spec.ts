import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcIconComponent from './icon.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-icon name="input_clear" collection="default" aria-hidden="true">
  </igc-icon>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-icon`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcIconComponent>(template, {
        modules: ['./icon-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
