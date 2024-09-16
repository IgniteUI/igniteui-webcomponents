import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcRadioGroupComponent from './radio-group.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-radio-group name="group" value="1">
    <igc-radio value="1">1</igc-radio>
    <igc-radio value="2">2</igc-radio>
    <igc-radio value="3">3</igc-radio>
  </igc-radio-group>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-radio-group`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcRadioGroupComponent>(template, {
        modules: ['./radio-group-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
