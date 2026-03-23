import { all } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  defineComponents,
  registerIconFromText,
  setIconRef,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcIconComponent, IgcButtonComponent);

const icons = all.map((icon) => icon.name);

// region default
const metadata: Meta<IgcIconComponent> = {
  title: 'Icon',
  component: 'igc-icon',
  parameters: {
    docs: {
      description: {
        component:
          'The icon component allows visualizing collections of pre-registered SVG icons.',
      },
    },
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name of the icon glyph to draw.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    collection: {
      type: 'string',
      description:
        'The name of the registered collection for look up of icons.',
      control: 'text',
      table: { defaultValue: { summary: 'default' } },
    },
    mirrored: {
      type: 'boolean',
      description:
        'Whether to flip the icon horizontally. Useful for RTL (right-to-left) layouts.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { name: '', collection: 'default', mirrored: false },
};

export default metadata;

interface IgcIconArgs {
  /** The name of the icon glyph to draw. */
  name: string;
  /** The name of the registered collection for look up of icons. */
  collection: string;
  /** Whether to flip the icon horizontally. Useful for RTL (right-to-left) layouts. */
  mirrored: boolean;
}
type Story = StoryObj<IgcIconArgs>;

// endregion

Object.assign(metadata.argTypes!.name!, {
  control: 'select',
  options: icons,
});

Object.assign(metadata.args!, {
  name: 'biking',
});

all.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

registerIconFromText(
  'biking',
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>'
);
icons.push('biking');
icons.sort();

setIconRef('aliased', 'example', {
  name: 'biking',
  collection: 'default',
});

export const Basic: Story = {
  render: ({ name, collection, mirrored }) => html`
    <igc-icon
      .name=${name}
      .collection=${collection}
      .mirrored=${mirrored}
    ></igc-icon>
  `,
};

export const Mirrored: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .mirrored-demo {
        display: flex;
        align-items: center;
        gap: 3rem;
      }

      .mirrored-demo figure {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }

      .mirrored-demo igc-icon {
        --size: 3rem;
        color: var(--ig-primary-500);
      }

      .mirrored-demo figcaption {
        font-size: 0.875rem;
        color: var(--ig-gray-600);
      }
    </style>
    <div class="mirrored-demo">
      <figure>
        <igc-icon name="biking"></igc-icon>
        <figcaption>Default (LTR)</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" mirrored></igc-icon>
        <figcaption>Mirrored (RTL)</figcaption>
      </figure>
    </div>
  `,
};

export const Sizing: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .sizing-demo {
        display: flex;
        align-items: flex-end;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .sizing-demo figure {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }

      .sizing-demo igc-icon {
        color: var(--ig-primary-500);
      }

      .sizing-demo figcaption {
        font-size: 0.75rem;
        color: var(--ig-gray-600);
      }
    </style>
    <div class="sizing-demo">
      <figure>
        <igc-icon name="biking" style="--size: 1rem"></igc-icon>
        <figcaption>1rem</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="--size: 1.5rem"></igc-icon>
        <figcaption>1.5rem</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="--size: 2rem"></igc-icon>
        <figcaption>2rem</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="--size: 3rem"></igc-icon>
        <figcaption>3rem</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="--size: 4rem"></igc-icon>
        <figcaption>4rem</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="--size: 6rem"></igc-icon>
        <figcaption>6rem</figcaption>
      </figure>
    </div>
  `,
};

export const Coloring: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .coloring-demo {
        display: flex;
        gap: 2rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .coloring-demo figure {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }

      .coloring-demo igc-icon {
        --size: 2.5rem;
      }

      .coloring-demo figcaption {
        font-size: 0.75rem;
        color: var(--ig-gray-600);
      }
    </style>
    <div class="coloring-demo">
      <figure>
        <igc-icon name="biking" style="color: var(--ig-primary-500)"></igc-icon>
        <figcaption>Primary</figcaption>
      </figure>
      <figure>
        <igc-icon
          name="biking"
          style="color: var(--ig-secondary-500)"
        ></igc-icon>
        <figcaption>Secondary</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="color: var(--ig-info-500)"></igc-icon>
        <figcaption>Info</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="color: var(--ig-success-500)"></igc-icon>
        <figcaption>Success</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="color: var(--ig-warn-500)"></igc-icon>
        <figcaption>Warning</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="color: var(--ig-error-500)"></igc-icon>
        <figcaption>Error</figcaption>
      </figure>
      <figure>
        <igc-icon name="biking" style="color: var(--ig-gray-500)"></igc-icon>
        <figcaption>Gray</figcaption>
      </figure>
    </div>
  `,
};

export const Gallery: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .icon-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
        gap: 0.5rem;
        max-height: 70vh;
        overflow-y: auto;
        padding: 0.5rem;
      }

      .icon-gallery .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 0.25rem;
        border: 1px solid var(--ig-gray-200);
        border-radius: 4px;
        cursor: default;
        transition: background-color 0.2s;
      }

      .icon-gallery .icon-item:hover {
        background-color: var(--ig-gray-100);
      }

      .icon-gallery .icon-item igc-icon {
        --size: 1.5rem;
        color: var(--ig-gray-700);
      }

      .icon-gallery .icon-item span {
        font-size: 0.625rem;
        text-align: center;
        color: var(--ig-gray-600);
        word-break: break-all;
        line-height: 1.2;
      }
    </style>
    <div class="icon-gallery">
      ${icons.map(
        (icon) => html`
          <div class="icon-item" title=${icon}>
            <igc-icon name=${icon}></igc-icon>
            <span>${icon}</span>
          </div>
        `
      )}
    </div>
  `,
};

export const Reference: Story = {
  render: ({ name, collection }) => {
    const updateRef = () => {
      setIconRef('aliased', 'example', { name, collection });
    };

    return html`
      <style>
        .ref-demo {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 42rem;
        }

        .ref-demo p {
          margin: 0;
          color: var(--ig-gray-700);
        }

        .ref-demo pre {
          background: var(--ig-gray-100);
          border: 1px solid var(--ig-gray-200);
          border-radius: 4px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.8125rem;
          white-space: pre;
          overflow-x: auto;
          color: var(--ig-gray-800);
          margin: 0.5rem 0 0;
        }

        .ref-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 4px;
        }

        .ref-preview igc-icon {
          --size: 2.5rem;
          color: var(--ig-primary-500);
          padding-inline: 1rem;
          border-inline-end: 1px solid var(--ig-gray-300);
        }

        .ref-preview small {
          color: var(--ig-gray-600);
        }
      </style>
      <div class="ref-demo">
        <h3 style="margin: 0">Icon References</h3>
        <p>
          Icons can be declared by reference — an alias that resolves to a
          concrete icon at runtime. This makes theming and icon swapping
          straightforward without touching the markup.
        </p>

        <div>
          <p><strong>Setting a reference in JavaScript:</strong></p>
          <pre>
setIconRef('aliased', 'example', {
  name: 'biking',
  collection: 'default',
});</pre
          >
        </div>

        <div>
          <p><strong>Using the reference in markup:</strong></p>
          <pre>
&lt;igc-icon name="aliased" collection="example"&gt;&lt;/igc-icon&gt;</pre
          >
        </div>

        <div class="ref-preview">
          <igc-icon name="aliased" collection="example"></igc-icon>
          <small>
            Choose an icon from the <strong>Controls</strong> panel and press
            <strong>Update Reference</strong> to swap the aliased icon at
            runtime.
          </small>
        </div>

        <igc-button @click=${updateRef}>Update Reference</igc-button>
      </div>
    `;
  },
};
