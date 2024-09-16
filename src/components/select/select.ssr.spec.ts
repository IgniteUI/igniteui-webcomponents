import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcSelectComponent from './select.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-select>
    <igc-select-header>Header</igc-select-header>
    <igc-select-group>
      <igc-select-item>1</igc-select-item>
      <igc-select-item>2</igc-select-item>
    </igc-select-group>
  </igc-select>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-select`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcSelectComponent>(template, {
        modules: ['./select-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
