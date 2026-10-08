import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  type IgcCheckboxChangeEventArgs,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formSubmitHandler,
  plural,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTextareaComponent
);

// region default
const metadata: Meta<IgcTextareaComponent> = {
  title: 'Textarea',
  component: 'igc-textarea',
  parameters: {
    docs: {
      description: {
        component:
          'Represents a multi-line plain-text editing control,\nuseful when you want to allow users to enter a sizeable amount of free-form text,\nfor example a comment on a review or feedback form.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    autocomplete: {
      type: 'string',
      description:
        'Specifies what permission, if any, the browser has to provide automated assistance in filling out form field values,\nas well as guidance to the browser as to the type of information expected in the field.\nRefer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.',
      control: 'text',
    },
    autocapitalize: {
      type: 'string',
      description:
        'Controls whether and how text input is automatically capitalized as it is entered/edited by the user.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).',
      control: 'text',
    },
    inputMode: {
      type: 'string',
      description:
        'Hints at the type of data that might be entered by the user while editing the element or its contents.\nThis allows a browser to display an appropriate virtual keyboard.\n\n[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    maxLength: {
      type: 'number',
      description:
        "The maximum number of characters (UTF-16 code units) that the user can enter.\nIf this value isn't specified, the user can enter an unlimited number of characters.",
      control: 'number',
    },
    minLength: {
      type: 'number',
      description:
        'The minimum number of characters (UTF-16 code units) required that the user should enter.',
      control: 'number',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    resize: {
      type: { name: 'enum', value: ['vertical', 'none', 'auto'] },
      description:
        'Controls whether the control can be resized.\nWhen `auto` is set, the control will try to expand and fit its content.',
      options: ['vertical', 'none', 'auto'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    rows: {
      type: 'number',
      description:
        'The number of visible text lines for the control. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 3.',
      control: 'number',
      table: { defaultValue: { summary: '3' } },
    },
    value: {
      type: 'string',
      description: 'The value of the component',
      control: 'text',
    },
    spellcheck: {
      type: 'boolean',
      description:
        'Controls whether the element may be checked for spelling errors.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    wrap: {
      type: { name: 'enum', value: ['hard', 'soft', 'off'] },
      description:
        'Indicates how the control should wrap the value for form submission.\nRefer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)\nfor explanation of the available values.',
      options: ['hard', 'soft', 'off'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'soft' } },
    },
    validateOnly: {
      type: 'boolean',
      description:
        'Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property\nwhen it is defined.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
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
  },
  args: {
    outlined: false,
    readOnly: false,
    resize: 'vertical',
    rows: 3,
    spellcheck: true,
    wrap: 'soft',
    validateOnly: false,
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcTextareaArgs {
  /**
   * Specifies what permission, if any, the browser has to provide automated assistance in filling out form field values,
   * as well as guidance to the browser as to the type of information expected in the field.
   * Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.
   */
  autocomplete: string;
  /**
   * Controls whether and how text input is automatically capitalized as it is entered/edited by the user.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autocapitalize: string;
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents.
   * This allows a browser to display an appropriate virtual keyboard.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   */
  inputMode: string;
  /** The label for the control. */
  label: string;
  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxLength: number;
  /** The minimum number of characters (UTF-16 code units) required that the user should enter. */
  minLength: number;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder text of the control. */
  placeholder: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /**
   * Controls whether the control can be resized.
   * When `auto` is set, the control will try to expand and fit its content.
   */
  resize: 'vertical' | 'none' | 'auto';
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 3.
   */
  rows: number;
  /** The value of the component */
  value: string;
  /** Controls whether the element may be checked for spelling errors. */
  spellcheck: boolean;
  /**
   * Indicates how the control should wrap the value for form submission.
   * Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
   * for explanation of the available values.
   */
  wrap: 'hard' | 'soft' | 'off';
  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property
   * when it is defined.
   */
  validateOnly: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcTextareaArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ta-stack {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
    }

    .ta-stack :is(h3, p, ol) {
      margin: 0;
    }

    .ta-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .ta-code::part(input) {
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
    }
  </style>
`;

export const Default: Story = {
  args: {
    label: 'Delivery instructions',
    placeholder: 'Where can the courier leave the parcel?',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The delivery instructions of a checkout. The `label` names the native textarea, and the `helper-text` slot describes it. `rows` sets the height in lines of text. With the default `resize="vertical"`, the user can drag the corner to make the field taller. `auto` grows the field with its content, and `none` keeps the height. Use the controls panel to change the state. `invalid` sets only the invalid style, and `required`, `minlength` and `maxlength` add the validation. Without `validate-only`, the user cannot type past `maxlength`.',
      },
    },
  },
  render: (args) => html`
    <igc-textarea
      label=${ifDefined(args.label)}
      placeholder=${ifDefined(args.placeholder || undefined)}
      name=${ifDefined(args.name)}
      value=${ifDefined(args.value)}
      autocomplete=${ifDefined(args.autocomplete)}
      autocapitalize=${ifDefined(args.autocapitalize)}
      inputmode=${ifDefined(args.inputMode)}
      rows=${args.rows}
      resize=${args.resize}
      wrap=${args.wrap}
      minlength=${ifDefined(args.minLength)}
      maxlength=${ifDefined(args.maxLength)}
      ?outlined=${args.outlined}
      ?readonly=${args.readOnly}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?validate-only=${args.validateOnly}
      .invalid=${args.invalid}
      .spellcheck=${args.spellcheck}
    >
      <span slot="helper-text">The courier reads this note at your door.</span>
    </igc-textarea>
  `,
};

const postLimit = 280;

export const PostComposer: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A composer for short posts with a limit of 280 characters. `validate-only` with `maxlength` lets the user type past the limit, as most social apps do: the field becomes invalid and the `too-long` slot replaces the helper text, so the user can shorten the text and does not lose what they typed. The helper text counts the characters that are left, and the textarea describes its native element with it. A screen reader does not read a changed description, so a status region announces the count one second after the typing stops, when 20 or fewer characters are left. `resize="auto"` grows the field with the text. The field has no visible label, so the host `aria-label` names it. Ctrl+Enter (Cmd+Enter on a Mac) posts, and the focus goes back to the field.',
      },
    },
  },
  render: () => {
    const posts = [
      {
        text: 'Our new office opens on Monday. Come and say hello!',
        time: '2 hours ago',
      },
    ];
    let text = '';
    let announcement = '';
    let timer: ReturnType<typeof setTimeout> | undefined;

    const left = () => postLimit - text.length;
    const canPost = () => text.trim().length > 0 && left() >= 0;
    const count = () =>
      left() >= 0
        ? `${left()} characters left`
        : `${-left()} characters over the limit`;

    const announceLater = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        announcement = left() <= 20 ? count() : '';
        story.update();
      }, 1000);
    };

    const edit = ({ detail }: CustomEvent<string>) => {
      text = detail;
      announcement = '';
      announceLater();
      story.update();
    };

    const post = () => {
      if (!canPost()) {
        return;
      }

      clearTimeout(timer);
      posts.unshift({ text: text.trim(), time: 'Now' });
      text = '';
      announcement = 'Your post is live.';
      story.update();
      story.host?.querySelector('igc-textarea')?.focus();
    };

    const shortcut = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        post();
      }
    };

    const story = renderInto(
      () => html`
        <h3>Share an update</h3>
        <igc-textarea
          aria-label="New post"
          placeholder="What is new?"
          rows="2"
          resize="auto"
          maxlength=${postLimit}
          validate-only
          .value=${text}
          @igcInput=${edit}
          @keydown=${shortcut}
        >
          <span slot="helper-text">${count()}</span>
          <span slot="too-long">${count()}. Shorten the post to post it.</span>
        </igc-textarea>
        <div class="ta-row">
          <igc-button ?disabled=${!canPost()} @click=${post}>Post</igc-button>
          <span class="muted">or press Ctrl+Enter</span>
        </div>
        <p class="sr-only" role="status">${announcement}</p>
        <ol class="ta-posts" aria-label="Your posts">
          ${posts.map(
            ({ text, time }) => html`
              <li>
                <p>${text}</p>
                <span class="muted">${time}</span>
              </li>
            `
          )}
        </ol>
      `
    );

    return html`
      ${styles}
      <style>
        .ta-posts {
          display: grid;
          padding: 0;
          list-style: none;
        }

        .ta-posts li {
          display: grid;
          gap: 0.25rem;
          padding-block: 0.75rem;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .ta-posts p {
          white-space: pre-line;
        }
      </style>
      <section
        class="ta-stack ta-panel"
        aria-label="Share an update"
        ${story.mount}
      ></section>
    `;
  },
};

const stepsTemplate = '1. \n2. \n3. ';

export const SupportRequest: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A support request. "What happened?" is `required` and has `minlength="30"`: the `value-missing` and `too-short` slots replace the helper text with a message for each rule. A failed submit focuses the first invalid field. The text between the tags of "Steps to reproduce" is its value, as in a native textarea, and also its default value, so Reset brings the numbered template back. "Error message" is for pasted machine text: `spellcheck="false"` and `autocapitalize="off"` leave the text as it is, `wrap="off"` scrolls long lines and does not wrap them, and a style on the `input` part sets a monospace font. Submit shows the form data.',
      },
    },
  },
  render: () => html`
    ${styles}
    <form
      class="ta-stack ta-panel"
      aria-labelledby="ta-support-title"
      @submit=${formSubmitHandler}
    >
      <h3 id="ta-support-title">Contact support</h3>
      <igc-input name="subject" label="Subject" required>
        <span slot="value-missing">Enter a subject.</span>
      </igc-input>
      <igc-textarea
        name="description"
        label="What happened?"
        rows="4"
        required
        minlength="30"
      >
        <span slot="helper-text">
          Tell us what you did and what you expected. Use at least 30
          characters.
        </span>
        <span slot="value-missing">Describe the problem.</span>
        <span slot="too-short">
          Add more details. Use at least 30 characters.
        </span>
      </igc-textarea>
      <igc-textarea name="steps" label="Steps to reproduce" rows="4">
        ${stepsTemplate}
        <span slot="helper-text">Write one step on each line.</span>
      </igc-textarea>
      <igc-textarea
        class="ta-code"
        name="error"
        label="Error message"
        rows="4"
        spellcheck="false"
        autocapitalize="off"
        wrap="off"
      >
        <span slot="helper-text">
          Optional. Paste the text of the error, if you see one.
        </span>
      </igc-textarea>
      <div class="ta-row">
        <igc-button type="submit">Send request</igc-button>
        <igc-button type="reset" variant="outlined">Reset</igc-button>
      </div>
    </form>
  `,
};

const savedReplies = [
  {
    title: 'Refund issued',
    text: 'Hi Maya,\n\nWe issued a refund of [amount] to your card. It shows on your statement in 5 to 10 business days.',
  },
  {
    title: 'Late delivery',
    text: 'Hi Maya,\n\nYour order left our warehouse late. The new delivery date is [date]. We are sorry for the wait.',
  },
  {
    title: 'Wrong item',
    text: 'Hi Maya,\n\nWe are sorry that you got the wrong item. Send it back with the return label from [link], and we ship the [item] at no cost.',
  },
];

const signature = '\n\nBest regards,\nAlex from Support';
const order = 'A-10482';

/** A placeholder of a saved reply, such as `[amount]`. */
const placeholder = /\[[^\]\n]+\]/g;

export const CannedReplies: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The reply box of a support agent. A saved reply fills the textarea, and `focus()` with `setSelectionRange()` selects its first placeholder in square brackets, so the agent types over it. "Next placeholder" reads `selectionEnd` and selects the next placeholder after it, or the first one again. "Insert order number" calls `setRangeText()` without a range, so the number replaces the selected text or goes in at the caret. "Add signature" inserts the signature at the end with a range. `setRangeText()` sends no `igcInput`, so the story reads the new value itself. While a placeholder is left, `setCustomValidity()` makes the field invalid, so Send stops at the field and the `custom-error` slot tells why. After a reply is sent, a form reset clears the field and its invalid state.',
      },
    },
  },
  render: () => {
    let text = '';
    let sent = '';

    const field = () => story.host?.querySelector('igc-textarea');
    const placeholders = () => text.match(placeholder)?.length ?? 0;

    const sync = () => {
      const textarea = field();

      if (!textarea) {
        return;
      }

      text = textarea.value;
      const count = placeholders();
      textarea.setCustomValidity(
        count
          ? `Replace ${count === 1 ? 'the placeholder' : `${count} placeholders`} in square brackets.`
          : ''
      );
      story.update();
    };

    const selectPlaceholder = async () => {
      const textarea = field();

      if (!textarea) {
        return;
      }

      await textarea.updateComplete;
      const matches = [...textarea.value.matchAll(placeholder)];
      const match =
        matches.find(({ index }) => index >= textarea.selectionEnd) ??
        matches[0];
      textarea.focus();

      if (match) {
        textarea.setSelectionRange(match.index, match.index + match[0].length);
      }
    };

    const useReply = (reply: string) => async () => {
      text = reply;
      sent = '';
      story.update();
      await field()?.updateComplete;
      sync();
      selectPlaceholder();
    };

    const insertOrderNumber = () => {
      const textarea = field()!;

      textarea.setRangeText(order, undefined, undefined, 'end');
      textarea.focus();
      sync();
    };

    const addSignature = () => {
      const textarea = field()!;
      const end = textarea.value.length;

      textarea.setRangeText(signature, end, end, 'end');
      textarea.focus();
      sync();
    };

    const send = (event: SubmitEvent) => {
      event.preventDefault();
      sent = 'Your reply is on its way to Maya Patel.';
      (event.target as HTMLFormElement).reset();
    };

    const clear = () => {
      text = '';
      field()?.setCustomValidity('');
      story.update();
    };

    const story = renderInto(() => {
      const count = placeholders();

      return html`
        <div class="ta-ticket">
          <h3>Ticket 4821: Where is my refund?</h3>
          <p class="muted">
            Maya Patel wrote: I sent the jacket back two weeks ago, and I still
            have no refund. Order ${order}.
          </p>
        </div>
        <div class="ta-row" role="group" aria-label="Saved replies">
          ${savedReplies.map(
            ({ title, text }) => html`
              <igc-button variant="outlined" @click=${useReply(text)}>
                ${title}
              </igc-button>
            `
          )}
        </div>
        <igc-textarea
          name="reply"
          label="Reply"
          rows="7"
          required
          .value=${text}
          @igcInput=${sync}
        >
          <span slot="helper-text">
            ${
              count
                ? `${plural(count, 'placeholder')} left.`
                : 'Start from a saved reply or write your own.'
            }
          </span>
          <span slot="value-missing">Write a reply.</span>
          <span slot="custom-error">
            Replace the text in square brackets before you send the reply.
          </span>
        </igc-textarea>
        <div class="ta-row">
          <igc-button type="submit">Send</igc-button>
          <igc-button
            variant="outlined"
            ?disabled=${!count}
            @click=${selectPlaceholder}
          >
            Next placeholder
          </igc-button>
          <igc-button variant="outlined" @click=${insertOrderNumber}>
            Insert order number
          </igc-button>
          <igc-button
            variant="outlined"
            ?disabled=${!text || text.endsWith(signature)}
            @click=${addSignature}
          >
            Add signature
          </igc-button>
        </div>
        <p class="muted" role="status">${sent}</p>
      `;
    });

    return html`
      ${styles}
      <style>
        .ta-ticket {
          display: grid;
          gap: 0.25rem;
          padding-block-end: 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }
      </style>
      <form
        class="ta-stack ta-panel"
        aria-label="Reply to ticket 4821"
        @submit=${send}
        @reset=${clear}
        ${story.mount}
      ></form>
    `;
  },
};

const video = {
  slug: 'night-train',
  title: 'The night train is back',
  length: '4:12',
};

export const EmbedCode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The share panel of a video. The embed code is `readonly`: the user can focus, select and copy it, but not change it. The switches change the code at once. Copy selects the whole code with `select()` and writes it to the clipboard. When the browser blocks the clipboard, the story focuses the field, so that the selected code is ready for Ctrl+C. `spellcheck="false"` keeps the spelling marks off the code, and `resize="none"` keeps the height of four rows.',
      },
    },
  },
  render: () => {
    let controls = true;
    let startAt = false;
    let status = '';

    const code = () => {
      const params = new URLSearchParams();

      if (!controls) {
        params.set('controls', '0');
      }
      if (startAt) {
        params.set('start', '90');
      }

      const query = params.size ? `?${params}` : '';
      return `<iframe src="https://video.example.com/embed/${video.slug}${query}" width="560" height="315" title="${video.title}" allowfullscreen></iframe>`;
    };

    const option =
      (set: (checked: boolean) => void) =>
      ({ detail }: CustomEvent<IgcCheckboxChangeEventArgs>) => {
        set(detail.checked);
        status = '';
        story.update();
      };

    const copy = async () => {
      const textarea = story.host!.querySelector('igc-textarea')!;
      textarea.select();

      try {
        await navigator.clipboard.writeText(textarea.value);
        status = 'The embed code is copied.';
      } catch {
        textarea.focus();
        textarea.select();
        status =
          'The browser blocked the clipboard. Press Ctrl+C to copy the selected code.';
      }

      story.update();
    };

    const story = renderInto(
      () => html`
        <div>
          <h3>Embed the video</h3>
          <p class="muted">${video.title}, ${video.length}</p>
        </div>
        <igc-switch
          .checked=${controls}
          @igcChange=${option((checked) => (controls = checked))}
        >
          Show the player controls
        </igc-switch>
        <igc-switch
          .checked=${startAt}
          @igcChange=${option((checked) => (startAt = checked))}
        >
          Start at 1:30
        </igc-switch>
        <igc-textarea
          class="ta-code"
          label="Embed code"
          rows="4"
          resize="none"
          spellcheck="false"
          readonly
          .value=${code()}
        >
          <span slot="helper-text">
            Paste the code into the HTML of your page.
          </span>
        </igc-textarea>
        <div class="ta-row">
          <igc-button @click=${copy}>Copy</igc-button>
          <span class="muted" role="status">${status}</span>
        </div>
      `
    );

    return html`
      ${styles}
      <section
        class="ta-stack ta-panel"
        aria-label="Embed the video"
        ${story.mount}
      ></section>
    `;
  },
};
