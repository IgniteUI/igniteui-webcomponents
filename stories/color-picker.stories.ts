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

export const Default: Story = {
  args: {
    label: 'Pick a color',
  },
};

export const InitialValue: Story = {
  args: {
    label: 'Pick a color',
    value: 'rebeccapurple',
  },
};

const rowStyle =
  'display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;';

export const Formats: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div style=${rowStyle}>
      <div>
        <p style="margin: 0 0 .5rem">Hex</p>
        <igc-color-picker
          label="Hex"
          format="hex"
          value="#3f51b5"
        ></igc-color-picker>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">RGB</p>
        <igc-color-picker
          label="RGB"
          format="rgb"
          value="#3f51b5"
        ></igc-color-picker>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">HSL</p>
        <igc-color-picker
          label="HSL"
          format="hsl"
          value="#3f51b5"
        ></igc-color-picker>
      </div>
    </div>
  `,
};

export const AlphaChannel: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Set <code>show-alpha</code> to reveal the alpha slider and input, and pass
      a color with an alpha component through <code>value</code>.
    </p>
    <igc-color-picker
      label="Overlay color"
      show-alpha
      value="rgba(63, 81, 181, 0.6)"
    ></igc-color-picker>
  `,
};

export const InputMode: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      <code>mode="input"</code> renders the color value as an editable text
      field with a color swatch prefix, instead of a plain trigger button.
    </p>
    <div style=${rowStyle}>
      <div>
        <p style="margin: 0 0 .5rem">Default</p>
        <igc-color-picker
          label="Pick a color"
          mode="default"
          value="#e91e63"
        ></igc-color-picker>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Input</p>
        <igc-color-picker
          label="Pick a color"
          mode="input"
          value="#e91e63"
        ></igc-color-picker>
      </div>
    </div>
  `,
};

export const CustomSwatches: Story = {
  render: () => html`
    <igc-color-picker
      label="Pick a color"
      value="#D81E5B"
      .swatches=${[
        '#B9E3C6',
        '#59C9A5',
        '#D81E5B',
        '#23395B',
        '#FFFD98',
        '#F18F01',
        '#048BA8',
        '#2E4057',
        '#99C24D',
        '#2F2D2E',
      ]}
    ></igc-color-picker>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div style=${rowStyle}>
      <div>
        <p style="margin: 0 0 .5rem">Empty</p>
        <igc-color-picker label="No color selected"></igc-color-picker>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Disabled</p>
        <igc-color-picker
          label="Disabled"
          value="#009688"
          disabled
        ></igc-color-picker>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Invalid</p>
        <igc-color-picker label="Invalid" invalid></igc-color-picker>
      </div>
    </div>
  `,
};

export const Events: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const onInput = (event: CustomEvent<string>) => {
      const log = document.querySelector<HTMLElement>('#color-events-log');
      if (log) log.textContent = `igcInput — "${event.detail}"`;
    };

    const onChange = (event: CustomEvent<string>) => {
      const log = document.querySelector<HTMLElement>('#color-events-log');
      if (log) log.textContent = `igcChange — "${event.detail}"`;
    };

    return html`
      <p>
        <code>igcInput</code> fires on every interaction with the picker area
        (dragging the canvas or sliders, typing). <code>igcChange</code> fires
        once, when the committed value changes and focus leaves the component.
      </p>
      <igc-color-picker
        label="Pick a color"
        @igcInput=${onInput}
        @igcChange=${onChange}
      ></igc-color-picker>
      <p
        id="color-events-log"
        style="margin-top: 1rem; font-family: monospace;"
      >
        No events yet
      </p>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
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
        ></igc-color-picker>
      </fieldset>

      ${formControls()}
    </form>
  `,
};
