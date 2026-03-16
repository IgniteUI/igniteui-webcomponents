import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcInputComponent,
  IgcThemeProviderComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';
import { styles as bootstrapDarkStyles } from '../src/styles/themes/dark/bootstrap.css.js';

// The theme file uses :root selectors for CSS custom properties. Replace them
// with :scope so they are set on the igc-theme-provider element instead of the
// document root, allowing them to cascade into its Shadow DOM descendants.
const bootstrapDarkScopedCSS = bootstrapDarkStyles.cssText.replace(
  /:root\b/g,
  ':scope'
);

defineComponents(
  IgcThemeProviderComponent,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcCardHeaderComponent,
  IgcCardContentComponent
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
  parameters: {
    docs: {
      description: {
        story:
          'Use the **Controls** panel to switch `theme` and `variant`. The right column is wrapped in an `igc-theme-provider` and updates to the selected theme independently of the global Storybook theme shown on the left.',
      },
    },
  },
  render: ({ theme, variant }, { globals }) => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <igc-card>
        <igc-card-header>
          <h3>Global: ${globals.theme} / ${globals.variant}</h3>
        </igc-card-header>
        <igc-card-content>
          <div style="display: flex; flex-direction: column; gap: .75rem;">
            <igc-input
              outlined
              label="Username"
              placeholder="Enter username..."
            ></igc-input>
            <igc-input
              outlined
              label="Password"
              placeholder="Enter password..."
            ></igc-input>
            <div style="display: flex; gap: .5rem;">
              <igc-button>Sign In</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </div>
        </igc-card-content>
      </igc-card>

      <igc-theme-provider theme=${theme} variant=${variant}>
        <igc-card>
          <igc-card-header>
            <h3>Scoped: ${theme} / ${variant}</h3>
          </igc-card-header>
          <igc-card-content>
            <div style="display: flex; flex-direction: column; gap: .75rem;">
              <igc-input
                outlined
                label="Username"
                placeholder="Enter username..."
              ></igc-input>
              <igc-input
                outlined
                label="Password"
                placeholder="Enter password..."
              ></igc-input>
              <div style="display: flex; gap: .5rem;">
                <igc-button>Sign In</igc-button>
                <igc-button variant="outlined">Cancel</igc-button>
              </div>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>
    </div>
  `,
};

export const AllThemes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'All four built-in themes — Bootstrap, Material, Fluent, and Indigo — shown side by side in the light variant, each scoped by its own `igc-theme-provider`.',
      },
    },
  },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;"
    >
      <igc-theme-provider theme="bootstrap" variant="light">
        <igc-card>
          <igc-card-header><h3>Bootstrap</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>

      <igc-theme-provider theme="material" variant="light">
        <igc-card>
          <igc-card-header><h3>Material</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>

      <igc-theme-provider theme="fluent" variant="light">
        <igc-card>
          <igc-card-header><h3>Fluent</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>

      <igc-theme-provider theme="indigo" variant="light">
        <igc-card>
          <igc-card-header><h3>Indigo</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>
    </div>
  `,
};

export const LightAndDark: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The Bootstrap theme in both light and dark variants shown simultaneously. Each `igc-theme-provider` scopes its variant to its own subtree, leaving the rest of the page unaffected.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <igc-theme-provider theme="bootstrap" variant="light">
        <igc-card>
          <igc-card-header><h3>Bootstrap / Light</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>

      <igc-theme-provider theme="bootstrap" variant="dark">
        <style>
          @scope {
            ${bootstrapDarkScopedCSS}
          }
        </style>
        <igc-card>
          <igc-card-header><h3>Bootstrap / Dark</h3></igc-card-header>
          <igc-card-content>
            <igc-input outlined label="Username"></igc-input>
            <div style="margin-top: .75rem; display: flex; gap: .5rem;">
              <igc-button>Submit</igc-button>
              <igc-button variant="outlined">Cancel</igc-button>
            </div>
          </igc-card-content>
        </igc-card>
      </igc-theme-provider>
    </div>
  `,
};
