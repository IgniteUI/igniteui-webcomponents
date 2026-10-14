import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcCopyToClipboardComponent,
  IgcIconComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  type IgcCopyToClipboardEventArgs,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCopyToClipboardComponent,
  IgcIconComponent,
  IgcSwitchComponent,
  IgcTextareaComponent
);
registerMaterialIcons('copy', 'done', 'download', 'link');

// region default
const metadata: Meta<IgcCopyToClipboardComponent> = {
  title: 'CopyToClipboard',
  component: 'igc-copy-to-clipboard',
  parameters: {
    docs: {
      description: {
        component:
          'Overlays a copy button on its slotted content. The button copies the\nrendered text of the content to the clipboard.',
      },
    },
    actions: { handles: ['igcCopy'] },
  },
  argTypes: {
    disableInteraction: {
      type: 'boolean',
      description:
        'Whether the copy button is hidden and disabled. The `--copy` command\nstill copies the content.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    format: {
      type: { name: 'enum', value: ['preserve', 'plain'] },
      description:
        'How the copied text is formatted.\n- `plain`: Collapses whitespace, with one line break between blocks.\n- `preserve`: Keeps paragraph breaks and indentation.',
      options: ['preserve', 'plain'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'plain' } },
    },
  },
  args: { disableInteraction: false, format: 'plain' },
};

export default metadata;

interface IgcCopyToClipboardArgs {
  /**
   * Whether the copy button is hidden and disabled. The `--copy` command
   * still copies the content.
   */
  disableInteraction: boolean;
  /**
   * How the copied text is formatted.
   * - `plain`: Collapses whitespace, with one line break between blocks.
   * - `preserve`: Keeps paragraph breaks and indentation.
   */
  format: 'preserve' | 'plain';
}
type Story = StoryObj<IgcCopyToClipboardArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .cc-panel {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cc-panel :is(h3, h4, p) {
      margin: 0;
    }

    .cc-wide {
      max-width: 46rem;
    }

    .cc-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
    }

    /* The end padding leaves room for the copy button. */
    .cc-box {
      padding: 0.75rem 3.5rem 0.75rem 1rem;
      border-radius: 4px;
      background: var(--ig-gray-100);
      overflow-wrap: anywhere;
    }

    .cc-code {
      margin: 0;
      font:
        0.875rem / 1.5 ui-monospace,
        Menlo,
        Consolas,
        monospace;
      white-space: pre-wrap;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An automatic reply that the user copies into a mail client. The copy button shows while the pointer is on the reply or the focus is in it, and always on a device without hover. With the `plain` format, the copied text has one line break between paragraphs. With `preserve`, the empty line between paragraphs stays. Paste into the field to compare. The Actions panel logs the `igcCopy` event with its status and text. Use the controls panel to change the format or to hide the button.',
      },
    },
  },
  render: (args) => html`
    ${styles}
    <style>
      .cc-reply p + p {
        margin-block-start: 0.75rem;
      }
    </style>

    <section class="cc-panel" aria-labelledby="cc-reply-title">
      <h3 id="cc-reply-title">Automatic reply</h3>
      <igc-copy-to-clipboard
        ?disable-interaction=${args.disableInteraction}
        .format=${args.format}
      >
        <div class="cc-box cc-reply">
          <p>Hello,</p>
          <p>
            Thank you for your message. I am out of the office from June 2 to
            June 13, with limited access to email.
          </p>
          <p>
            For questions about an order, contact the support team at
            support@example.com or call +1 555 0100.
          </p>
          <p>
            Best regards,<br />Maya Patel<br />Customer Success, Northwind
            Traders
          </p>
        </div>
      </igc-copy-to-clipboard>
      <igc-textarea
        label="Paste here to compare"
        rows="3"
        resize="auto"
      ></igc-textarea>
    </section>
  `,
};

const mainTs = [
  'import {',
  '  defineComponents,',
  '  IgcButtonComponent,',
  '  IgcInputComponent,',
  "} from 'igniteui-webcomponents';",
  "import 'igniteui-webcomponents/themes/light/bootstrap.css';",
  '',
  'defineComponents(IgcButtonComponent, IgcInputComponent);',
];

const indexHtml = [
  '<form action="/subscribe">',
  '  <igc-input type="email" label="Email" required></igc-input>',
  '  <igc-button type="submit">Subscribe</igc-button>',
  '</form>',
];

/**
 * Puts a line break between the items, for a `<pre>`. Lit's `join` returns a
 * generator, which renders only once.
 */
const lines = (items: unknown[]) =>
  items.flatMap((item, index) => (index ? ['\n', item] : [item]));

const codeFile = (name: string, source: string[]) => html`
  <figure class="cc-file">
    <figcaption>${name}</figcaption>
    <igc-copy-to-clipboard format="preserve" aria-label="Copy ${name}">
      <pre class="cc-box cc-code"><code>${lines(
        source.map((line) => html`<span class="cc-line">${line}</span>`)
      )}</code></pre>
    </igc-copy-to-clipboard>
  </figure>
`;

export const InstallGuide: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A get-started page with three steps. The code blocks copy with the `preserve` format, so the indentation and the empty line stay. Each component has an `aria-label`, so each copy button has its own name in the tab sequence. The file names are outside the components, and the line numbers and the `$` prompt are CSS generated content, so the copied text does not include them.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .cc-steps {
        display: grid;
        gap: 1.5rem;
        margin: 0;
        padding-inline-start: 1.25rem;
      }

      .cc-steps h4 {
        margin-block-end: 0.5rem;
      }

      .cc-file {
        margin: 0;
      }

      .cc-file figcaption {
        margin-block-end: 0.25rem;
        font-size: 0.8125rem;
        font-weight: 600;
      }

      /* One counter per file, one number per line span. */
      .cc-file .cc-code {
        counter-reset: line;
      }

      .cc-line::before {
        counter-increment: line;
        content: counter(line);
        display: inline-block;
        width: 2ch;
        margin-inline-end: 2ch;
        text-align: end;
        color: var(--ig-gray-700);
      }

      .cc-terminal code::before {
        content: '$';
        margin-inline-end: 1ch;
        color: var(--ig-gray-700);
      }
    </style>

    <article class="cc-panel cc-wide" aria-labelledby="cc-guide-title">
      <h3 id="cc-guide-title">Get started</h3>
      <ol class="cc-steps">
        <li>
          <h4>Install the package</h4>
          <igc-copy-to-clipboard aria-label="Copy the install command">
            <pre
              class="cc-box cc-code cc-terminal"
            ><code>npm install igniteui-webcomponents</code></pre>
          </igc-copy-to-clipboard>
        </li>
        <li>
          <h4>Register the components and load a theme</h4>
          ${codeFile('main.ts', mainTs)}
        </li>
        <li>
          <h4>Add the components to a page</h4>
          ${codeFile('index.html', indexHtml)}
        </li>
      </ol>
    </article>
  `,
};

const inviteCode = 'k7qm2xpa';

export const ShareInvite: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The invite panel of a workspace. A `::part(button)` rule keeps the copy button visible, because users look for it next to a link. The `copy-icon` and `success-icon` slots replace the default icons with a link icon and a done icon, and the `success-button` part gives the button the success color while the done icon shows. A `:state(ig-success)` rule outlines the link for the same time. The component reads the text at the time of the copy, so after "Reset link" it copies the new link.',
      },
    },
  },
  render: () => {
    let code = inviteCode;

    const resetLink = () => {
      code = crypto.randomUUID().slice(0, 8);
      story.update();
    };

    const story = renderInto(
      () => html`
        <igc-copy-to-clipboard
          class="cc-invite"
          aria-label="Copy the invite link"
        >
          <igc-icon slot="copy-icon" name="link"></igc-icon>
          <igc-icon slot="success-icon" name="done"></igc-icon>
          <div class="cc-box">https://app.example.com/join/${code}</div>
        </igc-copy-to-clipboard>
        <div class="cc-row">
          <igc-button variant="outlined" @click=${resetLink}>
            Reset link
          </igc-button>
          <span class="muted" role="status">
            ${
              code === inviteCode
                ? ''
                : 'Link reset. The old link no longer works.'
            }
          </span>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .cc-invite::part(button) {
          opacity: 1;
          pointer-events: auto;
        }

        .cc-invite::part(success-button) {
          --cc-bg: var(--ig-success-500);
          --cc-fg: var(--ig-success-500-contrast);
          --ig-contained-icon-button-background: var(--cc-bg);
          --ig-contained-icon-button-hover-background: var(--cc-bg);
          --ig-contained-icon-button-focus-background: var(--cc-bg);
          --ig-contained-icon-button-focus-hover-background: var(--cc-bg);
          --ig-contained-icon-button-active-background: var(--cc-bg);
          --ig-contained-icon-button-foreground: var(--cc-fg);
          --ig-contained-icon-button-hover-foreground: var(--cc-fg);
          --ig-contained-icon-button-focus-foreground: var(--cc-fg);
          --ig-contained-icon-button-focus-hover-foreground: var(--cc-fg);
          --ig-contained-icon-button-active-foreground: var(--cc-fg);
        }

        .cc-invite:state(ig-success) .cc-box {
          outline: 2px solid var(--ig-success-500);
          outline-offset: -2px;
        }

        /* The always visible button is taller than one line of text. */
        .cc-invite .cc-box {
          padding-block: 1.25rem;
        }
      </style>

      <section class="cc-panel" aria-labelledby="cc-invite-title">
        <div>
          <h3 id="cc-invite-title">Invite people to Northwind Design</h3>
          <p class="muted">
            Anyone with the link can join as a viewer. The link expires in 7
            days.
          </p>
        </div>
        <div style="display: contents" ${story.mount}></div>
      </section>
    `;
  },
};

/** A term of the order, with its value in a copy component. */
const orderField = (term: string, value: unknown) => html`
  <div>
    <dt>${term}</dt>
    <dd>
      <igc-copy-to-clipboard aria-label="Copy the ${term.toLowerCase()}">
        ${value}
      </igc-copy-to-clipboard>
    </dd>
  </div>
`;

export const OrderDetails: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An order confirmation with the three values that a customer copies most: the order number for support, the tracking number for the carrier site, and the delivery address. Each component has an `aria-label`, so each copy button has its own name. The address copies as one line per `br` element. `--ig-size` makes the copy buttons small, to fit one line of text.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .cc-order {
        display: grid;
        gap: 1rem;
        margin: 0;
      }

      .cc-order dt {
        margin-block-end: 0.25rem;
        font-weight: 600;
      }

      .cc-order dd {
        margin: 0;
      }

      .cc-order igc-copy-to-clipboard {
        --ig-size: var(--ig-size-small);
      }

      .cc-order address {
        font-style: normal;
      }
    </style>

    <section class="cc-panel" aria-labelledby="cc-order-title">
      <div>
        <h3 id="cc-order-title">Your order is confirmed</h3>
        <p class="muted">
          A confirmation is on its way to maya.patel@example.com.
        </p>
      </div>
      <dl class="cc-order">
        ${orderField(
          'Order number',
          html`<div class="cc-box">NW-48213-937</div>`
        )}
        ${orderField(
          'Tracking number',
          html`<div class="cc-box">1Z 999 AA1 01 2345 6784</div>`
        )}
        ${orderField(
          'Delivery address',
          html`<address class="cc-box">
            Maya Patel<br />2049 Harbor Street, Apt 5<br />Portland, OR 97209<br />United
            States
          </address>`
        )}
      </dl>
    </section>
  `,
};

const logLines = lines(
  [
    ['12:04:31', 'Run npm ci'],
    ['12:04:52', 'added 1243 packages in 21s'],
    ['12:04:53', 'Run npm test'],
    ['12:06:58', 'FAIL src/cart/totals.spec.ts'],
    ['12:06:58', '  applies the coupon before tax'],
    ['12:06:58', '    Expected: 18.36'],
    ['12:06:58', '    Received: 18.90'],
    ['12:06:59', 'Tests: 1 failed, 611 passed, 612 total'],
    ['12:06:59', 'Error: Process completed with exit code 1.'],
  ].map(
    ([time, message]) =>
      html`<span class="cc-time muted">${`${time} `}</span>${message}`
  )
);

export const BuildLog: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The output of a failed CI job. The component copies the rendered text, and hidden elements are not rendered, so the copied log matches the page: with "Show timestamps" off, the copied lines have no time. The `preserve` format keeps the indentation of the test failure.',
      },
    },
  },
  render: () => {
    const toggleTimestamps = ({ target }: Event) => {
      const { checked } = target as IgcSwitchComponent;
      (target as Element)
        .closest('.cc-panel')
        ?.classList.toggle('cc-no-time', !checked);
    };

    return html`
      ${styles}
      <style>
        .cc-log-header {
          justify-content: space-between;
        }

        .cc-no-time .cc-time {
          display: none;
        }
      </style>

      <section class="cc-panel cc-wide" aria-labelledby="cc-log-title">
        <div class="cc-row cc-log-header">
          <h3 id="cc-log-title">test (ubuntu-latest) failed</h3>
          <igc-switch checked @igcChange=${toggleTimestamps}>
            Show timestamps
          </igc-switch>
        </div>
        <igc-copy-to-clipboard format="preserve" aria-label="Copy the log">
          <pre class="cc-box cc-code"><code>${logLines}</code></pre>
        </igc-copy-to-clipboard>
      </section>
    `;
  },
};

const recoveryCodes = [
  '7f3k-9q2m',
  'p4xd-81vn',
  'c6tw-3hje',
  'm9ra-5zkq',
  'b2ny-7gfu',
  'w8ec-4dps',
  'h5jv-6tlx',
  'q1mz-2wkb',
];

const recoveryCodesFile = `data:text/plain;charset=utf-8,${encodeURIComponent(
  `${recoveryCodes.join('\n')}\n`
)}`;

export const RecoveryCodes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The recovery codes step of a two-factor sign-in setup. The page has its own Copy and Download buttons, so the component has `disable-interaction`, which hides its copy button. Copy uses the invoker command `--copy` with `commandfor`, without JavaScript. With the `plain` format, each code is on its own line, because each list item is a block. The `igcCopy` event tells the page the result: after a copy, the Copy button shows "Copied" for two seconds. When the browser blocks the clipboard, the story selects the codes and tells the user to press Ctrl+C. The live region of the component announces the result.',
      },
    },
  },
  render: () => {
    let status: IgcCopyToClipboardEventArgs['status'] | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const showResult = (event: CustomEvent<IgcCopyToClipboardEventArgs>) => {
      clearTimeout(timer);
      status = event.detail.status;

      if (status === 'success') {
        timer = setTimeout(() => {
          status = undefined;
          actions.update();
        }, 2000);
      } else {
        getSelection()?.selectAllChildren(event.currentTarget as Element);
      }

      actions.update();
    };

    const actions = renderInto(() => {
      const copied = status === 'success';

      return html`
        <igc-button command="--copy" commandfor="cc-recovery-codes">
          <igc-icon slot="prefix" name=${copied ? 'done' : 'copy'}></igc-icon>
          ${copied ? 'Copied' : 'Copy'}
        </igc-button>
        <igc-button
          variant="outlined"
          href=${recoveryCodesFile}
          download="northwind-recovery-codes.txt"
        >
          <igc-icon slot="prefix" name="download"></igc-icon>
          Download
        </igc-button>
        <span class="muted" role="status">
          ${
            status === 'error'
              ? 'The browser blocked the clipboard. Press Ctrl+C to copy the selected codes.'
              : ''
          }
        </span>
      `;
    });

    return html`
      ${styles}
      <style>
        .cc-codes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem 2rem;
          padding: 1rem 1.5rem;
          list-style: none;
          font-size: 1rem;
        }
      </style>

      <section class="cc-panel" aria-labelledby="cc-codes-title">
        <div>
          <h3 id="cc-codes-title">Save your recovery codes</h3>
          <p class="muted">
            If you lose your phone, sign in with a recovery code. Each code
            works once. Keep the codes in a password manager.
          </p>
        </div>
        <igc-copy-to-clipboard
          id="cc-recovery-codes"
          disable-interaction
          @igcCopy=${showResult}
        >
          <ul class="cc-box cc-code cc-codes">
            ${recoveryCodes.map((code) => html`<li>${code}</li>`)}
          </ul>
        </igc-copy-to-clipboard>
        <div class="cc-row" ${actions.mount}></div>
      </section>
    `;
  },
};
