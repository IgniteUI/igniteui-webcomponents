import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcNavbarComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { registerMaterialIcons } from './story-icons.js';
import { focusAfterUpdate, plural, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcNavbarComponent
);

registerMaterialIcons(
  'arrow-back',
  'assessment',
  'chevron-right',
  'exit-to-app',
  'help',
  'person',
  'search',
  'settings'
);

// region default
const metadata: Meta<IgcNavbarComponent> = {
  title: 'Navbar',
  component: 'igc-navbar',
  parameters: {
    docs: {
      description: {
        component:
          'A navigation bar component is used to facilitate navigation through\na series of hierarchical screens within an app.',
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
    .nb-phone {
      width: min(100%, 24rem);
      height: 32rem;
      overflow: auto;
      border: 1px solid var(--ig-gray-300);
      border-radius: 12px;
    }

    /* The bar stays at the top while the screen scrolls. */
    .nb-phone igc-navbar {
      position: sticky;
      inset-block-start: 0;
    }

    .nb-screen {
      padding: 1rem;
    }

    .nb-screen p {
      margin: 0 0 1rem;
      line-height: 1.5;
    }

    .nb-menu {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .nb-menu a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-block-end: 1px solid var(--ig-gray-300);
      color: inherit;
      text-decoration: none;
    }

    .nb-menu a:hover {
      background: var(--ig-gray-100);
    }

    .nb-menu a span {
      display: grid;
      flex: 1;
    }

    .nb-searching igc-navbar {
      --ig-navbar-background: var(--ig-surface-500);
      --ig-navbar-text-color: var(--ig-gray-900);
    }

    .nb-searching igc-input {
      flex: 1;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The header of an analytics application. The logo goes in the `start` slot, the name of the application in the default slot, and the actions in the `end` slot. The navbar has no role of its own, so a `header` element around it makes the banner landmark. The logo has no name, so assistive technologies ignore it. The action buttons show only an icon, so each has an `aria-label`. The account button is the target of a dropdown in the `end` slot.',
      },
    },
  },
  render: () => html`
    <header>
      <igc-navbar>
        <igc-icon slot="start" name="assessment"></igc-icon>
        <h2>Acme Analytics</h2>
        <igc-icon-button
          slot="end"
          variant="flat"
          name="search"
          aria-label="Search"
        ></igc-icon-button>
        <igc-icon-button
          slot="end"
          variant="flat"
          name="help"
          aria-label="Help"
        ></igc-icon-button>
        <igc-dropdown slot="end" placement="bottom-end">
          <igc-icon-button
            slot="target"
            variant="flat"
            name="person"
            aria-label="Account"
          ></igc-icon-button>
          <igc-dropdown-header>alex.rivera@acme.example</igc-dropdown-header>
          <igc-dropdown-item>
            <igc-icon slot="prefix" name="person"></igc-icon>
            Your profile
          </igc-dropdown-item>
          <igc-dropdown-item>
            <igc-icon slot="prefix" name="settings"></igc-icon>
            Settings
          </igc-dropdown-item>
          <igc-dropdown-item>
            <igc-icon slot="prefix" name="exit-to-app"></igc-icon>
            Sign out
          </igc-dropdown-item>
        </igc-dropdown>
      </igc-navbar>
    </header>
  `,
};

type HelpArticle = { id: string; title: string; body: string[] };

type HelpTopic = {
  id: string;
  title: string;
  summary: string;
  articles: HelpArticle[];
};

const helpTopics: HelpTopic[] = [
  {
    id: 'orders',
    title: 'Orders',
    summary: 'Track, change or cancel an order',
    articles: [
      {
        id: 'track',
        title: 'Track your order',
        body: [
          'When your order ships, we send you an email with a tracking link.',
          'The tracking information can take up to 24 hours to show after the email.',
        ],
      },
      {
        id: 'cancel',
        title: 'Change or cancel an order that has not shipped yet',
        body: [
          'Open Your orders and select the order. While the order has the status Processing, you can change the address or cancel the order.',
          'When the status is Shipped, the order cannot change. Wait for the delivery, and then start a return.',
        ],
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    summary: 'Delivery times, costs and customs',
    articles: [
      {
        id: 'times',
        title: 'Delivery times',
        body: [
          'Standard delivery takes 3 to 5 working days. Express delivery takes 1 to 2 working days.',
        ],
      },
      {
        id: 'customs',
        title: 'International shipping and customs fees',
        body: [
          'We ship to 40 countries. The checkout shows the countries and the delivery costs for your address.',
          'Some countries charge customs fees and import taxes when the parcel arrives. The carrier collects these fees from you, and we cannot pay them in advance.',
          'The fees depend on the value of the order and on the rules of your country. Ask the customs office of your country for an estimate before you order.',
          'When you refuse to pay the fees, the carrier sends the parcel back to us. We refund the order, but not the delivery costs.',
          'Orders to the United Kingdom, Norway and Switzerland include the import taxes, so you pay nothing at the door.',
        ],
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns and refunds',
    summary: 'Send an item back and get your money',
    articles: [
      {
        id: 'start',
        title: 'Start a return',
        body: [
          'You can return an item within 30 days of the delivery. Open Your orders, select the item, and choose Return.',
        ],
      },
      {
        id: 'refund',
        title: 'When do I get my refund?',
        body: [
          'We refund the item within 5 working days after the item arrives at our warehouse.',
        ],
      },
    ],
  },
];

export const HelpCenter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The help center of a store app, with three levels of screens: the topics, the articles of a topic, and an article. The default slot holds the title of the screen, which can wrap to more lines, as the long article titles do. Below the first level, a back button in the `start` slot names the screen that it goes back to. After each step forward, the focus moves to the title, so a screen reader announces the new screen. A step back moves the focus to the link of the screen that the user left. The navbar is a block in the page, so `position: sticky` keeps it at the top while a long article scrolls.',
      },
    },
  },
  render: () => {
    let topic: HelpTopic | undefined;
    let article: HelpArticle | undefined;

    const show = (focus: string) => {
      story.update();

      const phone = story.host!.querySelector('.nb-phone')!;
      phone.scrollTop = 0;
      phone.querySelector<HTMLElement>(focus)!.focus();
    };

    const open =
      (next: { topic?: HelpTopic; article?: HelpArticle }) =>
      (event: Event) => {
        event.preventDefault();
        topic = next.topic ?? topic;
        article = next.article;
        show('.nb-title');
      };

    const back = () => {
      const left = article ?? topic!;

      if (article) {
        article = undefined;
      } else {
        topic = undefined;
      }

      show(`[data-id="${left.id}"]`);
    };

    const link = (
      id: string,
      title: string,
      summary: string | undefined,
      onClick: (event: Event) => void
    ) => html`
      <li>
        <a href="#${id}" data-id=${id} @click=${onClick}>
          <span>
            ${title}
            ${summary ? html`<span class="muted">${summary}</span>` : ''}
          </span>
          <igc-icon name="chevron-right"></igc-icon>
        </a>
      </li>
    `;

    const screen = () => {
      if (article) {
        return article.body.map((paragraph) => html`<p>${paragraph}</p>`);
      }

      const links = topic
        ? topic.articles.map((each) =>
            link(each.id, each.title, undefined, open({ article: each }))
          )
        : helpTopics.map((each) =>
            link(each.id, each.title, each.summary, open({ topic: each }))
          );

      return html`<ul class="nb-menu">
        ${links}
      </ul>`;
    };

    const story = renderInto(() => {
      const title = article?.title ?? topic?.title ?? 'Help center';
      const parent = article ? topic!.title : topic ? 'Help center' : '';

      return html`
        <div class="nb-phone">
          <igc-navbar>
            ${
              parent
                ? html`
                    <igc-icon-button
                      slot="start"
                      variant="flat"
                      name="arrow-back"
                      aria-label="Back to ${parent}"
                      @click=${back}
                    ></igc-icon-button>
                  `
                : html`<igc-icon slot="start" name="help"></igc-icon>`
            }
            <h2 class="nb-title" tabindex="-1">${title}</h2>
          </igc-navbar>
          <div class=${article ? 'nb-screen' : ''}>${screen()}</div>
        </div>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const contacts = [
  { name: 'Aiko Tanaka', role: 'Product designer' },
  { name: 'Daniel Okafor', role: 'Account manager' },
  { name: 'Emma Novak', role: 'Engineering lead' },
  { name: 'Grace Okafor', role: 'Customer success' },
  { name: 'Liam Chen', role: 'Finance' },
  { name: 'Maria Garcia', role: 'Marketing' },
  { name: 'Omar Haddad', role: 'Support' },
  { name: 'Sofía Díaz', role: 'Legal' },
];

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('');

export const SearchMode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The contacts of a phone app. The search button in the `end` slot changes the navbar to a search bar: a back button goes in the `start` slot, and a search field in the default slot. The field gets the focus, and its `aria-label` names it. The list filters as the user types, and a status message tells how many contacts match. The back button or Escape closes the search, clears it, and moves the focus back to the search button. In search mode the story sets `--ig-navbar-background` and `--ig-navbar-text-color` to the surface colors, so the field shows on the colors that it was made for.',
      },
    },
  },
  render: () => {
    let searching = false;
    let query = '';

    const openSearch = async () => {
      searching = true;
      story.update();

      await focusAfterUpdate(
        story.host!.querySelector<IgcInputComponent>('igc-input')!
      );
    };

    const closeSearch = async () => {
      searching = false;
      query = '';
      story.update();

      await focusAfterUpdate(
        story.host!.querySelector<IgcIconButtonComponent>('igc-icon-button')!
      );
    };

    const story = renderInto(() => {
      const text = query.trim().toLowerCase();
      const matches = contacts.filter(({ name }) =>
        name.toLowerCase().includes(text)
      );

      return html`
        <div class="nb-phone ${searching ? 'nb-searching' : ''}">
          <igc-navbar>
            ${
              searching
                ? html`
                    <igc-icon-button
                      slot="start"
                      variant="flat"
                      name="arrow-back"
                      aria-label="Close the search"
                      @click=${closeSearch}
                    ></igc-icon-button>
                    <igc-input
                      type="search"
                      aria-label="Search contacts"
                      placeholder="Search contacts"
                      .value=${query}
                      @igcInput=${({ detail }: CustomEvent<string>) => {
                        query = detail;
                        story.update();
                      }}
                      @keydown=${(event: KeyboardEvent) => {
                        if (event.key === 'Escape') {
                          closeSearch();
                        }
                      }}
                    ></igc-input>
                  `
                : html`
                    <h2>Contacts</h2>
                    <igc-icon-button
                      slot="end"
                      variant="flat"
                      name="search"
                      aria-label="Search contacts"
                      @click=${openSearch}
                    ></igc-icon-button>
                  `
            }
          </igc-navbar>
          <p class="sr-only" role="status">
            ${
              text
                ? plural(matches.length, 'contact matches', 'contacts match')
                : ''
            }
          </p>
          ${
            matches.length
              ? html`
                  <igc-list aria-label="Contacts">
                    ${matches.map(
                      ({ name, role }) => html`
                        <igc-list-item>
                          <igc-avatar
                            slot="start"
                            shape="circle"
                            initials=${initialsOf(name)}
                            aria-hidden="true"
                          ></igc-avatar>
                          <span slot="title">${name}</span>
                          <span slot="subtitle">${role}</span>
                        </igc-list-item>
                      `
                    )}
                  </igc-list>
                `
              : html`<p class="nb-screen muted">No contacts match.</p>`
          }
        </div>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
