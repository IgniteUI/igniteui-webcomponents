import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcComboComponent from './combo.js';

afterEach(() => cleanupFixtures());

const data = [
  { id: 1, value: 1 },
  { id: 2, value: 2 },
];
const template = html`
  <igc-combo .data=${data} value-key="id" display-key="value"></igc-combo>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-combo`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcComboComponent>(template, {
        modules: ['./combo-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
