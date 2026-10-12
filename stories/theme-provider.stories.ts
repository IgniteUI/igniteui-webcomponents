import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { type CSSResult, html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcThemeProviderComponent,
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDatePickerComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  type IgcRadioChangeEventArgs,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { styles as bootstrapDark } from '../src/styles/themes/dark/bootstrap.css.js';
import { styles as fluentDark } from '../src/styles/themes/dark/fluent.css.js';
import { styles as indigoDark } from '../src/styles/themes/dark/indigo.css.js';
import { styles as materialDark } from '../src/styles/themes/dark/material.css.js';
import { styles as bootstrapLight } from '../src/styles/themes/light/bootstrap.css.js';
import { styles as fluentLight } from '../src/styles/themes/light/fluent.css.js';
import { styles as indigoLight } from '../src/styles/themes/light/indigo.css.js';
import { styles as materialLight } from '../src/styles/themes/light/material.css.js';
import { addDays, formatDate, today } from './story-dates.js';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  plural,
  renderInto,
  storyStyles,
} from './story.js';

// Register the provider first, so that it exists when the components look
// for its context.
defineComponents(
  IgcThemeProviderComponent,
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDatePickerComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSwitchComponent
);
registerMaterialIcons(
  'assessment',
  'dashboard',
  'exit-to-app',
  'inbox',
  'people',
  'search',
  'settings'
);

// region default
const metadata: Meta<IgcThemeProviderComponent> = {
  title: 'ThemeProvider',
  component: 'igc-theme-provider',
  parameters: {
    docs: {
      description: {
        component:
          'A theme provider component that uses Lit context to provide theme information\nto descendant components.\n\nThis component allows you to scope a theme to a specific part of the page.\nAll library components within this provider will use the specified theme\ninstead of the global theme.',
      },
    },
  },
  argTypes: {
    theme: {
      type: {
        name: 'enum',
        value: ['material', 'bootstrap', 'indigo', 'fluent'],
      },
      description: 'The theme to provide to descendant components.',
      options: ['material', 'bootstrap', 'indigo', 'fluent'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'bootstrap' } },
    },
    variant: {
      type: { name: 'enum', value: ['light', 'dark'] },
      description: 'The theme variant to provide to descendant components.',
      options: ['light', 'dark'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'light' } },
    },
  },
  args: { theme: 'bootstrap', variant: 'light' },
};

export default metadata;

interface IgcThemeProviderArgs {
  /** The theme to provide to descendant components. */
  theme: 'material' | 'bootstrap' | 'indigo' | 'fluent';
  /** The theme variant to provide to descendant components. */
  variant: 'light' | 'dark';
}
type Story = StoryObj<IgcThemeProviderArgs>;

// endregion

type Theme = IgcThemeProviderArgs['theme'];
type Variant = IgcThemeProviderArgs['variant'];

const themeSheets: Record<Variant, Record<Theme, CSSResult>> = {
  light: {
    bootstrap: bootstrapLight,
    fluent: fluentLight,
    indigo: indigoLight,
    material: materialLight,
  },
  dark: {
    bootstrap: bootstrapDark,
    fluent: fluentDark,
    indigo: indigoDark,
    material: materialDark,
  },
};

/**
 * The provider switches the styles of the components. The palette, the
 * typography and the elevations come from the CSS variables of the theme file,
 * which the page sets on `:root`. This `<style>` sets them on its parent
 * element instead, so they apply to that element and its content only.
 */
const scopedCss = new Map<CSSResult, string>();

function themeScope(theme: Theme, variant: Variant) {
  const sheet = themeSheets[variant][theme];

  if (!scopedCss.has(sheet)) {
    scopedCss.set(sheet, sheet.cssText.replace(/:root\b/g, ':scope'));
  }

  return html`
    <style>
      @scope {
        ${scopedCss.get(sheet)}
      }
    </style>
  `;
}

const themeNames: Record<Theme, string> = {
  bootstrap: 'Bootstrap',
  fluent: 'Fluent',
  indigo: 'Indigo',
  material: 'Material',
};

const styles = html`
  ${storyStyles}
  <style>
    .tp-stack {
      display: grid;
      gap: 1rem;
    }

    .tp-stack :is(h3, h4, p, ul) {
      margin: 0;
    }

    .tp-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .tp-panel :is(h3, h4, p) {
      margin: 0;
    }

    /* The themed surface of a provider: its host is display: contents. */
    .tp-surface {
      background: var(--ig-surface-500);
      color: var(--ig-surface-500-contrast);
      font-family: var(--ig-font-family);
    }

    .tp-link {
      color: inherit;
      text-decoration: underline;
    }

    .tp-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

const signInForm = () => html`
  <form
    class="tp-stack"
    @submit=${(event: SubmitEvent) => event.preventDefault()}
  >
    <igc-input
      type="email"
      name="email"
      label="Email"
      autocomplete="username"
      required
    ></igc-input>
    <igc-input
      type="password"
      name="password"
      label="Password"
      autocomplete="current-password"
      required
    ></igc-input>
    <igc-checkbox name="remember">Keep me signed in</igc-checkbox>
    <div class="tp-row">
      <igc-button type="submit">Sign in</igc-button>
      <a class="tp-link" href="#forgot-password">Forgot your password?</a>
    </div>
  </form>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same sign-in form twice. The first one uses the theme of the page, which the Storybook toolbar sets. The second one is in an `igc-theme-provider`: use the controls panel to change its `theme` and `variant`. The provider changes the styles of the components inside it. The colors, the font and the shadows come from the CSS variables of the theme file, so the story also scopes the variables of the same theme to the content of the provider.',
      },
    },
  },
  render: ({ theme, variant }, { globals }) => html`
    ${styles}
    <style>
      .tp-compare {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
        gap: 1.5rem;
      }
    </style>
    <div class="tp-compare">
      <section class="tp-panel" aria-labelledby="tp-page-title">
        <h3 id="tp-page-title">
          Page theme: ${themeNames[globals.theme as Theme]}, ${globals.variant}
        </h3>
        ${signInForm()}
      </section>
      <igc-theme-provider theme=${theme} variant=${variant}>
        <section
          class="tp-panel tp-surface"
          aria-labelledby="tp-provider-title"
        >
          ${themeScope(theme, variant)}
          <h3 id="tp-provider-title">
            Provider: ${themeNames[theme]}, ${variant}
          </h3>
          ${signInForm()}
        </section>
      </igc-theme-provider>
    </div>
  `,
};

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', unread: 0 },
  { id: 'reports', label: 'Reports', icon: 'assessment', unread: 0 },
  { id: 'customers', label: 'Customers', icon: 'people', unread: 0 },
  { id: 'inbox', label: 'Inbox', icon: 'inbox', unread: 4 },
  { id: 'settings', label: 'Settings', icon: 'settings', unread: 0 },
] as const;

const tiles = [
  { label: 'Revenue', value: '$48,210', change: 'Up 12% from last month' },
  {
    label: 'Active customers',
    value: '1,284',
    change: 'Up 3% from last month',
  },
  { label: 'Open tickets', value: '23', change: 'Down 8 from last week' },
];

export const DarkSidebar: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An analytics app with a dark sidebar. The sidebar is in a provider with the theme of the page and the `dark` variant, so it stays dark when the page is light. The rest of the app uses the theme of the page. The search field, the badge, the avatar and the sign-out button of the sidebar take the dark styles, and the links mark the current page with `aria-current`.',
      },
    },
  },
  render: (_, { globals }) => {
    const theme = globals.theme as Theme;
    let current: (typeof navItems)[number] = navItems[0];

    const open = (item: (typeof navItems)[number]) => (event: Event) => {
      event.preventDefault();
      current = item;
      update();
    };

    const { mount, update } = renderInto(
      () => html`
        <igc-theme-provider theme=${theme} variant="dark">
          <div class="tp-surface tp-sidebar">
            ${themeScope(theme, 'dark')}
            <p class="tp-brand">Acme Analytics</p>
            <igc-input
              type="search"
              placeholder="Search"
              aria-label="Search the reports"
            >
              <igc-icon
                slot="prefix"
                name="search"
                aria-hidden="true"
              ></igc-icon>
            </igc-input>
            <nav aria-label="Main">
              <ul class="tp-nav">
                ${navItems.map(
                  (item) => html`
                    <li>
                      <a
                        href="#${item.id}"
                        aria-current=${item === current ? 'page' : 'false'}
                        @click=${open(item)}
                      >
                        <igc-icon
                          name=${item.icon}
                          aria-hidden="true"
                        ></igc-icon>
                        ${item.label}
                        ${
                          item.unread
                            ? html`
                                <igc-badge aria-hidden="true">
                                  ${item.unread}
                                </igc-badge>
                                <span class="sr-only"
                                  >(${item.unread} unread)</span
                                >
                              `
                            : ''
                        }
                      </a>
                    </li>
                  `
                )}
              </ul>
            </nav>
            <div class="tp-account">
              <igc-avatar
                initials="JD"
                shape="circle"
                aria-hidden="true"
              ></igc-avatar>
              <span>
                Jordan Diaz
                <span class="tp-role">Admin</span>
              </span>
              <igc-icon-button
                name="exit-to-app"
                variant="flat"
                aria-label="Sign out"
              ></igc-icon-button>
            </div>
          </div>
        </igc-theme-provider>
        <div class="tp-content">
          <div class="tp-row tp-content-head">
            <h3>${current.label}</h3>
            <igc-button>New report</igc-button>
          </div>
          <ul class="tp-tiles">
            ${tiles.map(
              ({ label, value, change }) => html`
                <li class="tp-panel">
                  <span class="muted">${label}</span>
                  <strong class="tp-value">${value}</strong>
                  <span>${change}</span>
                </li>
              `
            )}
          </ul>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .tp-shell {
          display: grid;
          grid-template-columns: 15rem 1fr;
          min-height: 28rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          overflow: hidden;
        }

        .tp-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        .tp-brand {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .tp-nav {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tp-nav a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          color: inherit;
          text-decoration: none;
        }

        .tp-nav a:hover {
          background: var(--ig-gray-100);
        }

        .tp-nav a[aria-current='page'] {
          background: var(--ig-gray-200);
          font-weight: 600;
        }

        .tp-nav igc-badge {
          margin-inline-start: auto;
        }

        .tp-account {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.75rem;
          margin-block-start: auto;
        }

        .tp-role {
          display: block;
          color: var(--ig-gray-700);
          font-size: 0.875rem;
        }

        .tp-content {
          display: grid;
          align-content: start;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }

        .tp-content-head {
          justify-content: space-between;
        }

        .tp-content h3 {
          margin: 0;
        }

        .tp-tiles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tp-tiles li {
          gap: 0.25rem;
        }

        .tp-value {
          font-size: 1.75rem;
        }

        @media (max-width: 40rem) {
          .tp-shell {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="tp-shell" ${mount}></div>
    `;
  },
};

export const LandingPage: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The top of a product page: a dark band with a light sign-up card in it. Providers nest, and the closest one decides the theme. The band is in a provider with the `dark` variant, and the card is in a provider with the `light` variant inside it. Both use the theme of the page, and the section under the band uses the page theme directly.',
      },
    },
  },
  render: (_, { globals }) => {
    const theme = globals.theme as Theme;
    let message = '';

    const start = (event: SubmitEvent) => {
      event.preventDefault();
      const data = new FormData(event.target as HTMLFormElement);
      message = `We sent a link to ${data.get('email')}. Open it to start the trial.`;
      status.update();
    };

    const status = renderInto(() => message);

    return html`
      ${styles}
      <style>
        .tp-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          border-radius: 8px;
        }

        .tp-hero h3 {
          margin: 0;
          font-size: 2rem;
          line-height: 1.2;
        }

        .tp-hero-text {
          display: grid;
          gap: 1rem;
        }

        .tp-hero-text p {
          margin: 0;
          color: var(--ig-gray-800);
          font-size: 1.125rem;
        }

        .tp-signup {
          box-shadow: var(--ig-elevation-8);
        }

        .tp-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
          gap: 1.5rem;
          margin: 0;
          padding: 1.5rem 0 0;
          list-style: none;
        }

        .tp-features li {
          display: grid;
          gap: 0.25rem;
        }
      </style>
      <div class="tp-stack">
        <igc-theme-provider theme=${theme} variant="dark">
          <section class="tp-surface tp-hero" aria-labelledby="tp-hero-title">
            ${themeScope(theme, 'dark')}
            <div class="tp-hero-text">
              <h3 id="tp-hero-title">Ship every release with confidence</h3>
              <p>
                Feature flags, staged rollouts and instant rollbacks for your
                whole team.
              </p>
              <div class="tp-row">
                <a class="tp-link" href="#demo">Watch the demo</a>
              </div>
            </div>
            <igc-theme-provider theme=${theme} variant="light">
              <form
                class="tp-panel tp-surface tp-signup"
                aria-labelledby="tp-signup-title"
                @submit=${start}
              >
                ${themeScope(theme, 'light')}
                <h4 id="tp-signup-title">Start your free trial</h4>
                <igc-input
                  type="email"
                  name="email"
                  label="Work email"
                  autocomplete="email"
                  required
                ></igc-input>
                <igc-input
                  name="company"
                  label="Company"
                  autocomplete="organization"
                ></igc-input>
                <igc-checkbox name="updates">
                  Send me product news once a month
                </igc-checkbox>
                <igc-button type="submit">Start the trial</igc-button>
                <p class="muted">14 days free. No credit card needed.</p>
                <p role="status" ${status.mount}></p>
              </form>
            </igc-theme-provider>
          </section>
        </igc-theme-provider>
        <ul class="tp-features">
          <li>
            <strong>Flags in every language</strong>
            <span class="muted">SDKs for the web, mobile and the server.</span>
          </li>
          <li>
            <strong>Staged rollouts</strong>
            <span class="muted">Release to 1% of the users, then to all.</span>
          </li>
          <li>
            <strong>Rollback in one click</strong>
            <span class="muted">Turn a flag off, and the change is gone.</span>
          </li>
        </ul>
      </div>
    `;
  },
};

const themes = Object.keys(themeNames) as Theme[];

type Mode = Variant | 'system';

const modes: { value: Mode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Same as the system' },
];

const themePreview = (theme: Theme, variant: Variant) => html`
  <igc-theme-provider theme=${theme} variant=${variant}>
    <div class="tp-surface tp-mini" inert>
      ${themeScope(theme, variant)}
      <igc-input label="Task" value="Plan the launch"></igc-input>
      <div class="tp-row">
        <igc-switch checked>On</igc-switch>
        <igc-button>Save</igc-button>
      </div>
    </div>
  </igc-theme-provider>
`;

export const AppearanceSettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The appearance settings of a task app. Each theme card shows a small preview in its own provider, and the preview under the cards shows the whole choice. The previews in the cards are `inert`, so the radio buttons are the only controls there. The mode can follow the system with the `prefers-color-scheme` media query. The large preview is a live form: the select opens its list in the theme of the provider, because the list is a descendant of the provider. Save keeps the choice, and Cancel goes back to the saved one.',
      },
    },
  },
  render: () => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    let saved = { theme: 'material' as Theme, mode: 'system' as Mode };
    let draft = { ...saved };
    let message = '';

    const variantOf = (mode: Mode): Variant =>
      mode === 'system' ? (systemDark.matches ? 'dark' : 'light') : mode;

    const pick = (theme: Theme) => () => {
      draft = { ...draft, theme };
      message = '';
      update();
    };

    const pickMode = ({ detail }: CustomEvent<IgcRadioChangeEventArgs>) => {
      draft = { ...draft, mode: detail.value as Mode };
      message = '';
      update();
    };

    const save = () => {
      saved = { ...draft };
      message = `Saved. The app uses ${themeNames[saved.theme]}, ${variantOf(saved.mode)}.`;
      update();
    };

    const cancel = () => {
      draft = { ...saved };
      message = 'The saved appearance is back.';
      update();
    };

    const { mount, update } = renderInto(() => {
      const variant = variantOf(draft.mode);

      return html`
        <h3 id="tp-appearance-title">Appearance</h3>
        <fieldset class="tp-fieldset">
          <legend>Theme</legend>
          <div class="tp-themes">
            ${themes.map(
              (theme) => html`
                <div
                  class="tp-option ${theme === draft.theme ? 'tp-picked' : ''}"
                  @click=${pick(theme)}
                >
                  ${themePreview(theme, variant)}
                  <igc-radio
                    name="theme"
                    value=${theme}
                    .checked=${theme === draft.theme}
                    @igcChange=${pick(theme)}
                  >
                    ${themeNames[theme]}
                  </igc-radio>
                </div>
              `
            )}
          </div>
        </fieldset>
        <igc-radio-group
          aria-labelledby="tp-mode-label"
          alignment="horizontal"
          .value=${draft.mode}
          @igcChange=${pickMode}
        >
          <label id="tp-mode-label">Mode</label>
          ${modes.map(
            ({ value, label }) => html`
              <igc-radio name="mode" value=${value}>${label}</igc-radio>
            `
          )}
        </igc-radio-group>
        <igc-theme-provider theme=${draft.theme} variant=${variant}>
          <section
            class="tp-panel tp-surface"
            aria-labelledby="tp-preview-title"
          >
            ${themeScope(draft.theme, variant)}
            <h4 id="tp-preview-title">
              Preview: ${themeNames[draft.theme]}, ${variant}
            </h4>
            <igc-input label="Task name" value="Plan the launch"></igc-input>
            <igc-select label="Priority" value="high">
              <igc-select-item value="low">Low</igc-select-item>
              <igc-select-item value="normal">Normal</igc-select-item>
              <igc-select-item value="high">High</igc-select-item>
            </igc-select>
            <igc-switch checked>Notify the assignee</igc-switch>
            <div class="tp-row">
              <igc-button>Add the task</igc-button>
              <igc-button variant="outlined">Discard</igc-button>
            </div>
          </section>
        </igc-theme-provider>
        <div class="tp-row tp-end">
          <igc-button variant="flat" @click=${cancel}>Cancel</igc-button>
          <igc-button @click=${save}>Save</igc-button>
        </div>
        <p class="muted" role="status">${message}</p>
      `;
    });

    const watchSystem = (element?: Element) =>
      element
        ? systemDark.addEventListener('change', update)
        : systemDark.removeEventListener('change', update);

    return html`
      ${styles}
      <style>
        .tp-appearance {
          max-width: 44rem;
        }

        .tp-fieldset {
          margin: 0;
          padding: 0;
        }

        .tp-appearance igc-radio-group > label {
          font-weight: 600;
        }

        .tp-fieldset legend {
          margin-block-end: 0.5rem;
          padding: 0;
          font-weight: 600;
        }

        .tp-themes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
          gap: 1rem;
        }

        .tp-option {
          display: grid;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 2px solid var(--ig-gray-300);
          border-radius: 8px;
          cursor: pointer;
        }

        .tp-option.tp-picked {
          border-color: var(--ig-primary-500);
        }

        .tp-mini {
          display: grid;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 4px;
          zoom: 0.75;
        }

        .tp-end {
          justify-content: flex-end;
        }
      </style>
      <section
        class="tp-stack tp-appearance"
        aria-labelledby="tp-appearance-title"
        ${mount}
        ${ref(watchSystem)}
      ></section>
    `;
  },
};

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8];
const tableTimes = ['6:00 PM', '6:30 PM', '7:30 PM', '8:15 PM'];
const bookingDate = addDays(today, 2);

export const EmbeddedWidget: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A restaurant page with a booking widget from a partner. The partner builds its widget with the Indigo theme, light, and keeps it whatever theme the page uses. The calendar of the date picker and the list of the select open in the top layer, but they are descendants of the provider, so they take its theme too.',
      },
    },
  },
  render: () => {
    const form = createRef<HTMLFormElement>();
    let searched = false;
    let booking = '';

    const find = (event: SubmitEvent) => {
      event.preventDefault();
      searched = true;
      booking = '';
      update();
    };

    const book = (time: string) => () => {
      const data = new FormData(form.value);
      const date = form.value?.querySelector('igc-date-picker')?.value;

      booking = `Your table for ${data.get('guests')} on ${formatDate(date ?? bookingDate)} at ${time} is booked.`;
      update();
    };

    const story = renderInto(
      () => html`
        ${
          searched
            ? html`
                <fieldset class="tp-times">
                  <legend>Free tables</legend>
                  ${tableTimes.map(
                    (time) => html`
                      <igc-button variant="outlined" @click=${book(time)}>
                        ${time}
                      </igc-button>
                    `
                  )}
                </fieldset>
              `
            : ''
        }
        <p role="status">${booking}</p>
      `
    );
    const { update } = story;

    return html`
      ${styles}
      <style>
        .tp-page {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
          align-items: start;
          gap: 1.5rem;
        }

        .tp-article {
          display: grid;
          gap: 0.75rem;
        }

        .tp-article :is(h3, p) {
          margin: 0;
        }

        .tp-widget-head {
          display: grid;
        }

        .tp-by {
          color: var(--ig-gray-700);
          font-size: 0.875rem;
        }

        .tp-times {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
        }

        .tp-times legend {
          margin-block-end: 0.5rem;
          padding: 0;
        }
      </style>
      <div class="tp-page">
        <article class="tp-article" aria-labelledby="tp-place-title">
          <h3 id="tp-place-title">Harbor House</h3>
          <p class="muted">Seafood, Oakland, CA</p>
          <p>
            Fresh fish from the bay, oysters at the counter and a terrace over
            the water. Open every day from 5 PM.
          </p>
          <div class="tp-row">
            <igc-button variant="outlined">Get directions</igc-button>
            <igc-button variant="flat">See the menu</igc-button>
          </div>
        </article>
        <igc-theme-provider theme="indigo" variant="light">
          <section
            class="tp-panel tp-surface tp-widget"
            aria-labelledby="tp-widget-title"
          >
            ${themeScope('indigo', 'light')}
            <div class="tp-widget-head">
              <h4 id="tp-widget-title">Book a table</h4>
              <span class="tp-by">Powered by TableTime</span>
            </div>
            <form class="tp-stack" ${ref(form)} @submit=${find}>
              <igc-date-picker
                label="Date"
                .value=${bookingDate}
                .min=${today}
                required
              ></igc-date-picker>
              <igc-select name="guests" label="Guests" value="2">
                ${partySizes.map(
                  (size) => html`
                    <igc-select-item value=${size}>
                      ${plural(size, 'guest')}
                    </igc-select-item>
                  `
                )}
              </igc-select>
              <igc-button type="submit">Find a table</igc-button>
            </form>
            <div class="tp-stack" ${story.mount}></div>
          </section>
        </igc-theme-provider>
      </div>
    `;
  },
};
