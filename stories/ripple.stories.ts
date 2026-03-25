import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcRippleComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcRippleComponent);

// region default
const metadata: Meta<IgcRippleComponent> = {
  title: 'Ripple',
  component: 'igc-ripple',
  parameters: {
    docs: {
      description: {
        component:
          'A ripple can be applied to an element to represent\ninteractive surface.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Ripple applied to `igc-button` (built-in integration) and to a plain `<div>` acting as a custom interactive surface. Click either element to see the wave animation.',
      },
    },
  },
  render: () => html`
    <style>
      .demo {
        display: flex;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .surface {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 10rem;
        height: 3rem;
        border: 1px solid var(--ig-gray-400);
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        font-size: 0.875rem;
        color: var(--ig-gray-700);
      }
    </style>
    <div class="demo">
      <igc-button>
        Button with ripple
        <igc-ripple></igc-ripple>
      </igc-button>

      <div class="surface" role="button" tabindex="0">
        Custom surface
        <igc-ripple></igc-ripple>
      </div>
    </div>
  `,
};

export const CustomColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The ripple color can be changed with the `--color` CSS custom property set on the `igc-ripple` element or its host.',
      },
    },
  },
  render: () => html`
    <style>
      .color-demo {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
    </style>
    <div class="color-demo">
      <igc-button>
        Default
        <igc-ripple></igc-ripple>
      </igc-button>

      <igc-button>
        Primary
        <igc-ripple style="--color: var(--ig-primary-500)"></igc-ripple>
      </igc-button>

      <igc-button>
        Success
        <igc-ripple style="--color: var(--ig-success-500)"></igc-ripple>
      </igc-button>

      <igc-button>
        Warning
        <igc-ripple style="--color: var(--ig-warn-500)"></igc-ripple>
      </igc-button>

      <igc-button>
        Error
        <igc-ripple style="--color: var(--ig-error-500)"></igc-ripple>
      </igc-button>
    </div>
  `,
};

export const WithElements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates applying `<igc-ripple>` to common UI patterns: cards and list items. Any `position: relative; overflow: hidden` element can host a ripple.',
      },
    },
  },
  render: () => html`
    <style>
      .with-elements-demo {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
        align-items: flex-start;
      }

      .card {
        position: relative;
        overflow: hidden;
        width: 14rem;
        padding: 1.25rem;
        border: 1px solid var(--ig-gray-200);
        border-radius: 8px;
        cursor: pointer;
        background: var(--ig-surface-500);
      }

      .card h4 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: var(--ig-gray-800);
      }

      .card p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ig-gray-600);
      }

      .list {
        width: 16rem;
        border: 1px solid var(--ig-gray-200);
        border-radius: 8px;
        overflow: hidden;
      }

      .list-item {
        position: relative;
        overflow: hidden;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--ig-gray-800);
        border-block-end: 1px solid var(--ig-gray-100);
      }

      .list-item:last-child {
        border-block-end: none;
      }
    </style>
    <div class="with-elements-demo">
      <div class="card" role="button" tabindex="0">
        <h4>Card title</h4>
        <p>Click anywhere on this card to see the ripple effect.</p>
        <igc-ripple style="--color: var(--ig-primary-500)"></igc-ripple>
      </div>

      <ul class="list" role="listbox">
        ${['Inbox', 'Starred', 'Sent', 'Drafts', 'Trash'].map(
          (item) => html`
            <li class="list-item" role="option" tabindex="0">
              ${item}
              <igc-ripple></igc-ripple>
            </li>
          `
        )}
      </ul>
    </div>
  `,
};
