import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcAvatarComponent from './avatar.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-avatar initials="IG"></igc-avatar>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-avatar`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcAvatarComponent>(template, {
        modules: ['./avatar-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
