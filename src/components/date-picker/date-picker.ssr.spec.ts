import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcDatePickerComponent from './date-picker.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-date-picker></igc-date-picker>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-date-picker`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcDatePickerComponent>(template, {
        modules: ['./date-picker-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
