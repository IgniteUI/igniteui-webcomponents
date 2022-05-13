import { html } from 'lit';
import { Story } from './story';

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
      type: '"start" | "end"',
      description: 'The indicator alignment of the expansion panel.',
      options: ['start', 'end'],
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
  indicatorPosition: 'start' | 'end';
}
// endregion
interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const handleOpening = (ev: any) => {
  console.log(ev);
};

const handleOpened = (ev: any) => {
  console.log(ev);
};

const handleClosing = (ev: any) => {
  console.log(ev);
};
const handleClosed = (ev: any) => {
  console.log(ev);
};

const Template: Story<ArgTypes, Context> = (
  { open = false, disabled = false, indicatorPosition = 'start' }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-expansion-panel
      indicator-alignment="${indicatorPosition}"
      .open="${open}"
      .disabled="${disabled}"
      .dir="${direction}"
      @igcOpening=${handleOpening}
      @igcOpened=${handleOpened}
      @igcClosing=${handleClosing}
      @igcClosed=${handleClosed}
    >
      <div slot="title">The Expendables</div>
      <div slot="subTitle">Action, Adventure, Thriller</div>
      <div>
        Barney Ross leads the "Expendables", a band of highly skilled
        mercenaries including knife enthusiast Lee Christmas, martial arts
        expert Yin Yang, heavy weapons specialist Hale Caesar, demolitionist
        Toll Road and loose-cannon sniper Gunner Jensen.
      </div>
    </igc-expansion-panel>
  `;
};

export const Basic = Template.bind({});
