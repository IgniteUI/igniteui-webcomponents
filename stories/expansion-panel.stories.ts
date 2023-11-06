import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { IgcExpansionPanelComponent, defineComponents } from '../src/index.js';

defineComponents(IgcExpansionPanelComponent);

// region default
const metadata: Meta<IgcExpansionPanelComponent> = {
  title: 'ExpansionPanel',
  component: 'igc-expansion-panel',
  parameters: {
    docs: {
      description: {
        component:
          'The Expansion Panel Component provides a way to display information in a toggleable way -\ncompact summary view containing title and description and expanded detail view containing\nadditional content to the summary header.',
      },
    },
    actions: {
      handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description:
        'Indicates whether the contents of the control should be visible.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    disabled: {
      type: 'boolean',
      description:
        'Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    indicatorPosition: {
      type: '"start" | "end" | "none"',
      description: 'The indicator position of the expansion panel.',
      options: ['start', 'end', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'start' } },
    },
  },
  args: { open: false, disabled: false, indicatorPosition: 'start' },
};

export default metadata;

interface IgcExpansionPanelArgs {
  /** Indicates whether the contents of the control should be visible. */
  open: boolean;
  /** Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions. */
  disabled: boolean;
  /** The indicator position of the expansion panel. */
  indicatorPosition: 'start' | 'end' | 'none';
}
type Story = StoryObj<IgcExpansionPanelArgs>;

// endregion

export const Basic: Story = {
  render: (args) => html`
    <igc-expansion-panel
      indicator-position=${args.indicatorPosition}
      ?open=${args.open}
      ?disabled=${args.disabled}
    >
      <h1 slot="title">The Expendables</h1>
      <h3 slot="subtitle">Action, Adventure, Thriller</h3>
      <span
        >Barney Ross leads the "Expendables", a band of highly skilled
        mercenaries including knife enthusiast Lee Christmas, martial arts
        expert Yin Yang, heavy weapons specialist Hale Caesar, demolitionist
        Toll Road and loose-cannon sniper Gunner Jensen.</span
      >
    </igc-expansion-panel>
  `,
};
