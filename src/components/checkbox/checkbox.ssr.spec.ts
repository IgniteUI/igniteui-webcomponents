import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcCheckboxComponent from './checkbox.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-checkbox checked>Label</igc-checkbox>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-checkbox`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcCheckboxComponent>(template, {
        modules: ['./checkbox-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
