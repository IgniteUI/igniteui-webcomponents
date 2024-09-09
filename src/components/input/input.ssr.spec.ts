import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcInputComponent from './input.js';

afterEach(() => cleanupFixtures());

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-input`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcInputComponent>(
        html`<igc-input value="Hello world"></igc-input>`,
        {
          modules: ['./input-auto-register.js'],
        }
      );

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
