import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcCardComponent from './card.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-card elevated>
    <igc-card-header>
      <h1 slot="title">Title</h1>
      <h3 slot="subtitle">Subtitle</h3>
    </igc-card-header>

    <igc-card-media>
      <img />
    </igc-card-media>

    <igc-card-content>
      <p>Some content</p>
    </igc-card-content>

    <igc-card-actions>
      <button slot="buttons">Like</button>
    </igc-card-actions>
  </igc-card>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-card`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcCardComponent>(template, {
        modules: ['./card-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}
