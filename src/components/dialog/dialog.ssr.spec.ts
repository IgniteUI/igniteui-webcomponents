import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcDialogComponent from './dialog.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-dialog>Dialog</igc-dialog>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-dialog`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcDialogComponent>(template, {
        modules: ['./dialog-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
