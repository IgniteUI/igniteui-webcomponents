import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcCalendarComponent from './calendar.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-calendar></igc-calendar>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-calendar`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcCalendarComponent>(template, {
        modules: ['./calendar-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
