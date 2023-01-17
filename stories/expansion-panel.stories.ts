import { html } from 'lit';
import { IgcExpansionPanelComponent } from '../src/index.js';
import type { Story } from './story';

IgcExpansionPanelComponent.register();

// region default
const metadata = {
  title: 'Expansion Panel',
  component: 'igc-expansion-panel',
  argTypes: {
    open: {
      type: 'boolean',
      description:
        'Indicates whether the contents of the control should be visible.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description:
        'Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.',
      control: 'boolean',
      defaultValue: false,
    },
    indicatorPosition: {
      type: '"start" | "end" | "none"',
      description: 'The indicator position of the expansion panel.',
      options: ['start', 'end', 'none'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'start',
    },
  },
};
export default metadata;
interface ArgTypes {
  open: boolean;
  disabled: boolean;
  indicatorPosition: 'start' | 'end' | 'none';
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
  },
};

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { open = false, disabled = false, indicatorPosition = 'start' }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-expansion-panel
      indicator-position="${indicatorPosition}"
      .open="${open}"
      .disabled="${disabled}"
      .dir="${direction}"
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
  `;
};

export const Basic = Template.bind({});
