import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcColorPanelComponent,
  IgcColorSwatchComponent,
  IgcColorSwatchGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcColorPanelComponent,
  IgcColorSwatchComponent,
  IgcColorSwatchGroupComponent
);

// region default
const metadata: Meta<IgcColorPanelComponent> = {
  title: 'ColorPanel',
  component: 'igc-color-panel',
  parameters: {
    docs: {
      description: {
        component:
          'A color selection surface that stays in the page.\n\nThe user picks a color with the HSV saturation/value canvas, the hue slider\nand the optional alpha slider. The user can also type any CSS color string,\nsuch as hex, `rgb()`, `hsl()`, `oklch()` or a named color, pick a swatch, or\npick a color from the screen with the native EyeDropper API, where the\nbrowser provides one.\n\nThe panel is not a form control. The color picker shows it in a popup.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string',
      description:
        'The value of the component as a CSS color string, in `format`. Accepts any\nCSS color, such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named\ncolor. A color outside the sRGB gamut is clipped to it.\n\nAn empty, whitespace-only or invalid string clears the value. So does a\ncolor that depends on its context: `currentcolor`, `var()`, `light-dark()`\nor a system color.',
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
    views: {
      type: 'string',
      description:
        'The views of the component, as a space-separated list of `gradient` and\n`swatches`. With both views, a view switcher shows at the top.\n\nWith only the gradient view, the swatch list shows below the gradient\ncontrols. With the swatch view, the swatch list shows only in that view.',
      control: 'text',
      table: { defaultValue: { summary: 'gradient' } },
    },
    activeView: {
      type: { name: 'enum', value: ['gradient', 'swatches'] },
      description:
        'The view on screen: `gradient` or `swatches`. The view switcher sets it\nand emits no event. A view that `views` does not have gives the first\nview of `views`.',
      options: ['gradient', 'swatches'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'gradient' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale of the component. Without it, the component takes its own\n`lang`, else the locale of the nearest ancestor that has a `locale` (a\ncomponent) or a `lang`, and then the global locale.',
      control: 'text',
    },
  },
  args: {
    format: 'hex',
    hideFormats: false,
    showAlpha: false,
    views: 'gradient',
    activeView: 'gradient',
  },
};

export default metadata;

interface IgcColorPanelArgs {
  /**
   * The value of the component as a CSS color string, in `format`. Accepts any
   * CSS color, such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named
   * color. A color outside the sRGB gamut is clipped to it.
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
   * The views of the component, as a space-separated list of `gradient` and
   * `swatches`. With both views, a view switcher shows at the top.
   *
   * With only the gradient view, the swatch list shows below the gradient
   * controls. With the swatch view, the swatch list shows only in that view.
   */
  views: string;
  /**
   * The view on screen: `gradient` or `swatches`. The view switcher sets it
   * and emits no event. A view that `views` does not have gives the first
   * view of `views`.
   */
  activeView: 'gradient' | 'swatches';
  /**
   * The locale of the component. Without it, the component takes its own
   * `lang`, else the locale of the nearest ancestor that has a `locale` (a
   * component) or a `lang`, and then the global locale.
   */
  locale: string;
}
type Story = StoryObj<IgcColorPanelArgs>;

// endregion

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The color panel stays in the page. Use the controls panel to explore `format`, `showAlpha` and `hideFormats`. The actions panel shows `igcInput` while a gesture runs and `igcChange` when it ends.',
      },
    },
  },
  args: {
    value: 'rebeccapurple',
  },
  render: (args) => html`
    <igc-color-panel
      .value=${args.value ?? ''}
      .format=${args.format}
      .views=${args.views}
      .activeView=${args.activeView}
      locale=${ifDefined(args.locale)}
      ?show-alpha=${args.showAlpha}
      ?hide-formats=${args.hideFormats}
    >
      <igc-color-swatch></igc-color-swatch>
      <igc-color-swatch color="rebeccapurple"></igc-color-swatch>
      <igc-color-swatch color="#e63946"></igc-color-swatch>
      <igc-color-swatch color="#f4a261"></igc-color-swatch>
      <igc-color-swatch color="#2a9d8f"></igc-color-swatch>
      <igc-color-swatch color="#264653"></igc-color-swatch>
      <igc-color-swatch color="rgb(69 123 157 / 50%)"></igc-color-swatch>
    </igc-color-panel>
  `,
};

export const SwatchView: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A panel with both views. The swatch view opens first, and the switcher at the top changes the view. The swatches are light DOM children in labelled groups. The first swatch has no color: a pick clears the value. The brand swatches use `var()`, so they follow the custom properties of the page, and a pick writes the resolved color.',
      },
    },
  },
  render: () => html`
    <style>
      #swatch-view-sample {
        --brand-primary: #3d5a80;
        --brand-secondary: #ee6c4d;
        --brand-accent: #98c1d9;
      }
    </style>
    <igc-color-panel
      id="swatch-view-sample"
      views="gradient swatches"
      active-view="swatches"
      value="#3d5a80"
    >
      <igc-color-swatch></igc-color-swatch>
      <igc-color-swatch-group>
        <span slot="label">Brand</span>
        <igc-color-swatch
          color="var(--brand-primary)"
          label="Primary"
        ></igc-color-swatch>
        <igc-color-swatch
          color="var(--brand-secondary)"
          label="Secondary"
        ></igc-color-swatch>
        <igc-color-swatch
          color="var(--brand-accent)"
          label="Accent"
        ></igc-color-swatch>
      </igc-color-swatch-group>
      <igc-color-swatch-group>
        <span slot="label">Neutrals</span>
        <igc-color-swatch color="#ffffff" label="White"></igc-color-swatch>
        <igc-color-swatch color="#e0e1dd" label="Silver"></igc-color-swatch>
        <igc-color-swatch color="#778da9" label="Slate"></igc-color-swatch>
        <igc-color-swatch color="#415a77" label="Steel"></igc-color-swatch>
        <igc-color-swatch color="#1b263b" label="Navy"></igc-color-swatch>
        <igc-color-swatch color="#0d1b2a" label="Ink"></igc-color-swatch>
        <igc-color-swatch color="#000000" label="Black"></igc-color-swatch>
      </igc-color-swatch-group>
    </igc-color-panel>
  `,
};

export const LivePreview: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A theme editor. `igcInput` paints the preview while the user drags, and `igcChange` logs each finished change, for example to save it.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const preview = (event: CustomEvent<string>) => {
      document
        .querySelector<HTMLElement>('#color-panel-preview')
        ?.style.setProperty('--brand', event.detail || 'transparent');
    };

    const log = (event: CustomEvent<string>) => {
      const list = document.querySelector('#color-panel-log');
      const item = document.createElement('li');

      item.textContent = event.detail || 'No color';
      list?.prepend(item);
    };

    return html`
      <style>
        #color-panel-preview {
          --brand: #3366cc;

          display: grid;
          place-items: center;
          inline-size: 12rem;
          block-size: 8rem;
          border-radius: 0.5rem;
          background: var(--brand);
          color: white;
          font: 600 1rem/1.2 var(--ig-font-family, sans-serif);
        }
      </style>
      <div style="display: flex; flex-wrap: wrap; gap: 1.5rem">
        <igc-color-panel
          value="#3366cc"
          show-alpha
          .swatches=${['#3366cc', '#e64a19', '#2e7d32', '#6a1b9a', '#f9a825']}
          @igcInput=${preview}
          @igcChange=${log}
        ></igc-color-panel>
        <div>
          <div id="color-panel-preview">Brand color</div>
          <p>Saved changes:</p>
          <ol id="color-panel-log"></ol>
        </div>
      </div>
    `;
  },
};
