import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcColorPickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcColorPickerComponent);

// region default
const metadata: Meta<IgcColorPickerComponent> = {
  title: 'ColorPicker',
  component: 'igc-color-picker',
  parameters: {
    docs: {
      description: {
        component:
          'Color input component.\n\nLets the user pick a color visually - via an HSV saturation/value canvas, a\nhue slider and an optional alpha slider - or by typing a color string\n(hex, rgb(a), hsl(a) or a named CSS color) directly. Supports pre-defined\nswatches, the native EyeDropper API where available, and two anchor\npresentations: a trigger button (`mode="default"`) or an editable text\nfield (`mode="input"`).',
      },
    },
    actions: {
      handles: [
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
        'igcInput',
        'igcChange',
      ],
    },
  },
  argTypes: {
    label: {
      type: 'string',
      description:
        'The label of the component.\n\nIn `mode="input"` this is forwarded to the anchor input\'s own label\ninstead of being rendered as a separate element.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'The value of the component, as a CSS color string (hex, rgb(a), hsl(a)\nor a named color).\n\nSetting an empty, whitespace-only or otherwise invalid string clears\nthe value.',
      control: 'text',
    },
    format: {
      type: '"hex" | "rgb" | "hsl"',
      description:
        'Sets the color format for the string value.\n\nSwitching the format re-renders `value` in the new notation without\nchanging the color, so no `igcInput` or `igcChange` is emitted.',
      options: ['hex', 'rgb', 'hsl'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hex' } },
    },
    hideFormats: {
      type: 'boolean',
      description: 'Whether to hide the format picker buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showAlpha: {
      type: 'boolean',
      description: 'Whether to show the alpha slider and input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    mode: {
      type: '"default" | "input"',
      description:
        'The mode of the color picker.\n\nIn `"default"` mode the anchor is a trigger button. In `"input"` mode\nthe anchor is an editable text field with a color swatch prefix that\nalso opens the picker.',
      options: ['default', 'input'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'default' } },
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
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    format: 'hex',
    hideFormats: false,
    showAlpha: false,
    mode: 'default',
    required: false,
    disabled: false,
    invalid: false,
    open: false,
  },
};

export default metadata;

interface IgcColorPickerArgs {
  /**
   * The label of the component.
   *
   * In `mode="input"` this is forwarded to the anchor input's own label
   * instead of being rendered as a separate element.
   */
  label: string;
  /**
   * The value of the component, as a CSS color string (hex, rgb(a), hsl(a)
   * or a named color).
   *
   * Setting an empty, whitespace-only or otherwise invalid string clears
   * the value.
   */
  value: string;
  /**
   * Sets the color format for the string value.
   *
   * Switching the format re-renders `value` in the new notation without
   * changing the color, so no `igcInput` or `igcChange` is emitted.
   */
  format: 'hex' | 'rgb' | 'hsl';
  /** Whether to hide the format picker buttons. */
  hideFormats: boolean;
  /** Whether to show the alpha slider and input. */
  showAlpha: boolean;
  /**
   * The mode of the color picker.
   *
   * In `"default"` mode the anchor is a trigger button. In `"input"` mode
   * the anchor is an editable text field with a color swatch prefix that
   * also opens the picker.
   */
  mode: 'default' | 'input';
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcColorPickerArgs>;

// endregion

/**
 * Layout shared by the multi-sample stories.
 *
 * `align-items: start` keeps every anchor on the same baseline no matter how
 * tall its label wraps, and the block padding leaves the popover somewhere to
 * open into instead of pushing the canvas around.
 */
const samples = html`
  <style>
    .samples {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      gap: 2rem 3rem;
      padding-block-end: 22rem;
    }

    .samples output {
      display: block;
      margin-block-start: 1rem;
      font-family: var(--ig-font-family, monospace);
      color: var(--ig-gray-700);
    }

    fieldset {
      min-width: 0;
    }
  </style>
`;

const palette = [
  '#f94144',
  '#f3722c',
  '#f8961e',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#4d908e',
  '#577590',
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive color picker. Use the controls panel to explore `mode`, `format`, `showAlpha`, `hideFormats` and the validation properties.',
      },
    },
    actions: { handles: [] },
  },
  args: {
    label: 'Pick a color',
    value: 'rebeccapurple',
  },
  render: (args) => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        .label=${args.label}
        .value=${args.value ?? ''}
        .format=${args.format}
        .mode=${args.mode}
        ?hide-formats=${args.hideFormats}
        ?show-alpha=${args.showAlpha}
        ?required=${args.required}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?open=${args.open}
      >
        <p slot="helper-text">Opens on click or with Alt + Arrow Down.</p>
      </igc-color-picker>
    </div>
  `,
};

export const Formats: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`format` decides the notation `value` is written in. Switching it re-renders the same color rather than changing it, so neither `igcInput` nor `igcChange` is emitted. Clear the field inside the picker to see each format hint its own notation as a placeholder.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Hex"
        format="hex"
        value="#3f51b5"
      ></igc-color-picker>
      <igc-color-picker
        label="RGB"
        format="rgb"
        value="#3f51b5"
      ></igc-color-picker>
      <igc-color-picker
        label="HSL"
        format="hsl"
        value="#3f51b5"
      ></igc-color-picker>
    </div>
  `,
};

export const AlphaChannel: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`show-alpha` reveals the alpha slider and its input, both expressed in whole percent. The anchor swatch splits in two - the picked color over the left half and the same color at its real opacity across the whole surface - so a translucent color is always shown next to what it actually is.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Opaque"
        show-alpha
        format="rgb"
        value="rgb(63 81 181)"
      ></igc-color-picker>
      <igc-color-picker
        label="60% opacity"
        show-alpha
        format="rgb"
        value="rgb(63 81 181 / 0.6)"
      ></igc-color-picker>
      <igc-color-picker
        label="15% opacity"
        show-alpha
        format="rgb"
        value="rgb(63 81 181 / 0.15)"
      ></igc-color-picker>
    </div>
  `,
};

export const InputMode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`mode="input"` swaps the trigger button for an editable text field with the swatch as its prefix. The field accepts any CSS color - hex, `rgb()`, `hsl()` or a named color - and reverts to the current value if what was typed cannot be parsed. Clearing it clears the picker.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Trigger button"
        mode="default"
        value="#e91e63"
      ></igc-color-picker>
      <igc-color-picker
        label="Editable field"
        mode="input"
        value="#e91e63"
      ></igc-color-picker>
      <igc-color-picker
        label="Editable field, empty"
        mode="input"
      ></igc-color-picker>
    </div>
  `,
};

export const CustomSwatches: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Assigning `swatches` renders a row of preset colors under the picker controls. Clicking one commits it as the value. Any CSS color string is accepted.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Brand palette"
        value="#43aa8b"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        label="Named colors"
        .swatches=${[
          'tomato',
          'orange',
          'gold',
          'yellowgreen',
          'seagreen',
          'teal',
          'steelblue',
          'rebeccapurple',
        ]}
      ></igc-color-picker>
    </div>
  `,
};

export const Sizes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The anchor, the popover and the controls inside it all follow `--ig-size`.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        style="--ig-size: 1"
        label="Small"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        style="--ig-size: 2"
        label="Medium"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        style="--ig-size: 3"
        label="Large"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
    </div>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'With no value the anchor carries a diagonal "no color" mark and the picker opens at the white corner of the saturation plane, with the hue slider at red.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker label="No color selected"></igc-color-picker>
      <igc-color-picker label="Disabled" value="#009688" disabled>
      </igc-color-picker>
      <igc-color-picker label="Invalid" invalid>
        <p slot="invalid">Pick a color to continue</p>
      </igc-color-picker>
      <igc-color-picker label="No color selected" mode="input">
      </igc-color-picker>
      <igc-color-picker label="Disabled" mode="input" value="#009688" disabled>
      </igc-color-picker>
    </div>
  `,
};

export const Events: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`igcInput` fires on every interaction with the picker area - dragging the canvas or a slider, typing, picking a swatch. `igcChange` fires once the committed value has actually moved and focus has left the component.',
      },
    },
  },
  render: () => {
    const report = (event: CustomEvent<string>) => {
      const output = (event.currentTarget as HTMLElement)
        .closest('.samples')
        ?.querySelector('output');

      if (output) {
        output.textContent = `${event.type} - ${event.detail || '(cleared)'}`;
      }
    };

    return html`
      ${samples}
      <div class="samples">
        <div>
          <igc-color-picker
            label="Pick a color"
            .swatches=${palette}
            @igcInput=${report}
            @igcChange=${report}
          ></igc-color-picker>
          <output>No events yet</output>
        </div>
      </div>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The picker submits its `value` in the active `format` under `name`. Reset restores the value the control was rendered with.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-color-picker
          name="color-default"
          label="Default"
        ></igc-color-picker>

        <igc-color-picker
          name="color-initial-value"
          label="Initial value"
          value="firebrick"
        ></igc-color-picker>

        <igc-color-picker
          name="color-required"
          label="Required"
          mode="input"
          required
        >
          <p slot="value-missing">Pick a color to continue</p>
        </igc-color-picker>
      </fieldset>

      <fieldset disabled>
        <igc-color-picker
          name="color-disabled"
          label="Disabled"
          value="#009688"
        ></igc-color-picker>
      </fieldset>

      ${formControls()}
    </form>
  `,
};
