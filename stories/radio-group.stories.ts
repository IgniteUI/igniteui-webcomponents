import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { addDays, formatDate, longDate, today } from './story-dates.js';
import {
  delay,
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(IgcButtonComponent, IgcRadioGroupComponent, IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioGroupComponent> = {
  title: 'RadioGroup',
  component: 'igc-radio-group',
  parameters: {
    docs: {
      description: {
        component: 'Unifies one or more radio components into a single group.',
      },
    },
  },
  argTypes: {
    alignment: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'Alignment of the radio controls inside this group.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    name: {
      type: 'string',
      description: 'The name applied to all radio buttons in the group.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'The value of the group, reflecting the value of the currently checked radio button.\nSetting it checks the radio button in the group with a matching value.',
      control: 'text',
    },
  },
  args: { alignment: 'vertical' },
};

export default metadata;

interface IgcRadioGroupArgs {
  /** Alignment of the radio controls inside this group. */
  alignment: 'horizontal' | 'vertical';
  /** The name applied to all radio buttons in the group. */
  name: string;
  /**
   * The value of the group, reflecting the value of the currently checked radio button.
   * Setting it checks the radio button in the group with a matching value.
   */
  value: string;
}
type Story = StoryObj<IgcRadioGroupArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .rg-stack {
      display: grid;
      gap: 1.5rem;
      max-width: 40rem;
    }

    .rg-stack :is(h3, p) {
      margin: 0;
    }

    .rg-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .rg-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .rg-stack igc-radio-group > label {
      font-weight: 600;
    }
  </style>
`;

export const Default: Story = {
  args: {
    name: 'contact',
    value: 'email',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The contact preference in a customer profile. The group gives its `name` to each radio, and its `value` checks the radio with the same value. The group has the `radiogroup` role. A `label` element in the group shows the group label, and the `aria-labelledby` of the group points to it. A `label` element with `for` cannot name the group, because the group is not a form control. Use the controls panel to change the alignment and the value.',
      },
    },
  },
  render: (args) => html`
    <igc-radio-group
      aria-labelledby="rg-contact-label"
      alignment=${ifDefined(args.alignment)}
      name=${ifDefined(args.name)}
      value=${ifDefined(args.value)}
    >
      <label id="rg-contact-label">Preferred contact method</label>
      <igc-radio value="email">Email</igc-radio>
      <igc-radio value="phone">Phone</igc-radio>
      <igc-radio value="text">Text message</igc-radio>
      <igc-radio value="mail">Mail</igc-radio>
    </igc-radio-group>
  `,
};

type Settings = { theme: string; density: string };

const settingOptions = [
  {
    key: 'theme',
    label: 'Theme',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Match the system' },
    ],
  },
  {
    key: 'density',
    label: 'Density',
    options: [
      { value: 'compact', label: 'Compact' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'spacious', label: 'Spacious' },
    ],
  },
] as const;

const previewMessages = [
  ['Maya Patel', 'Notes from the design review'],
  ['Daniel Okafor', 'Agenda for the sprint planning'],
  ['Billing', 'Your invoice for September'],
];

export const DisplaySettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The display settings of an email client. Each setting is a horizontal group, and the preview follows the `value` of the groups. The `defaultValue` of each group holds the saved setting. Discard is a reset button, and a form reset checks the radio of the `defaultValue` again. Save copies the current values into `defaultValue`. The radios have no `checked` attribute: the group sets the selection.',
      },
    },
  },
  render: () => {
    let saved: Settings = { theme: 'system', density: 'comfortable' };
    let current = { ...saved };
    let message = '';

    const change = (event: CustomEvent) => {
      const group = (event.target as HTMLElement).closest('igc-radio-group')!;
      current = { ...current, [group.name]: group.value };
      message = '';
      update();
    };

    const save = (event: SubmitEvent) => {
      event.preventDefault();
      saved = { ...current };
      message = 'Your settings are saved.';
      update();
    };

    const discard = () => {
      current = { ...saved };
      message = 'You discarded your changes.';
      update();
    };

    const { mount, update } = renderInto(() => {
      const changed =
        current.theme !== saved.theme || current.density !== saved.density;
      const dark =
        current.theme === 'dark' ||
        (current.theme === 'system' &&
          matchMedia('(prefers-color-scheme: dark)').matches);

      return html`
        <h3>Display</h3>
        ${settingOptions.map(
          ({ key, label, options }) => html`
            <igc-radio-group
              alignment="horizontal"
              name=${key}
              value=${saved[key]}
              .defaultValue=${saved[key]}
              aria-labelledby="rg-${key}-label"
            >
              <label id="rg-${key}-label">${label}</label>
              ${options.map(
                (option) => html`
                  <igc-radio value=${option.value}>${option.label}</igc-radio>
                `
              )}
            </igc-radio-group>
          `
        )}
        <figure class="rg-preview">
          <figcaption class="muted">Preview</figcaption>
          <ul class=${`${dark ? 'rg-dark' : 'rg-light'} rg-${current.density}`}>
            ${previewMessages.map(
              ([from, subject]) => html`
                <li><strong>${from}</strong><span>${subject}</span></li>
              `
            )}
          </ul>
        </figure>
        <div class="rg-row">
          <igc-button type="submit" ?disabled=${!changed}>Save</igc-button>
          <igc-button type="reset" variant="outlined" ?disabled=${!changed}>
            Discard
          </igc-button>
          <span class="muted" role="status">
            ${changed ? 'You have unsaved changes.' : message}
          </span>
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .rg-preview {
          display: grid;
          gap: 0.5rem;
          margin: 0;
        }

        .rg-preview ul {
          margin: 0;
          padding: 0;
          list-style: none;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          overflow: hidden;
        }

        .rg-preview li {
          display: grid;
          grid-template-columns: 9rem 1fr;
          gap: 1rem;
          padding: var(--rg-row-padding) 1rem;
        }

        .rg-preview li + li {
          border-block-start: 1px solid var(--rg-divider);
        }

        .rg-light {
          --rg-divider: #e0e0e0;

          background: #fff;
          color: #1f1f1f;
        }

        .rg-dark {
          --rg-divider: #3c3c3c;

          background: #1f1f1f;
          color: #f1f1f1;
        }

        .rg-compact {
          --rg-row-padding: 0.25rem;
        }

        .rg-comfortable {
          --rg-row-padding: 0.625rem;
        }

        .rg-spacious {
          --rg-row-padding: 1rem;
        }
      </style>
      <form
        class="rg-stack rg-panel"
        aria-label="Display settings"
        @igcChange=${change}
        @submit=${save}
        @reset=${discard}
        ${mount}
      ></form>
    `;
  },
};

const recommendScale = Array.from({ length: 11 }, (_, index) => `${index}`);

const frequencies = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'A few times a week' },
  { value: 'monthly', label: 'A few times a month' },
  { value: 'rarely', label: 'Less often' },
];

export const Survey: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A short customer survey. The first question is a horizontal group with a scale from 0 to 10. The radio labels are the numbers, so the `aria-describedby` of the group points to the meaning of the two ends of the scale. A style on the `base` part puts each number under its radio. Each radio is `required`, so the form does not submit until each question has an answer, and the last radio of each group has the `value-missing` message. Submit shows the form data.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .rg-scale {
        display: grid;
        gap: 0.5rem;
        width: fit-content;
      }

      .rg-scale igc-radio::part(base) {
        flex-direction: column;
        gap: 0;
      }

      .rg-scale-ends {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
      }
    </style>
    <form
      class="rg-stack rg-panel"
      aria-label="Customer survey"
      @submit=${formSubmitHandler}
    >
      <h3>How do we do?</h3>
      <p class="muted">Two questions. It takes less than a minute.</p>
      <div class="rg-scale">
        <igc-radio-group
          alignment="horizontal"
          name="recommend"
          aria-labelledby="rg-recommend-label"
          aria-describedby="rg-recommend-ends"
        >
          <label id="rg-recommend-label">
            How likely is it that you recommend us to a friend or a colleague?
          </label>
          ${recommendScale.map(
            (value) => html`
              <igc-radio value=${value} required>
                ${value}
                ${
                  value === '10'
                    ? html`<span slot="value-missing">Choose a number.</span>`
                    : ''
                }
              </igc-radio>
            `
          )}
        </igc-radio-group>
        <div id="rg-recommend-ends" class="rg-scale-ends muted">
          <span>0: Not likely at all.</span>
          <span>10: Extremely likely.</span>
        </div>
      </div>
      <igc-radio-group name="frequency" aria-labelledby="rg-frequency-label">
        <label id="rg-frequency-label">How often do you use the product?</label>
        ${frequencies.map(
          ({ value, label }) => html`
            <igc-radio value=${value} required>
              ${label}
              ${
                value === 'rarely'
                  ? html`<span slot="value-missing">Choose an answer.</span>`
                  : ''
              }
            </igc-radio>
          `
        )}
      </igc-radio-group>
      <div class="rg-row">
        <igc-button type="submit">Send</igc-button>
        <igc-button type="reset" variant="outlined">Clear</igc-button>
      </div>
    </form>
  `,
};

const slotTimes = [
  { value: '08-10', label: '08:00 to 10:00' },
  { value: '10-12', label: '10:00 to 12:00' },
  { value: '12-14', label: '12:00 to 14:00' },
  { value: '14-16', label: '14:00 to 16:00' },
  { value: '16-18', label: '16:00 to 18:00' },
  { value: '18-20', label: '18:00 to 20:00' },
];

const deliveryDays = [1, 2, 3].map((days) => addDays(today, days));

/** The full slots of each delivery day. */
const fullSlots = [['08-10', '10-12'], ['18-20'], ['12-14', '14-16', '16-18']];

export const DeliverySlots: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The delivery slot step of a grocery order. The free slots of a day load from the server, so the radios of the slot group arrive after the group. The cart already has a slot, and the page sets it as the `value` of the group before the radios arrive. The group keeps the value and checks the matching radio when it arrives. When you go back to the day of your slot, the page sets the value again. A full slot is a disabled radio, and the arrow keys skip it.',
      },
    },
  },
  render: () => {
    let day = 0;
    let loading = true;
    let selection = { day: 0, slot: '18-20' };
    let request = 0;

    const load = async (index: number) => {
      const current = ++request;
      day = index;
      loading = true;
      view.update();

      await delay(800);

      const group =
        view.host?.querySelector<IgcRadioGroupComponent>('.rg-slots');

      if (current !== request || !group) {
        return;
      }

      // The radios of the day do not exist yet. The group keeps the value
      // and checks the matching radio when it arrives.
      group.value = selection.day === day ? selection.slot : '';
      loading = false;
      view.update();
    };

    const chooseDay = (event: CustomEvent) => {
      load(Number((event.currentTarget as IgcRadioGroupComponent).value));
    };

    const chooseSlot = (event: CustomEvent) => {
      selection = {
        day,
        slot: (event.currentTarget as IgcRadioGroupComponent).value,
      };
      view.update();
    };

    const view = renderInto(() => {
      const chosen = slotTimes.find(({ value }) => value === selection.slot)!;

      return html`
        <h3>Choose a delivery slot</h3>
        <igc-radio-group
          alignment="horizontal"
          name="day"
          value="0"
          aria-labelledby="rg-day-label"
          @igcChange=${chooseDay}
        >
          <label id="rg-day-label">Day</label>
          ${deliveryDays.map(
            (date, index) => html`
              <igc-radio value=${`${index}`}>${formatDate(date)}</igc-radio>
            `
          )}
        </igc-radio-group>
        <igc-radio-group
          class="rg-slots"
          name="slot"
          aria-labelledby="rg-slot-label"
          aria-busy=${loading ? 'true' : 'false'}
          @igcChange=${chooseSlot}
        >
          <label id="rg-slot-label">
            Free slots on ${formatDate(deliveryDays[day], longDate)}
          </label>
          ${
            loading
              ? ''
              : slotTimes.map(({ value, label }) => {
                  const full = fullSlots[day].includes(value);

                  return html`
                    <igc-radio value=${value} ?disabled=${full}>
                      ${full ? `${label} (full)` : label}
                    </igc-radio>
                  `;
                })
          }
        </igc-radio-group>
        ${loading ? html`<p class="muted">Loading the free slots...</p>` : ''}
        <p role="status">
          Your slot: ${formatDate(deliveryDays[selection.day], longDate)},
          ${chosen.label}.
        </p>
      `;
    });

    load(0);

    return html`
      ${styles}
      <section
        class="rg-stack rg-panel"
        aria-label="Delivery slot"
        ${view.mount}
      ></section>
    `;
  },
};
