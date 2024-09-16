import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcRippleComponent from './ripple.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-button>
    Click
    <igc-ripple></igc-ripple>
  </igc-button>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-ripple`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcRippleComponent>(template, {
        modules: [
          './ripple-auto-register.js',
          '../button/button-auto-register.js',
        ],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
