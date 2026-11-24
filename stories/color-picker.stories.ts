import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { range } from 'lit/directives/range.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcColorPickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcColorPickerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcColorPickerComponent> = {
  title: 'ColorPicker',
  component: 'igc-color-picker',
  parameters: {
    docs: {
      description: {
        component:
          'Color input component.\n\nThe user picks a color with the color area, the hue slider and the optional\nalpha slider. The area is saturation by value, or lightness by chroma at the\nOKLCH hue in the `oklch` format. The user can also type any CSS color string,\nsuch as hex, `rgb()`, `hsl()`, `oklch()` or a named color.\n\nThe component supports pre-defined swatches and the native EyeDropper API,\nwhere the browser provides one. The anchor is a trigger button\n(`mode="default"`) or an editable text field (`mode="input"`).',
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
        'The label of the component.\n\nIn `mode="input"` the component forwards the label to the anchor input.\nIn `mode="default"` it renders the label as a separate element.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'The value of the component as a CSS color string. Accepts any CSS color,\nsuch as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named color. A\ncolor outside the sRGB gamut is clipped to it.\n\nAn empty, whitespace-only or invalid string clears the value. So does a\ncolor that depends on its context: `currentcolor`, `var()`, `light-dark()`\nor a system color.',
      control: 'text',
    },
    format: {
      type: { name: 'enum', value: ['hex', 'rgb', 'hsl', 'oklch'] },
      description:
        'The color format of the string value.\n\nA format change renders `value` in the new notation. The color does not\nchange, so the component emits no `igcInput` or `igcChange`.',
      options: ['hex', 'rgb', 'hsl', 'oklch'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'hex' } },
    },
    hideFormats: {
      type: 'boolean',
      description: 'Whether the format select is hidden.',
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
      type: { name: 'enum', value: ['default', 'input'] },
      description:
        'The mode of the color picker.\n\nIn `"default"` mode the anchor is a trigger button. In `"input"` mode the\nanchor is an editable text field with a color swatch prefix. The prefix\nalso opens the picker.',
      options: ['default', 'input'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'default' } },
    },
    selectionCommit: {
      type: { name: 'enum', value: ['immediate', 'confirm'] },
      description:
        'When the changes of the user in the popup apply. With `confirm`, they\nchange a draft: `value` keeps its color, and the popup shows the initial\ncolor beside the draft. Apply, or Enter on the canvas marker, a slider or\na swatch, applies the draft with one `igcChange`. Cancel and every other\nclose drop it.',
      options: ['immediate', 'confirm'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'immediate' } },
    },
    views: {
      type: 'string',
      description:
        'The views of the popup, as a space-separated list of `gradient` and\n`swatches`. With both views, a view switcher shows at the top.\n\nWith only the gradient view, the swatch list shows below the gradient\ncontrols. With the swatch view, the swatch list shows only in that view.',
      control: 'text',
      table: { defaultValue: { summary: 'gradient' } },
    },
    activeView: {
      type: { name: 'enum', value: ['gradient', 'swatches'] },
      description:
        'The view on screen in the popup: `gradient` or `swatches`. The view\nswitcher sets it and emits no event. A view that `views` does not have\ngives the first view of `views`.',
      options: ['gradient', 'swatches'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'gradient' } },
    },
    contrastAgainst: {
      type: 'string',
      description:
        'The background color of the contrast readout in the popup, as any CSS\ncolor. A color that depends on its context, such as a `var()`, resolves\nfrom the popup. The readout shows the WCAG 2 contrast ratio of the value\nover this color, with the AA and AAA levels for normal text. An empty or\ninvalid color hides it.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale of the component. Without it, the component takes its own\n`lang`, else the locale of the nearest ancestor that has a `locale` (a\ncomponent) or a `lang`, and then the global locale.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description:
        'Whether the control is required. A required control that has no value,\nor is not checked, fails validation.',
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
      description:
        'Whether the control is disabled. A disabled control is not validated,\nand the form does not submit its value.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description:
        'Whether the control shows the invalid state. It changes only the visual\nstate, not the validity.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description:
        'Whether the component is open. A disabled form control stays closed.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'The behavior of the component when a parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
  },
  args: {
    format: 'hex',
    hideFormats: false,
    showAlpha: false,
    mode: 'default',
    selectionCommit: 'immediate',
    views: 'gradient',
    activeView: 'gradient',
    contrastAgainst: '',
    required: false,
    disabled: false,
    invalid: false,
    open: false,
    scrollStrategy: 'hide',
  },
};

export default metadata;

interface IgcColorPickerArgs {
  /**
   * The label of the component.
   *
   * In `mode="input"` the component forwards the label to the anchor input.
   * In `mode="default"` it renders the label as a separate element.
   */
  label: string;
  /**
   * The value of the component as a CSS color string. Accepts any CSS color,
   * such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named color. A
   * color outside the sRGB gamut is clipped to it.
   *
   * An empty, whitespace-only or invalid string clears the value. So does a
   * color that depends on its context: `currentcolor`, `var()`, `light-dark()`
   * or a system color.
   */
  value: string;
  /**
   * The color format of the string value.
   *
   * A format change renders `value` in the new notation. The color does not
   * change, so the component emits no `igcInput` or `igcChange`.
   */
  format: 'hex' | 'rgb' | 'hsl' | 'oklch';
  /** Whether the format select is hidden. */
  hideFormats: boolean;
  /** Whether to show the alpha slider and input. */
  showAlpha: boolean;
  /**
   * The mode of the color picker.
   *
   * In `"default"` mode the anchor is a trigger button. In `"input"` mode the
   * anchor is an editable text field with a color swatch prefix. The prefix
   * also opens the picker.
   */
  mode: 'default' | 'input';
  /**
   * When the changes of the user in the popup apply. With `confirm`, they
   * change a draft: `value` keeps its color, and the popup shows the initial
   * color beside the draft. Apply, or Enter on the canvas marker, a slider or
   * a swatch, applies the draft with one `igcChange`. Cancel and every other
   * close drop it.
   */
  selectionCommit: 'immediate' | 'confirm';
  /**
   * The views of the popup, as a space-separated list of `gradient` and
   * `swatches`. With both views, a view switcher shows at the top.
   *
   * With only the gradient view, the swatch list shows below the gradient
   * controls. With the swatch view, the swatch list shows only in that view.
   */
  views: string;
  /**
   * The view on screen in the popup: `gradient` or `swatches`. The view
   * switcher sets it and emits no event. A view that `views` does not have
   * gives the first view of `views`.
   */
  activeView: 'gradient' | 'swatches';
  /**
   * The background color of the contrast readout in the popup, as any CSS
   * color. A color that depends on its context, such as a `var()`, resolves
   * from the popup. The readout shows the WCAG 2 contrast ratio of the value
   * over this color, with the AA and AAA levels for normal text. An empty or
   * invalid color hides it.
   */
  contrastAgainst: string;
  /**
   * The locale of the component. Without it, the component takes its own
   * `lang`, else the locale of the nearest ancestor that has a `locale` (a
   * component) or a `lang`, and then the global locale.
   */
  locale: string;
  /**
   * Whether the control is required. A required control that has no value,
   * or is not checked, fails validation.
   */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /**
   * Whether the control is disabled. A disabled control is not validated,
   * and the form does not submit its value.
   */
  disabled: boolean;
  /**
   * Whether the control shows the invalid state. It changes only the visual
   * state, not the validity.
   */
  invalid: boolean;
  /** Whether the component is open. A disabled form control stays closed. */
  open: boolean;
  /**
   * The behavior of the component when a parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
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

/** Writes the value of a picker to the `output` element after it. */
function showValue(picker: IgcColorPickerComponent): void {
  const output = picker.nextElementSibling;

  if (output instanceof HTMLOutputElement) {
    output.value = picker.value || '(no color)';
  }
}

/** The WCAG relative luminance of a `#rrggbb` color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio of two `#rrggbb` colors. */
function contrastRatio(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a
  );

  return (light + 0.05) / (dark + 0.05);
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive color picker. Use the controls panel to explore `mode`, `format`, `showAlpha`, `hideFormats`, `selectionCommit`, `scrollStrategy` and the validation properties.',
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
        .name=${args.name}
        .format=${args.format}
        .mode=${args.mode}
        .selectionCommit=${args.selectionCommit}
        .scrollStrategy=${args.scrollStrategy}
        .views=${args.views}
        .activeView=${args.activeView}
        .contrastAgainst=${args.contrastAgainst}
        locale=${ifDefined(args.locale)}
        ?hide-formats=${args.hideFormats}
        ?show-alpha=${args.showAlpha}
        ?required=${args.required}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?open=${args.open}
      >
        <p slot="helper-text">Opens on click or with Alt + Arrow Down.</p>
        <igc-color-swatch></igc-color-swatch>
        <igc-color-swatch color="rebeccapurple"></igc-color-swatch>
        <igc-color-swatch color="#e63946"></igc-color-swatch>
        <igc-color-swatch color="#f4a261"></igc-color-swatch>
        <igc-color-swatch color="#2a9d8f"></igc-color-swatch>
        <igc-color-swatch color="#264653"></igc-color-swatch>
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
          '`format` sets the notation of `value`. The first four pickers hold the same translucent color, and the text under each one shows the `value` string that the component reports. The format switcher in the picker changes the notation, not the color, so it emits no `igcInput` or `igcChange`. `hide-formats` removes the switcher and locks the notation, as in the last picker. `show-alpha` adds the alpha slider and input in whole percent. The anchor then shows the opaque color over its left half and the real opacity over the full surface.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const refresh = (event: Event) =>
      showValue(event.currentTarget as IgcColorPickerComponent);

    // The `format` of a picker applies in its first update.
    const init = async (element?: Element) => {
      if (element instanceof IgcColorPickerComponent) {
        await element.updateComplete;
        showValue(element);
      }
    };

    return html`
      ${samples}
      <div class="samples">
        ${(
          [
            ['Hex', 'hex', false],
            ['RGB', 'rgb', false],
            ['HSL', 'hsl', false],
            ['OKLCH', 'oklch', false],
            ['HSL only', 'hsl', true],
          ] as const
        ).map(
          ([label, format, hideFormats]) => html`
            <div>
              <igc-color-picker
                label=${label}
                format=${format}
                value="rgb(63 81 181 / 0.6)"
                show-alpha
                ?hide-formats=${hideFormats}
                ${ref(init)}
                @igcInput=${refresh}
                @igcClosed=${refresh}
              ></igc-color-picker>
              <output></output>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The same states in both anchor modes. `mode="default"` renders a trigger button. `mode="input"` renders an editable text field with the swatch as its prefix. The field accepts any CSS color string, reverts an invalid string to the current value and clears the picker when it is empty. With no value the anchor shows a checkered "no color" pattern, and the picker opens at the white corner of the canvas with the hue slider at red.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    <style>
      .states {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 18rem));
        align-items: start;
        gap: 1.5rem 3rem;
        padding-block-end: 22rem;
      }

      .states h4 {
        margin: 0;
      }
    </style>
    <div class="states">
      <h4>Trigger button</h4>
      <h4>Text field</h4>

      ${(['default', 'input'] as const).map(
        (mode) => html`
          <igc-color-picker
            label="With a value"
            mode=${mode}
            value="#e91e63"
          ></igc-color-picker>
        `
      )}
      ${(['default', 'input'] as const).map(
        (mode) => html`
          <igc-color-picker
            label="No color selected"
            mode=${mode}
          ></igc-color-picker>
        `
      )}
      ${(['default', 'input'] as const).map(
        (mode) => html`
          <igc-color-picker
            label="Invalid"
            mode=${mode}
            value="#009688"
            invalid
          >
            <p slot="helper-text">Pick a color to continue</p>
          </igc-color-picker>
        `
      )}
      ${(['default', 'input'] as const).map(
        (mode) => html`
          <igc-color-picker
            label="Disabled"
            mode=${mode}
            value="#009688"
            disabled
          ></igc-color-picker>
        `
      )}
    </div>
  `,
};

export const Swatches: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A text highlight tool. `swatches` renders preset colors under the picker controls, and a click on a swatch sets the value. A swatch accepts any CSS color string, but the presets here use hex, the format of `value`, so that the handler can find duplicates. When the user commits a color that is not in the list, the `igcChange` handler adds it to the start of the list as a recent color, and keeps at most 10 swatches.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const limit = 10;

    const addRecent = (event: CustomEvent<string>) => {
      const picker = event.currentTarget as IgcColorPickerComponent;
      const color = event.detail;

      if (color && !picker.swatches.includes(color)) {
        picker.swatches = [color, ...picker.swatches].slice(0, limit);
      }
    };

    const highlight = (event: CustomEvent<string>) => {
      const picker = event.currentTarget as IgcColorPickerComponent;
      picker
        .closest('.samples')
        ?.querySelector('mark')
        ?.style.setProperty('background', event.detail || 'transparent');
    };

    return html`
      ${samples}
      <div class="samples" style="flex-direction: column">
        <igc-color-picker
          label="Highlight color"
          mode="input"
          value="#f9c74f"
          hide-formats
          .swatches=${['#f9c74f', '#90be6d', '#4cc9f0', '#ff99cc', '#ffb478']}
          @igcInput=${highlight}
          @igcChange=${addRecent}
        >
          <p slot="helper-text">Commit a custom color to add it here.</p>
        </igc-color-picker>

        <p style="max-width: 36rem; margin: 0">
          The picker sets the color of the
          <mark style="background: #f9c74f; color: inherit">highlighted</mark>
          word in this sentence.
        </p>
      </div>
    `;
  },
};

export const RecentColors: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Recent colors that the app keeps. The `igcChange` handler adds each committed color to the start of the "Recent" swatch group, and keeps at most 8. The component has no API for recent colors: the swatch groups are light DOM children, so the app owns the list, its order and its storage. The "Palette" group stays the same, and its first swatch has no color.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const limit = 8;

    const addRecent = (event: CustomEvent<string>) => {
      const picker = event.currentTarget as IgcColorPickerComponent;
      const group = picker.querySelector('#recent-colors');
      const color = event.detail;

      if (!(color && group)) {
        return;
      }

      // The same color moves to the start.
      for (const swatch of group.querySelectorAll('igc-color-swatch')) {
        if (swatch.color === color) {
          swatch.remove();
        }
      }

      const swatch = document.createElement('igc-color-swatch');
      swatch.color = color;
      group.querySelector('[slot="label"]')?.after(swatch);

      for (const extra of Array.from(
        group.querySelectorAll('igc-color-swatch')
      ).slice(limit)) {
        extra.remove();
      }
    };

    return html`
      ${samples}
      <div class="samples">
        <igc-color-picker
          label="Text color"
          value="#264653"
          @igcChange=${addRecent}
        >
          <p slot="helper-text">Commit a color to add it to "Recent".</p>
          <igc-color-swatch-group id="recent-colors">
            <span slot="label">Recent</span>
          </igc-color-swatch-group>
          <igc-color-swatch-group>
            <span slot="label">Palette</span>
            <igc-color-swatch></igc-color-swatch>
            <igc-color-swatch
              color="#264653"
              label="Charcoal"
            ></igc-color-swatch>
            <igc-color-swatch color="#2a9d8f" label="Teal"></igc-color-swatch>
            <igc-color-swatch
              color="#e9c46a"
              label="Saffron"
            ></igc-color-swatch>
            <igc-color-swatch color="#f4a261" label="Sandy"></igc-color-swatch>
            <igc-color-swatch color="#e76f51" label="Coral"></igc-color-swatch>
            <igc-color-swatch color="#ffffff" label="White"></igc-color-swatch>
            <igc-color-swatch color="#000000" label="Black"></igc-color-swatch>
          </igc-color-swatch-group>
        </igc-color-picker>
      </div>
    `;
  },
};

export const ConfirmMode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'With `selection-commit="confirm"`, the changes in the popup are a draft. `value`, shown under the picker, keeps its color, and the picker emits no `igcInput`. Apply, or <kbd>Enter</kbd> on the canvas marker, a slider or a swatch, applies the draft with one `igcChange`. Cancel, <kbd>Escape</kbd> and an outside click drop it. The preview shows the initial color first and the draft second; a click on the initial color restores it. The text in the popup comes from the `footer` slot.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <div>
        <igc-color-picker
          label="Brand color"
          value="#2a9d8f"
          selection-commit="confirm"
          show-alpha
          .swatches=${palette}
          @igcChange=${(event: Event) =>
            showValue(event.currentTarget as IgcColorPickerComponent)}
        >
          <small slot="footer">Enter applies. Escape cancels.</small>
        </igc-color-picker>
        <output>#2a9d8f</output>
      </div>
    </div>
  `,
};

export const ThemeEditor: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A theme editor with a live preview. Each picker writes its value to a CSS custom property on `igcInput`, so the preview follows every drag. The editor also checks the WCAG contrast ratio of the text on the surface and of the white button label on the primary color. If a ratio is less than 4.5:1, it calls `setCustomValidity()` and the `custom-error` slot shows the ratio. The message shows when focus leaves the changed picker. The popups of the Primary and Text pickers show the same ratios: `contrast-against` is white for the primary color and `var(--surface)` for the text.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const minimum = 4.5;

    const check = (
      picker: IgcColorPickerComponent,
      background: string,
      foreground: string
    ) => {
      const ratio = contrastRatio(background, foreground);
      const message =
        ratio < minimum
          ? `The contrast ratio is ${ratio.toFixed(2)}:1. WCAG AA requires ${minimum}:1.`
          : '';

      picker.setCustomValidity(message);
      picker.querySelector('[slot="custom-error"]')!.textContent = message;
    };

    const update = (event: Event) => {
      const editor = (event.currentTarget as HTMLElement).closest<HTMLElement>(
        '.theme-editor'
      )!;
      const [primary, surface, text] = Array.from(
        editor.querySelectorAll('igc-color-picker')
      );

      for (const picker of [primary, surface, text]) {
        if (picker.value) {
          editor.style.setProperty(`--${picker.name}`, picker.value);
        }
      }

      if (primary.value) {
        check(primary, primary.value, '#ffffff');
      }

      if (surface.value && text.value) {
        check(text, surface.value, text.value);
      }
    };

    return html`
      <style>
        .theme-editor {
          --primary: #3f51b5;
          --surface: #fafafa;
          --text: #212121;

          display: flex;
          flex-wrap: wrap;
          align-items: start;
          gap: 2rem 3rem;
          padding-block-end: 22rem;
        }

        .theme-editor .settings {
          display: grid;
          gap: 1.5rem;
          width: 18rem;
        }

        .theme-editor .preview {
          width: 20rem;
          padding: 1.5rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text);
        }

        .theme-editor .preview h4 {
          margin: 0 0 0.5rem;
          color: var(--primary);
        }

        .theme-editor .preview button {
          margin-block-start: 1rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: var(--primary);
          color: #fff;
          font: inherit;
        }
      </style>

      <div class="theme-editor">
        <div class="settings">
          <igc-color-picker
            name="primary"
            label="Primary"
            value="#3f51b5"
            contrast-against="white"
            .swatches=${palette}
            @igcInput=${update}
          >
            <p slot="helper-text">Buttons, links and headings.</p>
            <p slot="custom-error"></p>
          </igc-color-picker>

          <igc-color-picker
            name="surface"
            label="Surface"
            value="#fafafa"
            .swatches=${['#ffffff', '#fafafa', '#f5f5f5', '#eceff1', '#263238']}
            @igcInput=${update}
          >
            <p slot="helper-text">The card background.</p>
          </igc-color-picker>

          <igc-color-picker
            name="text"
            label="Text"
            value="#212121"
            contrast-against="var(--surface)"
            .swatches=${['#000000', '#212121', '#424242', '#757575', '#ffffff']}
            @igcInput=${update}
          >
            <p slot="helper-text">The body text on the surface.</p>
            <p slot="custom-error"></p>
          </igc-color-picker>
        </div>

        <article class="preview" aria-label="Theme preview">
          <h4>Quarterly report</h4>
          <p>
            Revenue grew 12% this quarter. The largest gains came from the new
            subscription plans.
          </p>
          <button type="button">Read more</button>
        </article>
      </div>
    `;
  },
};

export const ChartSeries: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A chart legend where each series has a compact color picker. The pickers have no visible label, so `aria-label` on each host names the trigger button. The `anchor` part makes the trigger round, `hide-formats` removes the format switcher, and `swatches` offers a chart palette. The bars change color on `igcInput`.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const series = [
      { name: 'Revenue', color: '#577590', values: [40, 55, 70, 62] },
      { name: 'Expenses', color: '#f94144', values: [30, 35, 38, 45] },
      { name: 'Profit', color: '#90be6d', values: [10, 20, 32, 17] },
    ];

    const recolor = (event: CustomEvent<string>) => {
      const picker = event.currentTarget as IgcColorPickerComponent;
      picker
        .closest<HTMLElement>('.series-chart')
        ?.style.setProperty(`--${picker.name}`, event.detail || 'transparent');
    };

    return html`
      <style>
        .series-chart {
          display: grid;
          gap: 1rem;
          width: min(100%, 28rem);
          padding-block-end: 22rem;
        }

        .series-chart .bars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: end;
          gap: 1rem;
          height: 10rem;
          border-block-end: 1px solid var(--ig-gray-400);
        }

        .series-chart .quarter {
          display: flex;
          align-items: end;
          gap: 2px;
          height: 100%;
        }

        .series-chart .bar {
          flex: 1;
        }

        .series-chart .axis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          text-align: center;
        }

        .series-chart .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .series-chart .legend li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .series-chart igc-color-picker::part(anchor),
        .series-chart igc-color-picker::part(anchor)::before {
          border-radius: 50%;
        }

        .series-chart igc-color-picker::part(anchor) {
          width: 1.5rem;
          height: 1.5rem;
        }
      </style>

      <figure
        class="series-chart"
        style=${series
          .map((s) => `--${s.name.toLowerCase()}: ${s.color}`)
          .concat('margin: 0')
          .join('; ')}
      >
        <div class="bars" aria-hidden="true">
          ${[0, 1, 2, 3].map(
            (quarter) => html`
              <div class="quarter">
                ${series.map(
                  (s) => html`
                    <div
                      class="bar"
                      style="height: ${s.values[quarter]}%; background: var(--${s.name.toLowerCase()})"
                    ></div>
                  `
                )}
              </div>
            `
          )}
        </div>
        <div class="axis" aria-hidden="true">
          <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
        </div>

        <figcaption>
          <ul class="legend">
            ${series.map(
              (s) => html`
                <li>
                  <igc-color-picker
                    name=${s.name.toLowerCase()}
                    aria-label="${s.name} series color"
                    value=${s.color}
                    hide-formats
                    .swatches=${palette}
                    @igcInput=${recolor}
                  ></igc-color-picker>
                  <span>${s.name}</span>
                </li>
              `
            )}
          </ul>
        </figcaption>
      </figure>
    `;
  },
};

export const Events: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The log shows the events of the picker. `igcInput` fires on each change in the picker: a canvas or slider drag, a typed value, a swatch or the eye dropper. The log counts the consecutive `igcInput` events of a drag in one line. `igcChange` fires once, when focus leaves the component and the value is different from the value on focus. `igcOpening` and `igcClosing` are cancelable.',
      },
    },
  },
  render: () => {
    const limit = 8;

    const log = (event: Event) => {
      const list = (event.currentTarget as HTMLElement)
        .closest('.samples')
        ?.querySelector('ol');

      if (!list) {
        return;
      }

      const detail = (event as CustomEvent<string | undefined>).detail;
      const text =
        event.type === 'igcInput' || event.type === 'igcChange'
          ? `${event.type}: ${detail || '(cleared)'}`
          : event.type;
      const last = list.firstElementChild as HTMLLIElement | null;

      if (event.type === 'igcInput' && last?.dataset.type === 'igcInput') {
        const count = Number(last.dataset.count) + 1;
        last.dataset.count = `${count}`;
        last.textContent = `${text} (×${count})`;
        return;
      }

      const item = document.createElement('li');
      item.dataset.type = event.type;
      item.dataset.count = '1';
      item.textContent = text;
      list.prepend(item);

      while (list.children.length > limit) {
        list.lastElementChild!.remove();
      }
    };

    return html`
      ${samples}
      <div class="samples">
        <igc-color-picker
          label="Pick a color"
          value="#43aa8b"
          show-alpha
          .swatches=${palette}
          @igcOpening=${log}
          @igcOpened=${log}
          @igcClosing=${log}
          @igcClosed=${log}
          @igcInput=${log}
          @igcChange=${log}
        ></igc-color-picker>
        <section>
          <h4 style="margin: 0">Event log (latest first)</h4>
          <ol
            style="min-width: 18rem; font-family: var(--ig-font-family, monospace)"
          ></ol>
        </section>
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
          'A brand settings form. Each picker submits its `value` in its `format` under `name`. The required accent color shows the `value-missing` slot after a submit or a change. Reset restores the value that each control had at render time. A disabled fieldset disables the pickers in it and removes them from the form data.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <form action="" @submit=${formSubmitHandler}>
      <fieldset style="display: grid; gap: 16px;">
        <legend>Brand colors</legend>
        <igc-color-picker
          name="primary"
          label="Primary color"
          value="#3f51b5"
          .swatches=${palette}
        >
          <p slot="helper-text">The main brand color, submitted as hex.</p>
        </igc-color-picker>

        <igc-color-picker
          name="overlay"
          label="Overlay color"
          format="rgb"
          value="rgb(0 0 0 / 0.5)"
          show-alpha
        >
          <p slot="helper-text">The dialog backdrop, submitted as rgb.</p>
        </igc-color-picker>

        <igc-color-picker
          name="accent"
          label="Accent color"
          mode="input"
          required
        >
          <p slot="value-missing">Pick an accent color to continue.</p>
        </igc-color-picker>
      </fieldset>

      <fieldset disabled>
        <legend>Locked by the administrator</legend>
        <igc-color-picker
          name="logo"
          label="Logo color"
          value="#009688"
        ></igc-color-picker>
      </fieldset>

      ${formControls()}
    </form>
  `,
};

export const InScrollingPanel: Story = {
  args: {
    label: 'Accent color',
    value: '#3f51b5',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A color picker opens inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the picker when the panel scrolls. If the value is `hide`, the picker hides while the anchor is out of view. `hide` is the default value. If the value is `scroll`, the picker follows the anchor. If the value is `close`, the picker closes.',
      },
    },
    actions: { handles: [] },
  },
  render: ({ label, value, mode, scrollStrategy }) => html`
    <style>
      .panel {
        max-width: 46rem;
        height: 16rem;
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--ig-gray-200, #e0e0e0);
        border-radius: 4px;
      }
    </style>

    <div class="panel">
      <h4>Appearance</h4>
      <p>
        Open the picker and scroll this panel to compare the scroll strategies.
      </p>

      <igc-color-picker
        .label=${label}
        .value=${value ?? ''}
        .mode=${mode}
        .scrollStrategy=${scrollStrategy}
      ></igc-color-picker>

      <p>
        ${Array.from(range(1, 24)).map(
          () => html`The accent color applies to buttons, links and charts. `
        )}
      </p>
    </div>
  `,
};
