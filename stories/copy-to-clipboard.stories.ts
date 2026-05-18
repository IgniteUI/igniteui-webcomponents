import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcCopyToClipboardComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcCopyToClipboardComponent, IgcTextareaComponent);
// region default
const metadata: Meta<IgcCopyToClipboardComponent> = {
  title: 'CopyToClipboard',
  component: 'igc-copy-to-clipboard',
  parameters: {
    docs: {
      description: {
        component:
          'A component that overlays a copy button on top of its slotted content,\nallowing users to copy the text to the clipboard with a single click.',
      },
    },
  },
  argTypes: {
    format: {
      type: 'string',
      description:
        'Controls how the text content is formatted when copied to the clipboard.\n- `plain`: Normalizes all whitespace into a flat body of text (default).\n- `preserve`: Retains the visual structure such as paragraphs and code indentation.',
      options: ['plain', 'preserve'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'plain' } },
    },
  },
  args: { format: 'plain' },
};

export default metadata;

interface IgcCopyToClipboardArgs {
  /**
   * Controls how the text content is formatted when copied to the clipboard.
   * - `plain`: Normalizes all whitespace into a flat body of text (default).
   * - `preserve`: Retains the visual structure such as paragraphs and code indentation.
   */
  format: 'plain' | 'preserve';
}
type Story = StoryObj<IgcCopyToClipboardArgs>;

// endregion

export const Default: Story = {
  render: (args) => html`
    <style>
      .demo-layout {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 640px;
      }

      .content-box {
        border: 1px solid var(--ig-gray-300);
        border-radius: 8px;
        padding: 1rem;
      }
    </style>

    <div class="demo-layout">
      <igc-copy-to-clipboard .format=${args.format}>
        <div class="content-box" tabindex="0">
          <p>This is some text that can be copied to the clipboard.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio
            quibusdam at non exercitationem labore nostrum. Magni repudiandae
            maxime perferendis hic laudantium, fuga dolor, consequatur odio
            minima repellendus error, eum amet.
          </p>
          <p>
            Try clicking the copy button above, then paste into the field below.
          </p>
        </div>
      </igc-copy-to-clipboard>

      <igc-textarea
        label="Paste here to verify"
        placeholder="Ctrl+V / ⌘V"
        rows="3"
        resize="auto"
      ></igc-textarea>
    </div>
  `,
};

export const PreservedFormat: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .demo-layout {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 640px;
      }

      .content-box {
        border: 1px solid var(--ig-gray-300);
        border-radius: 8px;
        padding: 1rem;
      }

      .content-box p {
        margin: 0 0 0.75rem;
      }

      .content-box p:last-of-type {
        margin-bottom: 1rem;
      }

      .content-box pre {
        margin: 0;
        padding: 0.75rem 1rem;
        background: var(--ig-gray-100);
        border-radius: 4px;
        font-size: 0.875rem;
        overflow-x: auto;
        white-space: pre;
      }
    </style>

    <div class="demo-layout">
      <igc-copy-to-clipboard format="preserve">
        <div class="content-box" tabindex="0">
          <p>
            With <strong>preserve</strong> format, paragraph breaks and
            indentation are retained in the copied text.
          </p>
          <p>
            Paste into the field below to verify the structure is preserved.
          </p>
          <pre>
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}</pre
          >
        </div>
      </igc-copy-to-clipboard>

      <igc-textarea
        label="Paste here to verify"
        placeholder="Ctrl+V / ⌘V"
        rows="3"
        resize="auto"
      ></igc-textarea>
    </div>
  `,
};

export const CodeSnippet: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      rel="stylesheet"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>

    <style>
      .demo-layout {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 640px;
      }

      .code-block {
        border-radius: 8px;
        overflow: hidden;
      }

      .code-block pre[class*='language-'] {
        margin: 0;
        border-radius: 0;
        font-size: 0.875rem;
      }

      .token.operator {
        background: none;
      }

      p {
        color: var(--ig-gray-700);
      }
    </style>

    <div class="demo-layout">
      <p>
        Hover over the code block below and click the copy button to copy the
        snippet. Paste it into the text field to verify the indentation is
        preserved.
      </p>

      <igc-copy-to-clipboard format="preserve">
        <div class="code-block" tabindex="0">
          <pre><code class="language-javascript">import { registerIconFromText } from 'igniteui-webcomponents';

const heartSvg = \`
  &lt;svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"&gt;
    &lt;path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5
             2 5.41 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.08
             C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5
             c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/&gt;
  &lt;/svg&gt;\`;

registerIconFromText('heart', heartSvg, 'my-icons');</code></pre>
        </div>
      </igc-copy-to-clipboard>

      <igc-textarea
        label="Paste here to verify"
        placeholder="Ctrl+V / ⌘V"
        rows="3"
        resize="auto"
      ></igc-textarea>
    </div>
  `,
};

export const WithCustomIcon: Story = {
  render: (args) => html`
    <style>
      .demo-layout {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 640px;
      }

      .content-box {
        border: 1px solid var(--ig-gray-300);
        border-radius: 8px;
        padding: 1rem;
      }
    </style>

    <div class="demo-layout">
      <igc-copy-to-clipboard .format=${args.format}>
        <svg
          slot="copy-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M16 4h2a2 2 0 0 1 2 2v4" />
          <path d="M21 14H11" />
          <path d="m15 10-4 4 4 4" />
        </svg>
        <div class="content-box" tabindex="0">
          <p>This story uses a custom SVG icon for the copy button.</p>
          <p>Paste into the field below to see the copied content.</p>
        </div>
      </igc-copy-to-clipboard>

      <igc-textarea
        label="Paste here to verify"
        placeholder="Ctrl+V / ⌘V"
        rows="3"
        resize="auto"
      ></igc-textarea>
    </div>
  `,
};
