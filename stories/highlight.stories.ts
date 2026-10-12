import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent
);

registerMaterialIcons('search', 'arrow-up', 'arrow-down');

// region default
const metadata: Meta<IgcHighlightComponent> = {
  title: 'Highlight',
  component: 'igc-highlight',
  parameters: {
    docs: {
      description: {
        component:
          'The highlight component provides efficient searching and highlighting of text\nprojected into it via its default slot. It uses the native CSS Custom Highlight API\nto apply highlight styles to matched text nodes without modifying the DOM.\n\nThe component supports case-sensitive matching, programmatic navigation between\nmatches, and automatic scroll-into-view of the active match.',
      },
    },
  },
  argTypes: {
    caseSensitive: {
      type: 'boolean',
      description:
        'Whether to match the searched text with case sensitivity in mind.\nWhen `true`, only exact-case occurrences of `searchText` are highlighted.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    searchText: {
      type: 'string',
      description:
        'The string to search and highlight in the DOM content of the component.\nSetting this property triggers a new search automatically.\nAn empty string clears all highlights.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
  },
  args: { caseSensitive: false, searchText: '' },
};

export default metadata;

interface IgcHighlightArgs {
  /**
   * Whether to match the searched text with case sensitivity in mind.
   * When `true`, only exact-case occurrences of `searchText` are highlighted.
   */
  caseSensitive: boolean;
  /**
   * The string to search and highlight in the DOM content of the component.
   * Setting this property triggers a new search automatically.
   * An empty string clears all highlights.
   */
  searchText: string;
}
type Story = StoryObj<IgcHighlightArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .hl-text {
      max-width: 40rem;
      margin: 0;
    }

    .hl-reader {
      display: grid;
      grid-template-rows: auto 1fr;
      max-width: 44rem;
      height: 30rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .hl-find {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-block-end: 1px solid var(--ig-gray-300);
    }

    .hl-find igc-input {
      flex: 1 1 14rem;
    }

    .hl-count {
      min-width: 5rem;
      color: var(--ig-gray-700);
    }

    .hl-scroll {
      overflow: auto;
      padding: 0 1.5rem 1rem;
    }

    .hl-scroll h3 {
      margin-block: 1.25rem 0.5rem;
      font-size: 1.125rem;
    }

    .hl-scroll p {
      margin-block: 0 0.75rem;
    }

    .hl-settings {
      display: grid;
      gap: 1rem;
      max-width: 36rem;
    }

    .hl-settings p {
      margin: 0;
    }

    .hl-settings ul {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .hl-settings li {
      display: grid;
      gap: 0.125rem;
    }

    .hl-log {
      font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
      font-size: 0.8125rem;
    }

    .hl-log div {
      white-space: pre;
    }

    .hl-log igc-highlight {
      --background: var(--ig-warn-200);
      --foreground: var(--ig-warn-200-contrast);
      --background-active: var(--ig-warn-600);
      --foreground-active: var(--ig-warn-600-contrast);
    }
  </style>
`;

/**
 * A find bar for a scroll container with an `igc-highlight`: a search field, the previous and
 * next buttons, a match case option, and a status with the position of the active match.
 */
function createFinder(
  label: string,
  reveal?: (highlight: IgcHighlightComponent) => Promise<unknown>
) {
  let bar: HTMLElement | undefined;

  const controls = () => ({
    input: bar!.querySelector('igc-input')!,
    matchCase: bar!.querySelector('igc-checkbox')!,
    highlight: bar!.parentElement!.querySelector('igc-highlight')!,
  });

  const report = () => {
    const { highlight } = controls();
    const status = bar!.querySelector('.hl-count')!;

    status.textContent = !highlight.searchText.trim()
      ? ''
      : highlight.size
        ? `${highlight.current + 1} of ${highlight.size}`
        : 'No matches';

    for (const button of bar!.querySelectorAll('igc-icon-button')) {
      button.disabled = !highlight.size;
    }
  };

  const search = async () => {
    const { input, matchCase, highlight } = controls();

    // Each set searches again, also with the same value.
    if (highlight.caseSensitive !== matchCase.checked) {
      highlight.caseSensitive = matchCase.checked;
    }
    if (highlight.searchText !== input.value) {
      highlight.searchText = input.value;
    }
    await reveal?.(highlight);

    if (highlight.size) {
      highlight.setActive(0);
    }

    report();
  };

  const step = (forward: boolean) => {
    const { highlight } = controls();

    forward ? highlight.next() : highlight.previous();
    report();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      step(!event.shiftKey);
    }
  };

  /** Fills in the search field and the match case option, and then searches. */
  const find = (text: string, caseSensitive: boolean) => {
    const { input, matchCase } = controls();

    input.value = text;
    matchCase.checked = caseSensitive;
    return search();
  };

  const template = (extra: unknown = nothing) => html`
    <div
      class="hl-find"
      ${ref((element) => {
        bar = element as HTMLElement | undefined;
      })}
    >
      <igc-input
        type="search"
        label=${label}
        @igcInput=${search}
        @keydown=${onKeyDown}
      >
        <igc-icon slot="prefix" name="search"></igc-icon>
      </igc-input>
      <igc-icon-button
        name="arrow-up"
        variant="flat"
        aria-label="Previous match"
        disabled
        @click=${() => step(false)}
      ></igc-icon-button>
      <igc-icon-button
        name="arrow-down"
        variant="flat"
        aria-label="Next match"
        disabled
        @click=${() => step(true)}
      ></igc-icon-button>
      <igc-checkbox @igcChange=${search}>Match case</igc-checkbox>
      ${extra}
      <span class="hl-count" role="status"></span>
    </div>
  `;

  return { find, template };
}

export const Default: Story = {
  args: { searchText: 'cold brew' },
  parameters: {
    docs: {
      description: {
        story:
          'The highlight marks each match of `searchText` in its content. It uses the CSS Custom Highlight API, so it adds no elements to the DOM, and the layout does not change. The first match is the active match, and it has a second color. By default, the search ignores the case: "cold brew" also finds "Cold brew" and "Cold Brew". Set `caseSensitive` to find only the exact case. A space in the search text matches any run of whitespace, so the search also finds "cold brew" where a line break of the HTML source separates the two words. Use the controls panel to change the search.',
      },
    },
  },
  render: ({ searchText, caseSensitive }) => html`
    ${styles}
    <igc-highlight
      search-text=${ifDefined(searchText)}
      ?case-sensitive=${caseSensitive}
    >
      <p class="hl-text">
        Cold brew is coffee that steeps in cold water for 12 to 24 hours.
        Because the water is cold, less acid comes out of the beans, so cold
        brew tastes sweeter and less bitter than hot coffee. Use a coarse grind,
        and one part of coffee for eight parts of water. Keep the coffee in the
        refrigerator, and drink it in two weeks. Our Cold Brew Week starts on
        October 12.
      </p>
    </igc-highlight>
  `,
};

const guide = [
  {
    title: 'Create a project',
    text: 'A project holds the files, the tasks and the members of a piece of work. To create a project, select New project on the home page, type a name, and then select Create. You can change the name later in the settings of the project.',
  },
  {
    title: 'Invite people',
    text: 'Open the project, and then select Share. Type the email addresses of the people, choose a role for each person, and then select Send. A member can edit the files of the project. A viewer can only read them. People without an account get an email with a link to sign up.',
  },
  {
    title: 'Share files',
    text: 'Each file has a link. Select the file, and then select Copy link. The link works only for the members of the project, unless you turn on Anyone with the link. You can turn off the link at any time, and then the old link stops working.',
  },
  {
    title: 'Notifications',
    text: 'We send an email when somebody mentions you, gives a task to you, or shares a file with you. To change the notifications, open the settings, and then select Notifications. You can turn off each kind of email, or get one summary email each day.',
  },
];

const questions = [
  {
    question: 'Can I move a file to another project?',
    answer:
      'Yes. Select the file, select Move, and then choose the project. The members of the new project get access to the file, and the members of the old project lose it.',
  },
  {
    question: 'How do I restore a deleted file?',
    answer:
      'Open the trash of the project. A deleted file stays there for 30 days. Select the file, and then select Restore.',
  },
  {
    question: 'Who can see my files?',
    answer:
      'Only the members of the project, and the people with the link when you turn on Anyone with the link.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Open the settings, select Account, and then select Delete the account. We delete your files after 30 days.',
  },
];

/** Opens the panels that contain a match, so that the user can see each match. */
function openPanelsWithMatches(highlight: IgcHighlightComponent) {
  const text = highlight.searchText.trim();
  const normalize = (value: string) =>
    highlight.caseSensitive ? value : value.toLowerCase();

  if (!text) {
    return Promise.resolve();
  }

  return Promise.all(
    [...highlight.querySelectorAll('igc-expansion-panel')]
      .filter((panel) =>
        normalize(panel.textContent ?? '').includes(normalize(text))
      )
      .map((panel) => panel.show())
  );
}

export const FindInPage: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A user guide with a find bar. Type a word, such as "link" or "file". The story sets `searchText`, and `setActive(0)` scrolls the first match into the center of the scroll container. Press Enter or Shift + Enter in the search field, or use the arrow buttons, to go to the next or the previous match with `next()` and `previous()`. Both wrap at the ends. "Match case" sets `caseSensitive`. The highlight also finds the text in the closed panels of the FAQ, so before it moves to the first match, the story opens each panel with a match. The highlight is only visual, so the status after the buttons tells a screen reader the position of the active match, from `current` and `size`.',
      },
    },
  },
  render: () => {
    const finder = createFinder('Find in the guide', openPanelsWithMatches);

    return html`
      ${styles}
      <div class="hl-reader">
        ${finder.template()}
        <div
          class="hl-scroll"
          role="region"
          aria-label="User guide"
          tabindex="0"
        >
          <igc-highlight>
            ${guide.map(
              ({ title, text }) => html`
                <h3>${title}</h3>
                <p>${text}</p>
              `
            )}
            <h3>Frequently asked questions</h3>
            ${questions.map(
              ({ question, answer }) => html`
                <igc-expansion-panel>
                  <span slot="title">${question}</span>
                  <p>${answer}</p>
                </igc-expansion-panel>
              `
            )}
          </igc-highlight>
        </div>
      </div>
    `;
  },
};

const settings = [
  {
    name: 'Display name',
    section: 'Profile',
    description: 'The name that other people see next to your messages.',
  },
  {
    name: 'Profile photo',
    section: 'Profile',
    description: 'A photo or an image that shows next to your name.',
  },
  {
    name: 'Password',
    section: 'Security',
    description: 'Change the password that you use to sign in.',
  },
  {
    name: 'Two-step verification',
    section: 'Security',
    description:
      'Ask for a code from your phone when you sign in on a new device.',
  },
  {
    name: 'Active sessions',
    section: 'Security',
    description: 'See the devices that are signed in, and sign them out.',
    advanced: true,
  },
  {
    name: 'Email notifications',
    section: 'Notifications',
    description: 'The emails that we send when somebody mentions you.',
  },
  {
    name: 'Daily summary',
    section: 'Notifications',
    description: 'One email each day with the changes in your projects.',
  },
  {
    name: 'Language',
    section: 'Preferences',
    description: 'The language of the menus and of the emails.',
  },
  {
    name: 'Time zone',
    section: 'Preferences',
    description: 'The time zone of the dates and the times that we show.',
  },
  {
    name: 'Keyboard shortcuts',
    section: 'Preferences',
    description: 'Turn the shortcuts with a single key on or off.',
    advanced: true,
  },
  {
    name: 'API tokens',
    section: 'Developer',
    description: 'The tokens that your scripts use to sign in to your account.',
    advanced: true,
  },
  {
    name: 'Webhooks',
    section: 'Developer',
    description: 'Send a request to your server when a file changes.',
    advanced: true,
  },
  {
    name: 'Delete the account',
    section: 'Account',
    description: 'Remove your account, your files and your messages.',
  },
];

export const SettingsSearch: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A search in the settings of an application. The list shows only the settings that contain the search text, and the highlight marks the text in each setting. The component does not observe its content: after a render, its ranges point to text that has changed. Lit sets the properties of an element before it updates the children, so a `searchText` binding searches the old list. That is why the story sets `searchText` after each render, or calls `search()` when the text stays the same. Turn on "Show advanced settings" to add settings to the list while the search text stays the same.',
      },
    },
  },
  render: () => {
    let query = '';
    let advanced = false;
    let host: HTMLElement | undefined;

    const onInput = ({ detail }: CustomEvent<string>) => {
      query = detail;
      update();
    };

    const onAdvanced = ({ detail }: CustomEvent<{ checked: boolean }>) => {
      advanced = detail.checked;
      update();
    };

    const update = () => {
      if (!host) {
        return;
      }

      const text = query.trim();
      const visible = settings.filter(
        (setting) =>
          (advanced || !setting.advanced) &&
          [setting.name, setting.section, setting.description].some((value) =>
            value.toLowerCase().includes(text.toLowerCase())
          )
      );

      render(
        html`
          <div class="hl-settings">
            <igc-input
              type="search"
              label="Search the settings"
              @igcInput=${onInput}
            >
              <igc-icon slot="prefix" name="search"></igc-icon>
            </igc-input>
            <igc-switch @igcChange=${onAdvanced}>
              Show advanced settings
            </igc-switch>
            <p class="muted" role="status">
              ${
                visible.length
                  ? `${visible.length} ${visible.length === 1 ? 'setting' : 'settings'}`
                  : `No settings contain "${text}".`
              }
            </p>
            <igc-highlight>
              <ul>
                ${visible.map(
                  ({ name, section, description }) => html`
                    <li>
                      <strong>${name}</strong>
                      <span>${description}</span>
                      <span class="muted">${section}</span>
                    </li>
                  `
                )}
              </ul>
            </igc-highlight>
          </div>
        `,
        host
      );

      const highlight = host.querySelector('igc-highlight')!;

      if (highlight.searchText === text) {
        highlight.search();
      } else {
        highlight.searchText = text;
      }
    };

    const mount = (element?: Element) => {
      host = element as HTMLElement | undefined;
      update();
    };

    return html`${styles}
      <div ${ref(mount)}></div>`;
  },
};

const levels = ['INFO', 'INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
const services = ['api', 'auth', 'billing', 'search', 'worker'];
const messages: Record<string, string[]> = {
  INFO: [
    'Request completed in {n} ms',
    'User {n} signed in',
    'Cache refreshed with {n} entries',
    'Error rate for the last hour is 0.{n}%',
  ],
  DEBUG: ['Query uses the index orders_by_date', '{n} attempts left'],
  WARN: ['Slow query took {n} ms', 'Retried the request after a network error'],
  ERROR: [
    'Payment for order {n} failed: the card was declined',
    'The connection to the database timed out after {n} ms',
  ],
};

/** Makes the same log at each page load, so the matches do not change. */
function createLog(count: number): string[] {
  let seed = 7;
  const random = (max: number) => {
    seed = (seed * 16_807) % 2_147_483_647;
    return seed % max;
  };

  let time = Date.UTC(2026, 9, 2, 8);

  return Array.from({ length: count }, () => {
    const level = levels[random(levels.length)];
    const options = messages[level];
    const message = options[random(options.length)].replace(
      '{n}',
      `${random(900) + 100}`
    );

    time += random(4000);

    return `${new Date(time).toISOString().slice(11, 23)} ${level.padEnd(5)} [${services[random(services.length)]}] ${message}`;
  });
}

let log: string[] | undefined;
const getLog = () => (log ??= createLog(3000));

export const LogViewer: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A log viewer with 3,000 lines. The search and the navigation stay fast, because the highlight adds no elements to the DOM. "Find errors" and "Find warnings" search for the level with "Match case" on, so the search does not find "error" in the text of the messages. Turn off "Match case" to see the difference. The log sets its own highlight colors with the CSS custom properties `--background`, `--foreground`, `--background-active` and `--foreground-active` on the host. The colors come from the palette with their contrast colors, so the text stays readable in the light and the dark themes.',
      },
    },
  },
  render: () => {
    const finder = createFinder('Find in the log');
    const lines = getLog();

    return html`
      ${styles}
      <div class="hl-reader">
        ${finder.template(html`
          <igc-button
            variant="outlined"
            @click=${() => finder.find('ERROR', true)}
          >
            Find errors
          </igc-button>
          <igc-button
            variant="outlined"
            @click=${() => finder.find('WARN', true)}
          >
            Find warnings
          </igc-button>
        `)}
        <div
          class="hl-scroll hl-log"
          role="region"
          aria-label="Log"
          tabindex="0"
        >
          <igc-highlight
            >${lines.map((line) => html`<div>${line}</div>`)}</igc-highlight
          >
        </div>
      </div>
    `;
  },
};
