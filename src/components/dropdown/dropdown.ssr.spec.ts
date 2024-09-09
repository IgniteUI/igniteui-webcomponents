import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcDropdownComponent from './dropdown.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-dropdown>
    <button slot="target">Click</button>
    <igc-dropdown-header>Header</igc-dropdown-header>
    <igc-dropdown-group>
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
    </igc-dropdown-group>
  </igc-dropdown>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-dropdown`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcDropdownComponent>(template, {
        modules: ['./dropdown-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
