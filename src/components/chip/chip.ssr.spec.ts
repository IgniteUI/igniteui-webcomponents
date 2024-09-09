import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcChipComponent from './chip.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-chip selectable removable>Chip</igc-chip>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-chip`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcChipComponent>(template, {
        modules: ['./chip-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
