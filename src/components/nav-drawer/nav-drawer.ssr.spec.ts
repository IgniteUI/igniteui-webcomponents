import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcNavDrawerComponent from './nav-drawer.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-nav-drawer>
    <igc-nav-drawer-header-item>Header</igc-nav-drawer-header-item>
    <igc-nav-drawer-item active>1</igc-nav-drawer-item>
    <igc-nav-drawer-item>2</igc-nav-drawer-item>
  </igc-nav-drawer>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-nav-drawer`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcNavDrawerComponent>(template, {
        modules: ['./nav-drawer-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
