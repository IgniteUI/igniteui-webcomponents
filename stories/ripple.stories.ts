import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import {
  IgcIconComponent,
  IgcRippleComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { renderInto, storyStyles } from './story.js';

defineComponents(IgcIconComponent, IgcRippleComponent);
registerMaterialIcons(
  'done',
  'explore',
  'flight-takeoff',
  'home',
  'movie',
  'music-note',
  'near-me',
  'photo',
  'shopping-cart',
  'star',
  'star-border',
  'work'
);

// region default
const metadata: Meta<IgcRippleComponent> = {
  title: 'Ripple',
  component: 'igc-ripple',
  parameters: {
    docs: {
      description: {
        component:
          'A ripple can be applied to an element to represent\nan interactive surface.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .rp-panel {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
    }

    .rp-panel :is(h3, h4, p) {
      margin: 0;
    }

    /* The ripple fills the nearest positioned ancestor. */
    .rp-surface {
      position: relative;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }

    /* The ripple ends at the rounded corners of the surface. */
    .rp-surface igc-ripple {
      border-radius: inherit;
    }

    /* The ripple plays on a pointer press only, so show the keyboard focus. */
    .rp-surface:focus-visible {
      outline: 2px solid var(--ig-primary-500);
      outline-offset: 2px;
    }
  </style>
`;

const tripActions = [
  { label: 'Flights', icon: 'flight-takeoff' },
  { label: 'Stays', icon: 'home' },
  { label: 'Explore', icon: 'explore' },
  { label: 'Directions', icon: 'near-me' },
] as const;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The quick actions of a travel app. Each action is a native `button` with an `igc-ripple` inside. The ripple fills the button, because the button has `position: relative`, and `border-radius: inherit` on the ripple keeps the wave inside the rounded corners. Press a button to see the wave start at the pointer. The ripple has no keyboard effect, so the buttons show a focus outline.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .rp-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .rp-action {
        display: grid;
        justify-items: center;
        gap: 0.5rem;
        inline-size: 7rem;
        padding: 1rem 0.5rem;
        border: 1px solid var(--ig-gray-300);
        border-radius: 12px;
        background: var(--ig-surface-500);
      }

      .rp-action igc-icon {
        color: var(--ig-primary-500);
      }
    </style>
    <section class="rp-panel" aria-labelledby="rp-trip-title">
      <h3 id="rp-trip-title">Plan your trip</h3>
      <div class="rp-actions">
        ${tripActions.map(
          ({ label, icon }) => html`
            <button type="button" class="rp-surface rp-action">
              <igc-icon name=${icon}></igc-icon>
              ${label}
              <igc-ripple></igc-ripple>
            </button>
          `
        )}
      </div>
    </section>
  `,
};

const interests = [
  { name: 'Music', icon: 'music-note', color: 'primary' },
  { name: 'Movies', icon: 'movie', color: 'secondary' },
  { name: 'Photography', icon: 'photo', color: 'info' },
  { name: 'Travel', icon: 'flight-takeoff', color: 'success' },
  { name: 'Shopping', icon: 'shopping-cart', color: 'warn' },
  { name: 'Careers', icon: 'work', color: 'error' },
] as const;

export const Interests: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An onboarding step that asks for the interests of the user. Each tile has a palette color, and its text uses the matching `-contrast` color. The ripple takes its color from the `--color` custom property, so each tile sets `--color` to the same contrast color, and the wave stays visible on the color of the tile. Each tile is a toggle button with `aria-pressed`.',
      },
    },
  },
  render: () => {
    const selected = new Set<string>(['Travel']);

    const { mount, update } = renderInto(
      () => html`
        <ul class="rp-interests">
          ${interests.map(({ name, icon, color }) => {
            const pressed = selected.has(name);

            return html`
              <li>
                <button
                  type="button"
                  class="rp-surface rp-interest"
                  aria-pressed=${pressed}
                  style=${styleMap({
                    '--tile': `var(--ig-${color}-500)`,
                    '--color': `var(--ig-${color}-500-contrast)`,
                  })}
                  @click=${() => {
                    if (!selected.delete(name)) {
                      selected.add(name);
                    }
                    update();
                  }}
                >
                  <igc-icon name=${pressed ? 'done' : icon}></igc-icon>
                  ${name}
                  <igc-ripple></igc-ripple>
                </button>
              </li>
            `;
          })}
        </ul>
        <p role="status" class="muted">
          ${selected.size} of ${interests.length} selected
        </p>
      `
    );

    return html`
      ${styles}
      <style>
        .rp-interests {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
          gap: 0.75rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .rp-interest {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          inline-size: 100%;
          padding: 1.25rem 1rem;
          border: 0;
          border-radius: 12px;
          background: var(--tile);
          color: var(--color);
          font-weight: 600;
        }

        .rp-interest[aria-pressed='true'] {
          box-shadow: inset 0 0 0 3px var(--color);
        }
      </style>
      <section class="rp-panel" aria-labelledby="rp-interests-title">
        <h3 id="rp-interests-title">Pick your interests</h3>
        <p class="muted">We use them to suggest events near you.</p>
        <div class="rp-panel" ${mount}></div>
      </section>
    `;
  },
};

const mails = [
  {
    id: 1,
    from: 'Maya Robinson',
    subject: 'Trip photos are up',
    body: 'I uploaded the photos from Lisbon. Pick your favorites before Friday, and I will order the prints.',
    time: '9:41 AM',
  },
  {
    id: 2,
    from: 'Travel desk',
    subject: 'Your flight to Oslo',
    body: 'Check-in for your flight on October 14 opens 24 hours before departure.',
    time: '8:15 AM',
  },
  {
    id: 3,
    from: 'Jonas Keller',
    subject: 'Lunch on Thursday?',
    body: 'The new place on the corner has a lunch menu now. Are you free at noon?',
    time: 'Yesterday',
  },
  {
    id: 4,
    from: 'Build service',
    subject: 'Nightly build passed',
    body: 'All 4,237 tests passed. The build took 12 minutes.',
    time: 'Monday',
  },
];

export const Inbox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A mail list. The ripple of each row is inside the button that opens the mail, so a press on the ripple also activates the button. The star button sits in the same grid cell, above the row with `z-index`, and has its own round ripple, so a press on the star does not play the ripple of the row. Open a mail to mark it as read.',
      },
    },
  },
  render: () => {
    const state = {
      open: 0,
      unread: new Set([1, 2]),
      starred: new Set([2]),
    };

    const { mount, update } = renderInto(() => {
      const current = mails.find(({ id }) => id === state.open);

      return html`
        <ul class="rp-mails" aria-label="Inbox">
          ${mails.map((mail) => {
            const unread = state.unread.has(mail.id);
            const starred = state.starred.has(mail.id);

            return html`
              <li class="rp-mail" ?data-unread=${unread}>
                <button
                  type="button"
                  class="rp-surface rp-open"
                  aria-current=${state.open === mail.id ? 'true' : 'false'}
                  @click=${() => {
                    state.open = mail.id;
                    state.unread.delete(mail.id);
                    update();
                  }}
                >
                  ${unread ? html`<span class="sr-only">Unread</span>` : nothing}
                  <span class="rp-from">${mail.from}</span>
                  <span class="rp-time muted">${mail.time}</span>
                  <span class="rp-subject">${mail.subject}</span>
                  <igc-ripple></igc-ripple>
                </button>
                <button
                  type="button"
                  class="rp-surface rp-star"
                  aria-label=${`Star: ${mail.subject}`}
                  aria-pressed=${starred}
                  @click=${() => {
                    if (!state.starred.delete(mail.id)) {
                      state.starred.add(mail.id);
                    }
                    update();
                  }}
                >
                  <igc-icon name=${starred ? 'star' : 'star-border'}></igc-icon>
                  <igc-ripple></igc-ripple>
                </button>
              </li>
            `;
          })}
        </ul>
        <article class="rp-reader" aria-live="polite">
          ${
            current
              ? html`
                  <h4>${current.subject}</h4>
                  <p class="muted">From ${current.from}, ${current.time}</p>
                  <p>${current.body}</p>
                `
              : html`<p class="muted">Select a mail to read it.</p>`
          }
        </article>
      `;
    });

    return html`
      ${styles}
      <style>
        .rp-mails {
          margin: 0;
          padding: 0;
          list-style: none;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          overflow: hidden;
        }

        .rp-mail {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
        }

        .rp-mail + .rp-mail {
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .rp-open {
          grid-area: 1 / 1 / 2 / -1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.125rem 1rem;
          padding: 0.75rem 3.5rem 0.75rem 1rem;
          border: 0;
          background: none;
          text-align: start;
        }

        .rp-open[aria-current='true'] {
          background: var(--ig-gray-100);
        }

        .rp-open:focus-visible {
          outline-offset: -2px;
        }

        .rp-subject {
          grid-column: 1 / -1;
        }

        [data-unread] :is(.rp-from, .rp-subject) {
          font-weight: 700;
        }

        .rp-star {
          grid-area: 1 / 2;
          z-index: 1;
          display: grid;
          place-items: center;
          margin-inline-end: 0.5rem;
          padding: 0.5rem;
          border: 0;
          border-radius: 50%;
          background: none;
        }

        .rp-star[aria-pressed='true'] igc-icon {
          color: var(--ig-warn-500);
        }

        .rp-reader {
          display: grid;
          gap: 0.25rem;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }
      </style>
      <section class="rp-panel" aria-labelledby="rp-inbox-title">
        <h3 id="rp-inbox-title">Inbox</h3>
        <div class="rp-panel" ${mount}></div>
      </section>
    `;
  },
};
