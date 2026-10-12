import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSelectComponent,
  type IgcSelectItemComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  scrollingPanel,
  storyStyles,
} from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSelectComponent
);
registerMaterialIcons('language', 'person');

// region default
const metadata: Meta<IgcSelectComponent> = {
  title: 'Select',
  component: 'igc-select',
  parameters: {
    docs: {
      description: {
        component: 'Represents a control that provides a menu of options.',
      },
    },
    actions: {
      handles: [
        'igcChange',
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
      ],
    },
  },
  argTypes: {
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control has an outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control should receive focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    distance: {
      type: 'number',
      description: 'The distance of the select dropdown from its input.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    placement: {
      type: {
        name: 'enum',
        value: [
          'bottom',
          'top',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
          'left',
          'right',
          'right-start',
          'right-end',
          'left-start',
          'left-end',
        ],
      },
      description:
        'The preferred placement of the select dropdown around its input.',
      options: [
        'bottom',
        'top',
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
        'right-start',
        'right-end',
        'left-start',
        'left-end',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'bottom-start' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Keeps the dropdown of the component open after the user selects an item.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Keeps the dropdown of the component open when the user clicks outside of\nit.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'Sets the behavior of the component when the parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
  },
  args: {
    outlined: false,
    autofocus: false,
    distance: 0,
    placement: 'bottom-start',
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
    scrollStrategy: 'hide',
  },
};

export default metadata;

interface IgcSelectArgs {
  /** The value of the control. */
  value: string;
  /** Whether the control has an outlined appearance. */
  outlined: boolean;
  /** Whether the control should receive focus automatically. */
  autofocus: boolean;
  /** The distance of the select dropdown from its input. */
  distance: number;
  /** The label of the control. */
  label: string;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The preferred placement of the select dropdown around its input. */
  placement:
    | 'bottom'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Keeps the dropdown of the component open after the user selects an item. */
  keepOpenOnSelect: boolean;
  /**
   * Keeps the dropdown of the component open when the user clicks outside of
   * it.
   */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
}
type Story = StoryObj<IgcSelectArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .se-panel {
      display: grid;
      gap: 1rem;
      max-width: 32rem;
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .se-panel :is(h3, p, ol) {
      margin: 0;
    }

    .se-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  </style>
`;

const sortOptions = [
  { value: 'featured', text: 'Featured' },
  { value: 'price-asc', text: 'Price: low to high' },
  { value: 'price-desc', text: 'Price: high to low' },
  { value: 'rating', text: 'Customer rating' },
  { value: 'newest', text: 'Newest arrivals' },
];

export const Default: Story = {
  args: {
    label: 'Sort by',
    value: 'featured',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The sort order of a product list. A click, Space, Enter or Alt + Arrow Down opens the list. While the list is closed, the arrow keys, Home and End change the value at once, and typing the first letters of an option selects it. Use the controls panel to change the label, the placement, the style and the states.',
      },
    },
  },
  render: (args) => html`
    <igc-select
      style="max-width: 20rem"
      .value=${args.value}
      .label=${args.label}
      .name=${args.name}
      .placeholder=${args.placeholder}
      .placement=${args.placement}
      .scrollStrategy=${args.scrollStrategy}
      .distance=${args.distance}
      ?open=${args.open}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=${args.keepOpenOnSelect}
      ?autofocus=${args.autofocus}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      ${sortOptions.map(
        ({ value, text }) =>
          html`<igc-select-item value=${value}>${text}</igc-select-item>`
      )}
    </igc-select>
  `,
};

const shippingRegions = [
  {
    region: 'Europe',
    countries: [
      { code: 'BG', name: 'Bulgaria' },
      { code: 'DE', name: 'Germany' },
      { code: 'GB', name: 'United Kingdom' },
    ],
  },
  {
    region: 'North America',
    countries: [
      { code: 'CA', name: 'Canada' },
      { code: 'MX', name: 'Mexico' },
      { code: 'US', name: 'United States' },
    ],
  },
  {
    region: 'Asia Pacific',
    countries: [
      { code: 'AU', name: 'Australia' },
      { code: 'IN', name: 'India' },
      { code: 'JP', name: 'Japan', paused: true },
    ],
  },
];

/** The countries that need a state or a province in the address. */
const subdivisions: Record<string, { label: string; names: string[] }> = {
  AU: {
    label: 'State',
    names: ['New South Wales', 'Queensland', 'Victoria', 'Western Australia'],
  },
  CA: {
    label: 'Province',
    names: ['Alberta', 'British Columbia', 'Ontario', 'Quebec'],
  },
  IN: {
    label: 'State',
    names: ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal'],
  },
  US: {
    label: 'State',
    names: ['California', 'New York', 'Texas', 'Washington'],
  },
};

const defaultCountry = 'US';

export const ShippingAddress: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A shipping address form. `igc-select-group` elements sort the countries by region, and a disabled item marks a country where shipping is paused. The country is required and its default comes from the `value` attribute, so Reset returns to it. The state or province select changes its items with the country. A select keeps its value when its items change, so that a value set before the items arrive still applies. Thus the form calls `clearSelection()` when a new country replaces the items. Submit the form with no state to see the `value-missing` message.',
      },
    },
  },
  render: () => {
    const state = { country: defaultCountry };

    const story = renderInto(() => {
      const subdivision = subdivisions[state.country];

      return html`
        <form
          class="se-panel"
          @submit=${formSubmitHandler}
          @reset=${() => {
            state.country = defaultCountry;
            story.update();
          }}
        >
          <h3>Shipping address</h3>
          <igc-input
            name="name"
            label="Full name"
            autocomplete="name"
            required
          ></igc-input>
          <igc-input
            name="street"
            label="Street address"
            autocomplete="address-line1"
            required
          ></igc-input>
          <igc-select
            name="country"
            label="Country"
            value=${defaultCountry}
            required
            @igcChange=${({ detail }: CustomEvent<IgcSelectItemComponent>) => {
              state.country = detail.value;
              story.update();
              story.host
                ?.querySelector<IgcSelectComponent>('#se-subdivision')
                ?.clearSelection();
            }}
          >
            ${shippingRegions.map(
              ({ region, countries }) => html`
                <igc-select-group>
                  <igc-select-header slot="label">${region}</igc-select-header>
                  ${countries.map(
                    ({ code, name, paused }) => html`
                      <igc-select-item value=${code} ?disabled=${paused}>
                        ${name}
                        ${
                          paused
                            ? html`<span slot="suffix">Shipping paused</span>`
                            : nothing
                        }
                      </igc-select-item>
                    `
                  )}
                </igc-select-group>
              `
            )}
            <span slot="helper-text"
              >We ship to the countries in the list.</span
            >
          </igc-select>
          ${
            subdivision
              ? html`
                  <igc-select
                    id="se-subdivision"
                    name="subdivision"
                    label=${subdivision.label}
                    required
                  >
                    ${subdivision.names.map(
                      (name) =>
                        html`<igc-select-item value=${name}
                          >${name}</igc-select-item
                        >`
                    )}
                    <span slot="value-missing">
                      Select a ${subdivision.label.toLowerCase()}.
                    </span>
                  </igc-select>
                `
              : nothing
          }
          <igc-input
            name="postal-code"
            label="Postal code"
            autocomplete="postal-code"
            required
          ></igc-input>
          <div class="se-actions">
            <igc-button type="submit">Save address</igc-button>
            <igc-button type="reset" variant="outlined">Reset</igc-button>
          </div>
        </form>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const agents = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', team: 'Support' },
  { id: 'priya', name: 'Priya Shah', initials: 'PS', team: 'Support' },
  { id: 'jonas', name: 'Jonas Keller', initials: 'JK', team: 'Billing' },
  { id: 'maya', name: 'Maya Robinson', initials: 'MR', team: 'Billing' },
  { id: 'tom', name: 'Tom Baker', initials: 'TB', team: 'Billing', away: true },
];
const currentAgent = agents[0];
const agentName = (id?: string) =>
  agents.find((agent) => agent.id === id)?.name;

export const AssignTicket: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The assignee of a support ticket. Each item shows an avatar in its `prefix` slot and the availability in its `suffix` slot, and the input shows only the name. The `prefix` slot of the select holds a person icon. "Assign to me" calls `select()` and "Unassign" calls `clearSelection()`. These methods send no `igcChange` event, so the buttons write the activity entries themselves.',
      },
    },
  },
  render: () => {
    const activity = ['Ticket opened by Dana White.'];

    const story = renderInto(
      () => html`
        <section class="se-panel" aria-labelledby="se-ticket-title">
          <h3 id="se-ticket-title">#4821 Refund not received</h3>
          <p class="muted">
            The refund for order 10377 has not reached my card after 10 days.
          </p>
          <igc-select
            id="se-assignee"
            label="Assignee"
            placeholder="Unassigned"
            @igcChange=${({ detail }: CustomEvent<IgcSelectItemComponent>) => {
              activity.push(`Assigned to ${agentName(detail.value)}.`);
              story.update();
            }}
          >
            <igc-icon slot="prefix" name="person"></igc-icon>
            ${['Support', 'Billing'].map(
              (team) => html`
                <igc-select-group>
                  <igc-select-header slot="label">${team}</igc-select-header>
                  ${agents
                    .filter((agent) => agent.team === team)
                    .map(
                      ({ id, name, initials, away }) => html`
                        <igc-select-item value=${id} ?disabled=${away}>
                          <igc-avatar
                            slot="prefix"
                            shape="circle"
                            initials=${initials}
                            aria-hidden="true"
                          ></igc-avatar>
                          ${name}
                          <span slot="suffix"
                            >${away ? 'Away' : 'Available'}</span
                          >
                        </igc-select-item>
                      `
                    )}
                </igc-select-group>
              `
            )}
          </igc-select>
          <div class="se-actions">
            <igc-button
              variant="outlined"
              @click=${() => {
                const select =
                  story.host!.querySelector<IgcSelectComponent>(
                    '#se-assignee'
                  )!;
                if (select.value !== currentAgent.id) {
                  select.select(currentAgent.id);
                  activity.push(`Assigned to ${currentAgent.name}.`);
                  story.update();
                }
              }}
              >Assign to me</igc-button
            >
            <igc-button
              variant="outlined"
              @click=${() => {
                const select =
                  story.host!.querySelector<IgcSelectComponent>(
                    '#se-assignee'
                  )!;
                if (select.value) {
                  select.clearSelection();
                  activity.push('Unassigned.');
                  story.update();
                }
              }}
              >Unassign</igc-button
            >
          </div>
          <h4>Activity</h4>
          <ol class="se-activity">
            ${activity.map((entry) => html`<li>${entry}</li>`)}
          </ol>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        #se-assignee igc-avatar {
          --ig-avatar-size: 1.5rem;
        }

        #se-assignee [slot='suffix'] {
          color: var(--ig-gray-700);
          font-size: 0.875rem;
        }

        .se-panel h4 {
          margin: 0;
        }

        .se-activity {
          padding-inline-start: 1.25rem;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const languages = [
  { code: 'en', name: 'English', greeting: 'Welcome back, Alex' },
  { code: 'de', name: 'Deutsch', greeting: 'Willkommen zurück, Alex' },
  { code: 'es', name: 'Español', greeting: 'Bienvenido de nuevo, Alex' },
  { code: 'fr', name: 'Français', greeting: 'Bon retour, Alex' },
  { code: 'bg', name: 'Български', greeting: 'Добре дошъл отново, Alex' },
  { code: 'ja', name: '日本語', greeting: 'おかえりなさい、Alex さん' },
];

export const LanguagePicker: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A language picker in the footer of a page. The picker sits at the bottom, so `placement="top-start"` opens the list above it. Each item shows the name of a language in that language, and its `lang` attribute tells screen readers how to pronounce it. The page takes the new language on `igcChange`.',
      },
    },
  },
  render: () => {
    const state = { code: 'en' };

    const story = renderInto(() => {
      const language = languages.find(({ code }) => code === state.code)!;

      return html`
        <div class="se-page">
          <main lang=${language.code}>
            <h3>${language.greeting}</h3>
          </main>
          <footer>
            <igc-select
              label="Language"
              placement="top-start"
              outlined
              .value=${state.code}
              @igcChange=${({
                detail,
              }: CustomEvent<IgcSelectItemComponent>) => {
                state.code = detail.value;
                story.update();
              }}
            >
              <igc-icon slot="prefix" name="language"></igc-icon>
              ${languages.map(
                ({ code, name }) => html`
                  <igc-select-item value=${code} lang=${code}>
                    ${name}
                  </igc-select-item>
                `
              )}
            </igc-select>
          </footer>
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .se-page {
          display: grid;
          grid-template-rows: 1fr auto;
          max-width: 40rem;
          min-height: 24rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .se-page main {
          padding: 1.5rem;
        }

        .se-page footer {
          padding: 1rem 1.5rem;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .se-page igc-select {
          max-width: 14rem;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const timeZones = [
  'Pacific Time (UTC-08:00)',
  'Mountain Time (UTC-07:00)',
  'Central Time (UTC-06:00)',
  'Eastern Time (UTC-05:00)',
  'London (UTC+00:00)',
  'Berlin (UTC+01:00)',
  'Sofia (UTC+02:00)',
  'Tokyo (UTC+09:00)',
];

export const InScrollingPanel: Story = {
  args: {
    label: 'Time zone',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A select opens its list inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the list when the panel scrolls. If the value is `hide`, the list hides while the input is out of view. `hide` is the default value. If the value is `scroll`, the list follows the input. If the value is `close`, the list closes.',
      },
    },
  },
  render: ({ label, placement, distance, scrollStrategy }) =>
    scrollingPanel(
      'Meeting settings',
      'list',
      'The time zone sets the start time that each attendee sees.',
      html`
        <igc-select
          .label=${label}
          .placement=${placement}
          .distance=${distance}
          .scrollStrategy=${scrollStrategy}
        >
          ${timeZones.map(
            (zone) =>
              html`<igc-select-item value=${zone}>${zone}</igc-select-item>`
          )}
        </igc-select>
      `
    ),
};
