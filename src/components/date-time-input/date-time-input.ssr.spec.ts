import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcDateTimeInputComponent from './date-time-input.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-date-time-input></igc-date-time-input>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-date-time-input`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcDateTimeInputComponent>(template, {
        modules: ['./date-time-input-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
