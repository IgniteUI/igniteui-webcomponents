import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcListComponent from './list.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-list>
    <igc-list-header>Header</igc-list-header>
    <igc-list-item>1</igc-list-item>
    <igc-list-item>2</igc-list-item>
  </igc-list>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-list`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcListComponent>(template, {
        modules: ['./list-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
