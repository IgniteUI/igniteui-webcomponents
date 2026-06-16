import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcIconComponent,
  IgcTabsComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcIconComponent,
  IgcTabsComponent
);

registerIconFromText(
  'home',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
);
registerIconFromText(
  'notifications',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`
);
registerIconFromText(
  'mail',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
);
registerIconFromText(
  'person',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z"/></svg>`
);
registerIconFromText(
  'shopping-cart',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.45 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2z"/></svg>`
);

// region default
const metadata: Meta<IgcBadgeComponent> = {
  title: 'Badge',
  component: 'igc-badge',
  parameters: {
    docs: {
      description: {
        component:
          'The badge is a component indicating a status on a related item or an area\nwhere some active indication is required.',
      },
    },
  },
  argTypes: {
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The type (style variant) of the badge.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'primary' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Sets whether to draw an outlined version of the badge.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    shape: {
      type: '"rounded" | "square"',
      description: 'The shape of the badge.',
      options: ['rounded', 'square'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'rounded' } },
    },
    dot: {
      type: 'boolean',
      description:
        'Sets whether to render a dot type badge.\nWhen enabled, the badge appears as a small dot without any content.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { variant: 'primary', outlined: false, shape: 'rounded', dot: false },
};

export default metadata;

interface IgcBadgeArgs {
  /** The type (style variant) of the badge. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Sets whether to draw an outlined version of the badge. */
  outlined: boolean;
  /** The shape of the badge. */
  shape: 'rounded' | 'square';
  /**
   * Sets whether to render a dot type badge.
   * When enabled, the badge appears as a small dot without any content.
   */
  dot: boolean;
}
type Story = StoryObj<IgcBadgeArgs>;

// endregion

const variants = ['primary', 'info', 'success', 'warning', 'danger'] as const;

export const Basic: Story = {
  render: ({ outlined, shape, variant, dot }) => html`
    <igc-badge
      ?outlined=${outlined}
      shape=${shape}
      variant=${variant}
      ?dot=${dot}
    >
      <igc-icon name="home" collection="default"></igc-icon>
    </igc-badge>
  `,
};

export const Variants: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>The badge supports five semantic color variants.</p>
    <div
      style="display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;"
    >
      ${variants.map(
        (v, i) => html`
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
          >
            <igc-badge variant=${v}>${i + 1}</igc-badge>
            <span style="font-size: 0.75rem; text-transform: capitalize;"
              >${v}</span
            >
          </div>
        `
      )}
    </div>
  `,
};

export const Outlined: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      The <code>outlined</code> attribute draws a border around the badge,
      useful when placing badges over colored or patterned surfaces.
    </p>
    <div
      style="display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Filled</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${variants.map(
            (v, i) => html`<igc-badge variant=${v}>${i + 1}</igc-badge>`
          )}
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Outlined</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${variants.map(
            (v, i) =>
              html`<igc-badge variant=${v} outlined>${i + 1}</igc-badge>`
          )}
        </div>
      </div>
    </div>
  `,
};

export const Shapes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Badges can be <code>rounded</code> (default) for a pill-shaped label or
      <code>square</code> for a more rectangular appearance.
    </p>
    <div
      style="display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Rounded</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${variants.map(
            (v, i) =>
              html`<igc-badge variant=${v} shape="rounded">${i + 1}</igc-badge>`
          )}
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Square</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${variants.map(
            (v, i) =>
              html`<igc-badge variant=${v} shape="square">${i + 1}</igc-badge>`
          )}
        </div>
      </div>
    </div>
  `,
};

export const Dot: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      The <code>dot</code> attribute renders the badge as a compact indicator
      without content — ideal for unread or online status cues.
    </p>
    <div
      style="display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;"
    >
      ${variants.map(
        (v) => html`
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
          >
            <igc-badge variant=${v} dot></igc-badge>
            <span style="font-size: 0.75rem; text-transform: capitalize;"
              >${v}</span
            >
          </div>
        `
      )}
    </div>
  `,
};

export const WithIcon: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Any content can be slotted into the badge. When an
      <code>igc-icon</code> is the only slotted element, the
      <code>icon</code> CSS part is activated for targeted styling.
    </p>
    <div
      style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;"
    >
      <igc-badge variant="primary">
        <igc-icon name="home" collection="default"></igc-icon>
      </igc-badge>
      <igc-badge variant="info">
        <igc-icon name="mail" collection="default"></igc-icon>
      </igc-badge>
      <igc-badge variant="success">
        <igc-icon name="notifications" collection="default"></igc-icon>
      </igc-badge>
      <igc-badge variant="warning">
        <igc-icon name="person" collection="default"></igc-icon>
      </igc-badge>
      <igc-badge variant="danger">
        <igc-icon name="shopping-cart" collection="default"></igc-icon>
      </igc-badge>
    </div>
  `,
};

export const InContext: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Badges are typically overlaid on a host element using
      <code>position: absolute</code> on the badge and
      <code>position: relative</code> on the container.
    </p>
    <div
      style="display: flex; gap: 3.5rem; align-items: flex-start; flex-wrap: wrap;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <div style="position: relative; display: inline-flex;">
          <igc-icon
            name="notifications"
            collection="default"
            style="font-size: 2rem;"
          ></igc-icon>
          <igc-badge
            variant="danger"
            style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);"
            >5</igc-badge
          >
        </div>
        <span style="font-size: 0.75rem;">Notifications</span>
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <div style="position: relative; display: inline-flex;">
          <igc-icon
            name="mail"
            collection="default"
            style="font-size: 2rem;"
          ></igc-icon>
          <igc-badge
            variant="primary"
            style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);"
            >12</igc-badge
          >
        </div>
        <span style="font-size: 0.75rem;">Messages</span>
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <div style="position: relative; display: inline-flex;">
          <igc-avatar initials="JD"></igc-avatar>
          <igc-badge
            variant="danger"
            style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);"
            >3</igc-badge
          >
        </div>
        <span style="font-size: 0.75rem;">Count badge</span>
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <div style="position: relative; display: inline-flex;">
          <igc-avatar initials="AB"></igc-avatar>
          <igc-badge
            variant="success"
            dot
            outlined
            style="position: absolute; bottom: 0; right: 0; transform: translate(25%, 25%);"
          ></igc-badge>
        </div>
        <span style="font-size: 0.75rem;">Online (dot)</span>
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <div style="position: relative; display: inline-flex;">
          <igc-icon
            name="shopping-cart"
            collection="default"
            style="font-size: 2rem;"
          ></igc-icon>
          <igc-badge
            variant="warning"
            shape="square"
            style="position: absolute; top: 0; right: 0; transform: translate(50%, -50%);"
            >99+</igc-badge
          >
        </div>
        <span style="font-size: 0.75rem;">Cart (square)</span>
      </div>
    </div>
  `,
};

export const InTabs: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Badges can be embedded in tab labels to communicate counts or status at a
      glance within navigation.
    </p>
    <igc-tabs>
      <igc-tab>
        <span
          slot="label"
          style="display: flex; align-items: center; gap: 0.375rem;"
        >
          Inbox
          <igc-badge variant="primary">4</igc-badge>
        </span>
      </igc-tab>
      <igc-tab>
        <span
          slot="label"
          style="display: flex; align-items: center; gap: 0.375rem;"
        >
          Notifications
          <igc-badge variant="danger">7</igc-badge>
        </span>
      </igc-tab>
      <igc-tab>
        <span
          slot="label"
          style="display: flex; align-items: center; gap: 0.375rem;"
        >
          Updates
          <igc-badge variant="success">New</igc-badge>
        </span>
      </igc-tab>
      <igc-tab>
        <span slot="label">Settings</span>
      </igc-tab>
    </igc-tabs>
  `,
};
