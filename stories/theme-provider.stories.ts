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

const metadata: Meta<IgcThemeProviderComponent> = {
  title: 'ThemeProvider',
  component: IgcThemeProviderComponent.tagName,
  argTypes: {
    theme: {
      control: 'select',
      options: ['bootstrap', 'material', 'fluent', 'indigo'],
      description: 'The theme to apply to descendant components',
    },
    variant: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'The theme variant to apply to descendant components',
    },
  },
};

export default metadata;

interface ArgTypes {
  theme: any;
  variant: any;
}

type Story = StoryObj<ArgTypes>;

const Template = ({ theme, variant }: ArgTypes) => html`
  <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem;">
    <igc-card>
      <igc-card-header>
        <h3>Global Theme Scope</h3>
      </igc-card-header>
      <igc-card-content>
        <p>These components use the scoped theme from the provider.</p>
        <div style="display: flex; gap: 1rem; flex-direction: column;">
          <igc-input
            label="Input Field"
            placeholder="Type something..."
          ></igc-input>
          <igc-date-picker label="Select a Date"></igc-date-picker>
          <div style="display: flex; gap: 1rem;">
            <igc-button>Primary Button</igc-button>
            <igc-button variant="outlined">Outlined Button</igc-button>
          </div>
        </div>
      </igc-card-content>
    </igc-card>
  </div>

  <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem;">
    <igc-theme-provider theme=${ifDefined(theme)} variant=${ifDefined(variant)}>
      <igc-card>
        <igc-card-header>
          <h3>Scoped Theme Example</h3>
          <h5>Theme: ${theme} | Variant: ${variant}</h5>
        </igc-card-header>
        <igc-card-content>
          <p>These components use the scoped theme from the provider.</p>
          <div style="display: flex; gap: 1rem; flex-direction: column;">
            <igc-input
              label="Input Field"
              placeholder="Type something..."
            ></igc-input>
            <igc-date-picker label="Select a Date"></igc-date-picker>
            <div style="display: flex; gap: 1rem;">
              <igc-button>Primary Button</igc-button>
              <igc-button variant="outlined">Outlined Button</igc-button>
            </div>
          </div>
        </igc-card-content>
      </igc-card>
    </igc-theme-provider>
  </div>
`;

export const Basic: Story = {
  args: {
    theme: 'material',
    variant: 'light',
  },
  render: Template,
};
