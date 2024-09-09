import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcButtonGroupComponent from './button-group.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-button-group>
    <igc-toggle-button value="left">Left</igc-toggle-button>
    <igc-toggle-button value="center">Center</igc-toggle-button>
    <igc-toggle-button value="right">Right</igc-toggle-button>
  </igc-button-group>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-button-group`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcButtonGroupComponent>(template, {
        modules: ['./button-group-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
