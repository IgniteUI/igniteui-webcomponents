import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import {
  IgcBannerComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcNavbarComponent,
  IgcSwitchComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { delay, disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcBannerComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcNavbarComponent,
  IgcSwitchComponent
);

registerMaterialIcons(
  'alert-error',
  'check-circle',
  'description',
  'info',
  'update',
  'warning'
);
// The Material icons 3.0.1 set has no file with this glyph.
registerIconFromText(
  'wifi-off',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zm-4 4a9.793 9.793 0 0 0-4.49-2.56l3.53 3.53.96-.97zM2 3.05 5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 0 0 5 13v.01L6.99 15a7.042 7.042 0 0 1 4.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 0 0-6 0z"/></svg>'
);

// region default
const metadata: Meta<IgcBannerComponent> = {
  title: 'Banner',
  component: 'igc-banner',
  parameters: {
    docs: {
      description: {
        component:
          'A non-modal notification banner that displays important, concise messages\nrequiring user acknowledgement.\n\nThe banner slides into view with an animated grow transition and renders\ninline, pushing the surrounding page content rather than overlaying it.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /\n`"--toggle"` and `commandfor` pointing to this element will call the\ncorresponding method declaratively without any JavaScript.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description:
        'Whether the banner is open.\n\nSetting this property programmatically will immediately show or hide the\nbanner without animation and without emitting close events.\nPrefer the `show()`, `hide()`, and `toggle()` methods for animated\ntransitions.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { open: false },
};

export default metadata;

interface IgcBannerArgs {
  /**
   * Whether the banner is open.
   *
   * Setting this property programmatically will immediately show or hide the
   * banner without animation and without emitting close events.
   * Prefer the `show()`, `hide()`, and `toggle()` methods for animated
   * transitions.
   */
  open: boolean;
}
type Story = StoryObj<IgcBannerArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .bn-app {
      max-width: 48rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
      overflow: hidden;
    }

    .bn-page {
      display: grid;
      gap: 1rem;
      justify-items: start;
      padding: 1.5rem;
    }

    .bn-page h3,
    .bn-page p {
      margin: 0;
    }

    .bn-stack {
      display: grid;
      gap: 1rem;
      max-width: 48rem;
    }

    /*
     * The banner has no severity variant, so a tone color drives the color of
     * the illustration and an edge on the spacer part. A tinted background is
     * also possible, but it lowers the contrast of the flat action buttons.
     */
    .bn-tone {
      --ig-banner-banner-illustration-color: color-mix(
        in srgb,
        var(--bn-tone) 70%,
        var(--ig-gray-900)
      );
    }

    .bn-tone::part(spacer) {
      border-inline-start: 4px solid var(--bn-tone);
    }

    .bn-info {
      --bn-tone: var(--ig-info-500);
    }

    .bn-warning {
      --bn-tone: var(--ig-warn-500);
    }

    .bn-error {
      --bn-tone: var(--ig-error-500);
    }

    .bn-success {
      --bn-tone: var(--ig-success-500);
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A banner under the header of an application. The banner renders inline, so it pushes the page content down and does not cover it. Without the `actions` slot, the banner shows an OK button, which closes the banner with an animation. "Show the banner again" uses the invoker command `--show` with `commandfor`, without JavaScript. The `open` control in the controls panel shows and hides the banner immediately, without the animation and without the close events.',
      },
    },
  },
  args: { open: true },
  render: ({ open }) => html`
    ${styles}
    <div class="bn-app">
      <igc-navbar>
        <h2>Acme Analytics</h2>
      </igc-navbar>
      <igc-banner id="bn-default" ?open=${open}>
        <igc-icon slot="prefix" name="info"></igc-icon>
        We moved the reports to the new Insights page. Your saved reports are
        there.
      </igc-banner>
      <div class="bn-page">
        <h3>Dashboard</h3>
        <p class="muted">Revenue this month: $48,210. Active users: 1,284.</p>
        <igc-button variant="outlined" command="--show" commandfor="bn-default">
          Show the banner again
        </igc-button>
      </div>
    </div>
  `,
};

export const Messages: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Banners for the usual kinds of message. The banner has no severity variant, so each tone sets `--ig-banner-banner-illustration-color` and an edge on the `spacer` part. `--ig-banner-banner-background` can tint the banner too, but a tint lowers the contrast of the flat action buttons. The icon in the `prefix` slot and the text state the kind of message too, because a color alone means nothing to assistive technologies. The `actions` slot replaces the default OK button, and the actions close their banner with the invoker command `--hide`. The last banner keeps the default OK button.',
      },
    },
  },
  render: () => {
    const showAll = (event: Event) => {
      const stack = (event.currentTarget as HTMLElement).closest('.bn-stack')!;

      for (const banner of stack.querySelectorAll('igc-banner')) {
        banner.show();
      }
    };

    return html`
      ${styles}
      <div class="bn-stack">
        <igc-banner id="bn-update" class="bn-tone bn-info" open>
          <igc-icon slot="prefix" name="update"></igc-icon>
          A new version of Acme Analytics is available. Reload the page to get
          the new features.
          <div slot="actions">
            <igc-button variant="flat" command="--hide" commandfor="bn-update">
              Later
            </igc-button>
            <igc-button command="--hide" commandfor="bn-update">
              Reload
            </igc-button>
          </div>
        </igc-banner>

        <igc-banner id="bn-trial" class="bn-tone bn-warning" open>
          <igc-icon slot="prefix" name="warning"></igc-icon>
          Your trial ends in 3 days. Upgrade to keep your dashboards and
          reports.
          <div slot="actions">
            <igc-button variant="flat" command="--hide" commandfor="bn-trial">
              Remind me tomorrow
            </igc-button>
            <igc-button command="--hide" commandfor="bn-trial">
              Upgrade
            </igc-button>
          </div>
        </igc-banner>

        <igc-banner id="bn-sync" class="bn-tone bn-error" open>
          <igc-icon slot="prefix" name="alert-error"></igc-icon>
          We could not sync 3 reports. Check your connection, and then try
          again.
          <div slot="actions">
            <igc-button variant="flat" command="--hide" commandfor="bn-sync">
              Dismiss
            </igc-button>
            <igc-button command="--hide" commandfor="bn-sync">
              Try again
            </igc-button>
          </div>
        </igc-banner>

        <igc-banner class="bn-tone bn-success" open>
          <igc-icon slot="prefix" name="check-circle"></igc-icon>
          Two-step verification is on. We ask for a code when you sign in on a
          new device.
        </igc-banner>

        <div>
          <igc-button variant="outlined" @click=${showAll}>
            Show all banners
          </igc-button>
        </div>
      </div>
    `;
  },
};

export const ConnectionStatus: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A notes application that tells the user about the connection. The story listens to the `offline` and `online` events of the window, and the switch simulates them. `show()` and `hide()` return promises, so the handler closes one banner before it opens the other. "Try again" checks the connection again and updates the text of the banner. The banner has the `status` role with `aria-live="polite"`, so a screen reader announces the new text.',
      },
    },
  },
  render: () => {
    let simulated = false;
    let unsynced = 0;
    let root: HTMLElement | undefined;

    const banners = () => ({
      offline: root!.querySelector<IgcBannerComponent>('.bn-offline')!,
      online: root!.querySelector<IgcBannerComponent>('.bn-online')!,
    });

    const isOnline = () => navigator.onLine && !simulated;

    const update = async () => {
      if (!root) {
        return;
      }

      const { offline, online } = banners();

      if (isOnline()) {
        online.querySelector('.bn-synced')!.textContent = `${unsynced} ${
          unsynced === 1 ? 'change' : 'changes'
        }`;
        unsynced = 0;

        if (await offline.hide()) {
          await online.show();
        }
      } else {
        offline.querySelector('.bn-check')!.textContent = '';
        await online.hide();
        await offline.show();
      }
    };

    const edit = () => {
      if (!isOnline()) {
        unsynced += 1;
      }
    };

    const simulate = ({ detail }: CustomEvent<{ checked: boolean }>) => {
      simulated = detail.checked;
      update();
    };

    const retry = async (event: Event) => {
      const button = event.currentTarget as IgcButtonComponent;
      const status = button
        .closest('igc-banner')!
        .querySelector<HTMLElement>('.bn-check')!;

      button.disabled = true;
      status.textContent = 'Checking the connection…';
      await delay(1000);
      button.disabled = false;

      if (isOnline()) {
        update();
      } else {
        status.textContent = `Still offline at ${new Date().toLocaleTimeString()}.`;
      }
    };

    const mount = (element?: Element) => {
      if (element) {
        root = element as HTMLElement;
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        update();
      } else {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
        root = undefined;
      }
    };

    return html`
      ${styles}
      <div class="bn-stack">
        <igc-switch @igcChange=${simulate}>Simulate offline</igc-switch>
        <div class="bn-app" ${ref(mount)}>
          <igc-navbar>
            <h2>Notes</h2>
          </igc-navbar>
          <igc-banner class="bn-offline bn-tone bn-warning">
            <igc-icon slot="prefix" name="wifi-off"></igc-icon>
            You are offline. We save your changes on this device, and sync them
            when the connection returns.
            <span class="bn-check"></span>
            <div slot="actions">
              <igc-button variant="flat" @click=${retry}>Try again</igc-button>
            </div>
          </igc-banner>
          <igc-banner class="bn-online bn-tone bn-success">
            <igc-icon slot="prefix" name="check-circle"></igc-icon>
            You are back online. We synced
            <span class="bn-synced">0 changes</span>.
          </igc-banner>
          <div class="bn-page">
            <igc-input
              label="Title"
              value="Team meeting"
              @igcInput=${edit}
            ></igc-input>
            <igc-input
              label="Note"
              value="Agree on the release date."
              @igcInput=${edit}
            ></igc-input>
          </div>
        </div>
      </div>
    `;
  },
};

export const TermsUpdate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A banner that asks the user to confirm new terms. The default OK button emits `igcClosing` before the banner closes, and the event is cancelable: while the checkbox is not checked, the handler calls `preventDefault()` and shows the validation message of the checkbox. `igcClosed` fires after the exit animation. `hide()`, the `--hide` command and the `open` property do not emit these events.',
      },
    },
  },
  render: () => {
    const limit = 6;

    const log = (event: Event, text: string) => {
      const list = (event.target as HTMLElement)
        .closest('.bn-stack')!
        .querySelector('ol')!;
      const item = document.createElement('li');

      item.textContent = text;
      list.prepend(item);

      while (list.children.length > limit) {
        list.lastElementChild!.remove();
      }
    };

    const closing = (event: CustomEvent<void>) => {
      const consent = (event.target as IgcBannerComponent).querySelector(
        'igc-checkbox'
      )!;

      if (!consent.checked) {
        event.preventDefault();
        consent.reportValidity();
        log(event, 'igcClosing: canceled, the terms are not confirmed');
        return;
      }

      log(event, 'igcClosing: allowed');
    };

    const closed = (event: CustomEvent<void>) => {
      log(event, 'igcClosed');
    };

    const reset = (event: Event) => {
      const banner = (event.currentTarget as HTMLElement)
        .closest('.bn-stack')!
        .querySelector('igc-banner')!;

      banner.querySelector('igc-checkbox')!.checked = false;
      banner.show();
    };

    return html`
      ${styles}
      <div class="bn-stack">
        <igc-banner open @igcClosing=${closing} @igcClosed=${closed}>
          <igc-icon slot="prefix" name="description"></igc-icon>
          <p style="margin: 0 0 0.5rem">
            We updated our Terms of Service on October 1, 2026.
            <a href="#terms" @click=${(event: Event) => event.preventDefault()}
              >Read the changes</a
            >.
          </p>
          <igc-checkbox required>
            I have read the new terms
            <span slot="value-missing">
              Confirm that you have read the new terms.
            </span>
          </igc-checkbox>
        </igc-banner>
        <div>
          <igc-button variant="outlined" @click=${reset}>
            Show the banner again
          </igc-button>
        </div>
        <section>
          <h4 style="margin: 0">Event log (latest first)</h4>
          <ol></ol>
        </section>
      </div>
    `;
  },
};
