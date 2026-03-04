import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  defineComponents,
  IgcThemeProviderComponent,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcCardHeaderComponent,
  IgcCardContentComponent,
  IgcDatePickerComponent,
} from 'igniteui-webcomponents';

defineComponents(
  IgcThemeProviderComponent,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcCardHeaderComponent,
  IgcCardContentComponent,
  IgcDatePickerComponent
);

// region default
const metadata: Meta<IgcThemeProviderComponent> = {
  title: 'ThemeProvider',
  component: 'igc-theme-provider',
  parameters: {
    docs: {
      description: {
        component:
          'A theme provider component that uses Lit context to provide theme information\nto descendant components.\n\nThis component allows you to scope a theme to a specific part of the page.\nAll library components within this provider will use the specified theme\ninstead of the global theme.',
      },
    },
  },
  argTypes: {
    theme: {
      type: '"material" | "bootstrap" | "indigo" | "fluent"',
      description: 'The theme to provide to descendant components.',
      options: ['material', 'bootstrap', 'indigo', 'fluent'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'bootstrap' } },
    },
    variant: {
      type: '"light" | "dark"',
      description: 'The theme variant to provide to descendant components.',
      options: ['light', 'dark'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'light' } },
    },
  },
  args: { theme: 'bootstrap', variant: 'light' },
};

export default metadata;

interface IgcThemeProviderArgs {
  /** The theme to provide to descendant components. */
  theme: 'material' | 'bootstrap' | 'indigo' | 'fluent';
  /** The theme variant to provide to descendant components. */
  variant: 'light' | 'dark';
}
type Story = StoryObj<IgcThemeProviderArgs>;

// endregion

export const Default: Story = {
  args: {
    theme: 'material',
    variant: 'light',
  },
  render: ({ theme, variant }, { globals }) => html`
    <style>
      /* Custom light variant - Purple/Teal color scheme */
      @scope (igc-theme-provider[variant='light']) {
        :scope {
          /* Primary palette - Purple */
          --ig-primary-500: #7c3aed;
          --ig-primary-500-contrast: white;

          /* Secondary palette - Teal */
          --ig-secondary-500: #14b8a6;
          --ig-secondary-500-contrast: white;

          /* Surface - Light lavender (light color for light theme) */
          --ig-surface-500: #faf5ff;

          /* Gray palette - Dark grays for light theme (to contrast light surface) */
          --ig-gray-500: hsl(250, 10%, 46%);
        }

        .scoped-theme-wrapper {
          background-color: #faf5ff;
          color: #27272a;
        }

        .scoped-theme-wrapper h3,
        .scoped-theme-wrapper h5,
        .scoped-theme-wrapper p {
          color: #27272a;
        }
      }

      /* Custom dark variant - Cyan/Pink color scheme */
      @scope (igc-theme-provider[variant='dark']) {
        :scope {
          /* Primary palette - Cyan */
          --ig-primary-500: #22d3ee;
          --ig-primary-500-contrast: black;

          /* Secondary palette - Pink */
          --ig-secondary-500: #f472b6;
          --ig-secondary-500-contrast: black;

          /* Surface - Dark slate (dark color for dark theme) */
          --ig-surface-500: #0f172a;

          /* Gray palette - Light grays for dark theme (to contrast dark surface) */
          --ig-gray-500: hsl(215, 20%, 75%);
        }

        .scoped-theme-wrapper {
          background-color: #0f172a;
          color: #e2e8f0;
        }

        .scoped-theme-wrapper h3,
        .scoped-theme-wrapper h5,
        .scoped-theme-wrapper p {
          color: #e2e8f0;
        }
      }
    </style>

    <div
      style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem;"
    >
      <igc-card>
        <igc-card-header>
          <h3>Global Theme:</h3>
          <h5>Theme: ${globals.theme} | Variant: ${globals.variant}</h5>
        </igc-card-header>
        <igc-card-content>
          <p>These components use the global theme.</p>
          <div
            style="display: flex; gap: 1rem; flex-direction: column; margin-top: 1rem;"
          >
            <igc-input
              outlined
              label="Input Field"
              placeholder="Type something..."
            ></igc-input>
            <igc-date-picker label="Select a Date" outlined></igc-date-picker>
            <div style="display: flex; gap: 1rem;">
              <igc-button>Primary Button</igc-button>
              <igc-button variant="outlined">Outlined Button</igc-button>
            </div>
          </div>
        </igc-card-content>
      </igc-card>
    </div>

    <igc-theme-provider theme=${ifDefined(theme)} variant=${ifDefined(variant)}>
      <div
        class="scoped-theme-wrapper"
        style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem; border-radius: 8px;"
      >
        <igc-card>
          <igc-card-header>
            <h3>Scoped Theme:</h3>
            <h5>Theme: ${theme} | Variant: ${variant}</h5>
          </igc-card-header>
          <igc-card-content>
            <p>These components use the scoped theme from the provider.</p>
            <div
              style="display: flex; gap: 1rem; flex-direction: column; margin-top: 1rem;"
            >
              <igc-input
                outlined
                label="Input Field"
                placeholder="Type something..."
              ></igc-input>
              <igc-date-picker label="Select a Date" outlined></igc-date-picker>
              <div style="display: flex; gap: 1rem;">
                <igc-button>Primary Button</igc-button>
                <igc-button variant="outlined">Outlined Button</igc-button>
              </div>
            </div>
          </igc-card-content>
        </igc-card>
      </div>
    </igc-theme-provider>
  `,
};
