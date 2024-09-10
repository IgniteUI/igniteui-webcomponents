import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcTextareaComponent from './textarea.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-textarea>Textarea content</igc-textarea>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-textarea`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcTextareaComponent>(template, {
        modules: ['./textarea-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
