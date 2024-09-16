import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcRadioComponent from './radio.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-radio value="50"></igc-radio>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-radio`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcRadioComponent>(template, {
        modules: ['./radio-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
