import { all } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { getIconRegistry } from '../src/components/icon/icon.registry.js';
import {
  IgcButtonComponent,
  IgcIconComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
  setIconRef,
} from '../src/index.js';

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
        'The name of the registered collection for look up of icons.\nDefaults to `default`.',
      control: 'text',
      table: { defaultValue: { summary: 'default' } },
    },
    mirrored: {
      type: 'boolean',
      description: 'Whether to flip the icon. Useful for RTL layouts.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: { name: '', collection: 'default', mirrored: false },
};

export default metadata;

interface IgcIconArgs {
  /** The name of the icon glyph to draw. */
  name: string;
  /**
   * The name of the registered collection for look up of icons.
   * Defaults to `default`.
   */
  collection: string;
  /** Whether to flip the icon. Useful for RTL layouts. */
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
icons.push('search');
icons.sort();

const registerIconClick = () => {
  registerIcon(
    'search',
    'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg',
    'material'
  );
};

const Template = ({
  name = 'biking',
  collection = 'default',
  mirrored = false,
}: IgcIconArgs) => {
  return html`
    <div style="display: flex;">
      <igc-icon .name=${name} .collection=${collection} .mirrored=${mirrored}>
      </igc-icon>

      <button @click=${registerIconClick}>Register Icon</button>
    </div>
  `;
};

setIconRef('aliased', 'example', {
  name: 'bacteria',
  collection: 'default',
});

const IconReference = () => {
  const updateRef = () => {
    setIconRef('aliased', 'example', {
      name: 'syringe',
      collection: 'default',
    });
  };
  return html`
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css"
      rel="stylesheet"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <style>
      .ref {
        display: flex;
        padding: 1rem;
        border: 1px solid hsl(var(--ig-gray-300));
        width: max-content;
        color: hsl(var(--ig-gray-800));

        igc-icon {
          --size: 2.5rem;
        }
      }

      p,
      h5 {
        color: hsl(var(--ig-gray-700));
      }

      pre[class*='language-'] {
        padding: unset;
        margin-block: 1rem;
        font-size: 0.75rem;
        background: hsl(var(--ig-surface-500));
        border: 1px solid hsl(var(--ig-gray-100));

        code {
          text-shadow: none;
        }
      }

      .token.operator {
        background: none;
      }
    </style>
    <h3>Icon References</h3>
    <p>
      This sample showcases how icons can be declared and used by reference.
    </p>
    <h5>JavaScript:</h5>
    <pre>
      <code class="language-js">
  setIconRef('aliased', 'example', {
    name: 'bacteria',
    collection: 'default',
  });</code>
    </pre>
    <h5>Markup:</h5>
    <pre><code class="language-markup">
  &lt;igc-icon name="aliased" collection="example">&lt;igc-icon>
    </code></pre>

    <p>This results the following icon when rendered:</p>

    <div class="ref">
      <igc-icon name="aliased" collection="example"></igc-icon>
    </div>

    <br />

    <igc-button @click=${updateRef}>Change Source Icon</igc-button>
  `;
};

export const Basic: Story = Template.bind({});
export const Reference: Story = IconReference.bind({});
