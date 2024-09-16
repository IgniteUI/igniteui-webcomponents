import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcTreeComponent from './tree.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-tree>
    <igc-tree-item label="Tree Item 1">
      <igc-tree-item label="Tree Item 1.1">
        <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
        <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
      </igc-tree-item>
      <igc-tree-item label="Tree Item 1.2">
        <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
        <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
      </igc-tree-item>
    </igc-tree-item>
  </igc-tree>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-tree`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcTreeComponent>(template, {
        modules: ['./tree-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
