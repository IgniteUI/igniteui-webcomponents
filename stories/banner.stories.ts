import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcBannerComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcNavbarComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcBannerComponent,
  IgcIconComponent,
  IgcButtonComponent,
  IgcNavbarComponent
);

registerIconFromText(
  'info',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
);
registerIconFromText(
  'warning',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`
);
registerIconFromText(
  'error',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
);
registerIconFromText(
  'check-circle',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
);
registerIconFromText(
  'wifi-off',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78L11 6.94c3.07-.43 6.28.49 8.62 2.83l2.37-2.37zm-4 4c-1.29-1.29-2.97-2.01-4.72-2.18L17.5 14c.18.47.28.97.28 1.5 0 2.49-2.01 4.5-4.5 4.5S8.78 18 8.78 15.5c0-.53.1-1.04.28-1.5l-2.26-2.26C5.99 13.1 5.5 14.27 5.5 15.5c0 3.86 3.14 7 7 7s7-3.14 7-7c0-1.23-.49-2.4-1.51-3.5zM3.27 3L2 4.27l2.1 2.1C1.91 8.18 1 10.54 1 13h2c0-2 .76-3.84 2-5.23l1.5 1.5C5.55 10.47 5 11.67 5 13H3C3 9.69 4.62 6.77 7.1 4.9L3.27 3z"/></svg>`
);
registerIconFromText(
  'update',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12z"/></svg>`
);

// region default
const metadata: Meta<IgcBannerComponent> = {
  title: 'Banner',
  component: 'igc-banner',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-banner` component displays important and concise message(s) for a user to address, that is specific to a page or feature.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the banner is being shown/hidden.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { open: false },
};

export default metadata;

interface IgcBannerArgs {
  /** Determines whether the banner is being shown/hidden. */
  open: boolean;
}
type Story = StoryObj<IgcBannerArgs>;

// endregion

export const Basic: Story = {
  render: (args) => html`
    <igc-navbar>
      <h2>My Application</h2>
    </igc-navbar>
    <igc-banner id="banner" ?open=${args.open}>
      You are currently not logged in. Please log in to your account to
      continue.
    </igc-banner>
    <div style="padding: 1rem;">
      <igc-button onclick="banner.toggle()">Toggle Banner</igc-button>
    </div>
  `,
};

export const WithPrefix: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Use the <code>prefix</code> slot to provide an illustrative icon alongside
      the message content.
    </p>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <igc-banner open>
          <igc-icon slot="prefix" name="info" collection="default"></igc-icon>
          Your session will expire in 5 minutes. Save your work to avoid losing
          any changes.
        </igc-banner>
      </div>
      <div>
        <igc-banner open>
          <igc-icon
            slot="prefix"
            name="warning"
            collection="default"
          ></igc-icon>
          Storage is almost full. Delete some files to free up space.
        </igc-banner>
      </div>
      <div>
        <igc-banner open>
          <igc-icon
            slot="prefix"
            name="check-circle"
            collection="default"
          ></igc-icon>
          Build <code>f58a1815</code> completed successfully!
        </igc-banner>
      </div>
    </div>
  `,
};

export const CustomActions: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Use the <code>actions</code> slot to replace the default "Dismiss" button
      with custom action buttons. If the slot is omitted, a default
      <em>Dismiss</em> button is rendered automatically.
    </p>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <h4 style="margin: 0 0 0.5rem;">Default action (auto-rendered)</h4>
        <igc-banner open>
          <igc-icon slot="prefix" name="info" collection="default"></igc-icon>
          A new version of the application is available.
        </igc-banner>
      </div>
      <div>
        <h4 style="margin: 0 0 0.5rem;">Custom actions</h4>
        <igc-banner open>
          <igc-icon slot="prefix" name="update" collection="default"></igc-icon>
          A new version of the application is available.
          <div slot="actions">
            <igc-button variant="flat">Later</igc-button>
            <igc-button variant="outlined">Update now</igc-button>
          </div>
        </igc-banner>
      </div>
      <div>
        <h4 style="margin: 0 0 0.5rem;">Single action</h4>
        <igc-banner open>
          <igc-icon
            slot="prefix"
            name="check-circle"
            collection="default"
          ></igc-icon>
          Your changes have been saved successfully.
          <div slot="actions">
            <igc-button variant="flat">OK</igc-button>
          </div>
        </igc-banner>
      </div>
    </div>
  `,
};

export const ProgrammaticControl: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      The banner exposes <code>show()</code>, <code>hide()</code>, and
      <code>toggle()</code> methods for programmatic control. All methods are
      animated and return a <code>Promise&lt;boolean&gt;</code>.
    </p>
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <igc-button onclick="ctrlBanner.show()">Show</igc-button>
      <igc-button onclick="ctrlBanner.hide()">Hide</igc-button>
      <igc-button onclick="ctrlBanner.toggle()">Toggle</igc-button>
    </div>
    <igc-banner id="ctrlBanner">
      <igc-icon slot="prefix" name="wifi-off" collection="default"></igc-icon>
      No internet connection. Please check your network settings.
      <div slot="actions">
        <igc-button variant="flat" onclick="ctrlBanner.hide()"
          >Dismiss</igc-button
        >
        <igc-button variant="outlined">Retry</igc-button>
      </div>
    </igc-banner>
  `,
};

export const CancelableClose: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const onClosing = (e: CustomEvent) => {
      const log = document.querySelector<HTMLElement>('#event-log');
      const confirmed = window.confirm(
        'Are you sure you want to dismiss this banner?'
      );

      if (!confirmed) {
        e.preventDefault();
        if (log)
          log.textContent = `[${new Date().toLocaleTimeString()}] igcClosing — cancelled by user`;
        return;
      }

      if (log)
        log.textContent = `[${new Date().toLocaleTimeString()}] igcClosing — allowed`;
    };

    const onClosed = () => {
      const log = document.querySelector<HTMLElement>('#event-log');
      if (log)
        log.textContent += `\n[${new Date().toLocaleTimeString()}] igcClosed — banner is now hidden`;
    };

    return html`
      <p>
        The <code>igcClosing</code> event is cancelable. Call
        <code>event.preventDefault()</code> to prevent the banner from closing.
        The <code>igcClosed</code> event fires after the animation completes.
      </p>
      <igc-banner
        id="cancelBanner"
        open
        @igcClosing=${onClosing}
        @igcClosed=${onClosed}
      >
        <igc-icon slot="prefix" name="warning" collection="default"></igc-icon>
        Unsaved changes detected. Dismissing this banner will discard them.
      </igc-banner>
      <div style="margin-top: 1rem;">
        <p style="margin: 0 0 0.5rem; font-weight: 600;">Event log:</p>
        <pre
          id="event-log"
          style="margin: 0; padding: 0.75rem; background: var(--ig-gray-100, #f5f5f5); border-radius: 4px; min-height: 3rem; font-size: 0.8rem; white-space: pre-wrap;"
        >
Click "Dismiss" to see the events fire.</pre
        >
        <igc-button style="margin-top: 0.5rem;" onclick="cancelBanner.show()"
          >Reset banner</igc-button
        >
      </div>
    `;
  },
};

export const InContext: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>Banners are most effective when placed directly below the app bar.</p>
    <div
      style="border: 1px solid var(--ig-gray-300, #ccc); border-radius: 4px; overflow: hidden;"
    >
      <igc-navbar>
        <h2>Dashboard</h2>
      </igc-navbar>
      <igc-banner open>
        <igc-icon slot="prefix" name="wifi-off" collection="default"></igc-icon>
        You are offline. Some features may be unavailable.
        <div slot="actions">
          <igc-button variant="flat">Dismiss</igc-button>
          <igc-button variant="outlined">Retry connection</igc-button>
        </div>
      </igc-banner>
      <div
        style="padding: 1.5rem; background: var(--ig-surface-500, #fff); min-height: 8rem; display: flex; align-items: center; justify-content: center; color: var(--ig-gray-500, #9e9e9e);"
      >
        Page content goes here
      </div>
    </div>
  `,
};
