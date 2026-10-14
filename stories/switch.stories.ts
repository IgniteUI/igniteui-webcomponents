import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  type IgcCheckboxChangeEventArgs,
  IgcDialogComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  dollars,
  formSubmitHandler,
  renderInto,
  storyStyles,
  wholeDollars,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcDialogComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTextareaComponent
);
registerMaterialIcons('chat', 'cloud', 'event', 'videocam');

// region default
const metadata: Meta<IgcSwitchComponent> = {
  title: 'Switch',
  component: 'igc-switch',
  parameters: {
    docs: {
      description: {
        component:
          'Similar to a checkbox, a switch controls the state of a single setting on or off.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
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
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelPosition: {
      type: { name: 'enum', value: ['after', 'before'] },
      description: 'The label position of the control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
    },
  },
  args: {
    required: false,
    disabled: false,
    invalid: false,
    checked: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcSwitchArgs {
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** The value of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'after' | 'before';
}
type Story = StoryObj<IgcSwitchArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .sw-stack {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
    }

    .sw-stack :is(h3, h4, p, ul) {
      margin: 0;
    }

    .sw-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .sw-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .sw-setting {
      display: grid;
      gap: 0.25rem;
      padding-block: 0.75rem;
      border-block-end: 1px solid var(--ig-gray-300);
    }

    .sw-setting igc-switch::part(base) {
      justify-content: space-between;
    }

    .sw-setting igc-switch::part(label) {
      font-weight: 600;
    }
  </style>
`;

type SwitchChange = CustomEvent<IgcCheckboxChangeEventArgs>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The airplane mode setting of a phone. A switch turns one setting on or off, and the change takes effect at once. The content between the tags is the label, and a click on the label toggles the switch. Space toggles it from the keyboard. Use the controls panel to change the state. `label-position` puts the label before or after the track. `invalid` sets only the invalid style, and `required` adds the validation.',
      },
    },
  },
  render: (args) => html`
    <igc-switch
      .labelPosition=${args.labelPosition}
      .name=${args.name}
      .value=${args.value}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      .invalid=${args.invalid}
    >
      Airplane mode
    </igc-switch>
  `,
};

const plans = [
  {
    name: 'Starter',
    monthly: 12,
    features: ['3 projects', '5 GB of storage', 'Email support'],
  },
  {
    name: 'Team',
    monthly: 29,
    features: ['Unlimited projects', '100 GB of storage', 'Chat support'],
  },
  {
    name: 'Business',
    monthly: 59,
    features: ['Single sign-on', '1 TB of storage', 'A dedicated manager'],
  },
];

/** A yearly plan costs 20% less. */
const yearlyRate = 0.8;

const price = (amount: number) =>
  Number.isInteger(amount)
    ? wholeDollars.format(amount)
    : dollars.format(amount);

export const BillingPeriod: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The pricing page of a software service. The switch chooses between monthly and yearly billing, and the prices change at once. The text "Monthly" before the switch has `aria-hidden`, so the name of the switch is only its label, and a screen reader reads "Yearly" with the state of the switch. The host `aria-describedby` points to the saving, and the switch describes its native input with it. The `igcChange` handler reads `detail.checked`.',
      },
    },
  },
  render: () => {
    let yearly = false;
    let chosen = '';

    const toggle = ({ detail }: SwitchChange) => {
      yearly = detail.checked;
      chosen = '';
      update();
    };

    const choose = (name: string, total: string) => () => {
      chosen = `You chose ${name} for ${total}.`;
      update();
    };

    const { mount, update } = renderInto(
      () => html`
        <h3 id="sw-pricing-title">Choose a plan</h3>
        <div class="sw-row sw-billing">
          <span aria-hidden="true">Monthly</span>
          <igc-switch
            aria-describedby="sw-saving"
            .checked=${yearly}
            @igcChange=${toggle}
          >
            Yearly
          </igc-switch>
          <span id="sw-saving" class="sw-saving">Save 20%</span>
        </div>
        <ul class="sw-plans">
          ${plans.map(({ name, monthly, features }) => {
            const perMonth = price(yearly ? monthly * yearlyRate : monthly);
            const total = yearly
              ? `${price(monthly * 12 * yearlyRate)} a year`
              : `${perMonth} a month`;

            return html`
              <li class="sw-panel sw-plan">
                <h4>${name}</h4>
                <p><strong class="sw-price">${perMonth}</strong> a month</p>
                <p class="muted">
                  ${yearly ? `Billed ${total}` : 'Billed every month'}
                </p>
                <ul class="sw-features">
                  ${features.map((feature) => html`<li>${feature}</li>`)}
                </ul>
                <igc-button variant="outlined" @click=${choose(name, total)}>
                  Choose ${name}
                </igc-button>
              </li>
            `;
          })}
        </ul>
        <p class="muted" role="status">${chosen}</p>
      `
    );

    return html`
      ${styles}
      <style>
        .sw-billing {
          justify-content: center;
          font-weight: 600;
        }

        .sw-saving {
          padding: 0.125rem 0.5rem;
          border: 1px solid var(--ig-primary-500);
          border-radius: 1rem;
          font-size: 0.875rem;
        }

        .sw-plans {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
          gap: 1rem;
          padding: 0;
          list-style: none;
        }

        .sw-plan {
          display: grid;
          grid-template-rows: auto auto auto 1fr auto;
          gap: 0.5rem;
        }

        .sw-price {
          font-size: 1.5rem;
        }

        .sw-features {
          padding-inline-start: 1.25rem;
        }
      </style>
      <section
        class="sw-stack"
        aria-labelledby="sw-pricing-title"
        ${mount}
      ></section>
    `;
  },
};

const displayPreferences = [
  {
    id: 'larger-text',
    label: 'Larger text',
    help: 'Makes the text 25% bigger.',
  },
  {
    id: 'bold-text',
    label: 'Bold text',
    help: 'Makes the text thicker and easier to read.',
  },
  {
    id: 'reduce-motion',
    label: 'Reduce motion',
    help: 'Stops the animations. It is on when your device asks for less motion.',
  },
  {
    id: 'compact',
    label: 'Compact layout',
    help: 'Shows more content with less space between the items.',
  },
] as const;

type DisplayPreference = (typeof displayPreferences)[number]['id'];

export const DisplayPreferences: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The display settings of an app, with a preview that changes at once. `label-position="before"` puts each label first, and a style on the `base` part moves the track to the end of the row. Each switch has a host `aria-describedby` that points to the text under it, and the switch describes its native input with that text. "Reduce motion" starts on when the device asks for less motion (`prefers-reduced-motion`), and it stops the animations of the preview.',
      },
    },
  },
  render: () => {
    const enabled: Record<DisplayPreference, boolean> = {
      'larger-text': false,
      'bold-text': false,
      'reduce-motion': matchMedia('(prefers-reduced-motion: reduce)').matches,
      compact: false,
    };

    const toggle =
      (id: DisplayPreference) =>
      ({ detail }: SwitchChange) => {
        enabled[id] = detail.checked;
        update();
      };

    const { mount, update } = renderInto(
      () => html`
        <section
          class="sw-panel sw-settings"
          aria-labelledby="sw-display-title"
        >
          <h3 id="sw-display-title">Display</h3>
          ${displayPreferences.map(
            ({ id, label, help }) => html`
              <div class="sw-setting">
                <igc-switch
                  label-position="before"
                  aria-describedby="sw-${id}-help"
                  .checked=${enabled[id]}
                  @igcChange=${toggle(id)}
                >
                  ${label}
                </igc-switch>
                <span id="sw-${id}-help" class="muted">${help}</span>
              </div>
            `
          )}
        </section>
        <article
          class=${classMap({
            'sw-panel': true,
            'sw-preview': true,
            'sw-large': enabled['larger-text'],
            'sw-bold': enabled['bold-text'],
            'sw-still': enabled['reduce-motion'],
            'sw-compact': enabled.compact,
          })}
          aria-labelledby="sw-preview-title"
        >
          <p class="muted">
            <span class="sw-dot" aria-hidden="true"></span>
            Preview
          </p>
          <h4 id="sw-preview-title">Your order is on its way</h4>
          <p>
            The parcel left our warehouse this morning. The courier brings it on
            Thursday between 9 AM and 1 PM.
          </p>
          <ul class="sw-steps">
            <li>Ordered on Monday</li>
            <li>Shipped on Tuesday</li>
            <li>Arrives on Thursday</li>
          </ul>
        </article>
      `
    );

    return html`
      ${styles}
      <style>
        .sw-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
          align-items: start;
          gap: 1rem;
          max-width: 48rem;
        }

        .sw-display :is(h3, h4, p, ul) {
          margin: 0;
        }

        .sw-settings .sw-setting:last-child {
          border-block-end: 0;
        }

        .sw-preview {
          display: grid;
          gap: 0.75rem;
          font-size: 1rem;
          transition:
            font-size 0.2s,
            gap 0.2s;
        }

        .sw-preview h4 {
          font-size: 1.25em;
        }

        .sw-dot {
          display: inline-block;
          width: 0.5rem;
          height: 0.5rem;
          margin-inline-end: 0.25rem;
          border-radius: 50%;
          background: var(--ig-success-500);
          animation: sw-pulse 1.5s ease-in-out infinite;
        }

        .sw-steps {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .sw-steps li {
          padding: 0.75rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 6px;
          transition: padding 0.2s;
        }

        .sw-preview.sw-large {
          font-size: 1.25rem;
        }

        .sw-preview.sw-bold {
          font-weight: 600;
        }

        .sw-preview.sw-compact {
          gap: 0.25rem;
        }

        .sw-compact .sw-steps {
          gap: 0.25rem;
        }

        .sw-compact .sw-steps li {
          padding-block: 0.25rem;
        }

        .sw-still,
        .sw-still * {
          transition: none;
          animation: none;
        }

        @keyframes sw-pulse {
          50% {
            opacity: 0.3;
            transform: scale(0.6);
          }
        }
      </style>
      <div class="sw-display" ${mount}></div>
    `;
  },
};

const integrations = [
  {
    id: 'calendar',
    icon: 'event',
    name: 'Calendar',
    detail: 'Adds the due dates of your tasks to your calendar.',
  },
  {
    id: 'chat',
    icon: 'chat',
    name: 'Team chat',
    detail: 'Posts a message to the project channel when a task changes.',
  },
  {
    id: 'storage',
    icon: 'cloud',
    name: 'Cloud storage',
    detail: 'Attaches files from your drive to tasks.',
  },
  {
    id: 'video',
    icon: 'videocam',
    name: 'Video calls',
    detail: 'Adds a call link to each meeting.',
  },
] as const;

type Integration = (typeof integrations)[number];

export const Integrations: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The integrations page of a project management app. Each switch gets its name from a host `aria-labelledby` that points to the name of the app, and its description from `aria-describedby`. A switch takes effect at once, so turning one on connects the app. Turning one off asks first: Disconnect confirms, and Cancel or Escape turns the switch on again. `igcChange` cannot be canceled, so the story keeps the state and binds `.checked` with the `live()` directive. Lit then compares the state with the current `checked` of the switch, not with the value that it rendered last.',
      },
    },
  },
  render: () => {
    const connected = new Set<string>(['calendar', 'chat']);
    const dialog = createRef<IgcDialogComponent>();
    let asked: Integration = integrations[0];
    let asking = false;
    let message = '';

    const isOn = (id: string) =>
      connected.has(id) && !(asking && asked.id === id);

    const toggle =
      (app: Integration) =>
      ({ detail }: SwitchChange) => {
        message = '';

        if (detail.checked) {
          connected.add(app.id);
          message = `${app.name} is connected.`;
        } else {
          asked = app;
          asking = true;
          dialog.value?.show();
        }

        update();
      };

    const finish = (disconnect: boolean) => {
      if (!asking) {
        return;
      }

      if (disconnect) {
        connected.delete(asked.id);
        message = `${asked.name} is disconnected.`;
      }

      asking = false;
      update();
    };

    const answer = (disconnect: boolean) => () => {
      finish(disconnect);
      dialog.value?.hide();
    };

    const { mount, update } = renderInto(
      () => html`
        <h3>Integrations</h3>
        <ul class="sw-apps">
          ${integrations.map(
            (app) => html`
              <li>
                <igc-icon name=${app.icon} aria-hidden="true"></igc-icon>
                <span class="sw-app-text">
                  <strong id="sw-app-${app.id}">${app.name}</strong>
                  <span id="sw-app-${app.id}-detail" class="muted">
                    ${app.detail}
                  </span>
                </span>
                <igc-switch
                  aria-labelledby="sw-app-${app.id}"
                  aria-describedby="sw-app-${app.id}-detail"
                  .checked=${live(isOn(app.id))}
                  @igcChange=${toggle(app)}
                ></igc-switch>
              </li>
            `
          )}
        </ul>
        <p class="muted" role="status">${message}</p>
        <igc-dialog
          ${ref(dialog)}
          title="Disconnect ${asked.name}?"
          @igcClosing=${() => finish(false)}
        >
          <p>
            Your tasks stop syncing with ${asked.name}. You can connect it again
            at any time.
          </p>
          <igc-button slot="footer" variant="flat" @click=${answer(false)}>
            Cancel
          </igc-button>
          <igc-button slot="footer" @click=${answer(true)}>
            Disconnect
          </igc-button>
        </igc-dialog>
      `
    );

    return html`
      ${styles}
      <style>
        .sw-apps {
          display: grid;
          padding: 0;
          list-style: none;
        }

        .sw-apps li {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding-block: 0.75rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .sw-apps li:last-child {
          border-block-end: 0;
        }

        .sw-app-text {
          display: grid;
          gap: 0.125rem;
        }
      </style>
      <section
        class="sw-stack sw-panel"
        aria-label="Integrations"
        ${mount}
      ></section>
    `;
  },
};

const privacyHelp = (isPrivate: boolean) =>
  isPrivate
    ? 'Only the people that you invite can find the channel.'
    : 'Anyone in the workspace can find and join the channel.';

export const NewChannel: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The form that creates a channel in a team chat. The channel does not exist yet, so the switches apply when the user submits the form. A switch is in the form data only when it is on, with its `value`: "Make private" sends `private=yes`. The `checked` attribute is the default, so Reset turns "Notify me about every message" on again. The text under "Make private" follows the switch, and the switch describes its native input with it. Enter on a switch submits the form, as on a native checkbox. Submit shows the form data.',
      },
    },
  },
  render: () => {
    let isPrivate = false;
    const help = renderInto(() => privacyHelp(isPrivate));

    const togglePrivate = ({ detail }: SwitchChange) => {
      isPrivate = detail.checked;
      help.update();
    };

    const reset = () => {
      isPrivate = false;
      help.update();
    };

    return html`
      ${styles}
      <form
        class="sw-stack sw-panel"
        aria-labelledby="sw-channel-title"
        @submit=${formSubmitHandler}
        @reset=${reset}
      >
        <h3 id="sw-channel-title">Create a channel</h3>
        <igc-input name="name" label="Name" required>
          <span slot="prefix" aria-hidden="true">#</span>
          <span slot="value-missing">Enter a name for the channel.</span>
        </igc-input>
        <igc-textarea name="purpose" label="Purpose" rows="2">
          <span slot="helper-text">What is the channel about?</span>
        </igc-textarea>
        <div>
          <div class="sw-setting">
            <igc-switch
              name="private"
              value="yes"
              label-position="before"
              aria-describedby="sw-private-help"
              @igcChange=${togglePrivate}
            >
              Make private
            </igc-switch>
            <span id="sw-private-help" class="muted" ${help.mount}></span>
          </div>
          <div class="sw-setting">
            <igc-switch
              name="notify"
              value="all"
              label-position="before"
              checked
              aria-describedby="sw-notify-help"
            >
              Notify me about every message
            </igc-switch>
            <span id="sw-notify-help" class="muted">
              When it is off, you get a notification only when someone mentions
              you.
            </span>
          </div>
        </div>
        <div class="sw-row">
          <igc-button type="submit">Create channel</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
      </form>
    `;
  },
};
