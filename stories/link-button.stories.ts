import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { Story } from './story.js';
import '../igniteui-webcomponents.js';

export default {
  title: 'Link Button',
  component: 'igc-link-button',
  argTypes: {
    disabled: { control: 'boolean' },
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'large',
    },
    variant: {
      control: {
        type: 'inline-radio',
        options: ['flat', 'raised', 'outlined', 'fab'],
      },
      defaultValue: 'flat',
    },
    href: { control: 'text' },
    download: { control: 'text' },
    rel: { control: 'text' },
    target: {
      control: {
        type: 'inline-radio',
        options: ['_blank', '_parent', '_self', '_top'],
      },
    },
  },
};

interface ArgTypes {
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
  variant: 'flat' | 'raised' | 'outlined' | 'fab';
  href: string;
  download: string;
  rel: string;
  target: '_blank' | '_parent' | '_self' | '_top';
}

const Template: Story<ArgTypes> = ({
  disabled = false,
  size,
  variant,
  href = 'http://www.infragistics.com',
  download,
  rel,
  target,
}: ArgTypes) => html`
  <igniteui-webcomponents>
    <igc-link-button
      ?disabled=${disabled}
      size=${ifDefined(size)}
      variant=${ifDefined(variant)}
      href=${ifDefined(href)}
      download=${ifDefined(download)}
      rel=${ifDefined(rel)}
      target=${ifDefined(target)}
    >
      Click me
    </igc-link-button>
  </igniteui-webcomponents>
`;

export const Basic = Template.bind({});

export const BlankTarget = Template.bind({});
BlankTarget.args = {
  target: '_blank',
};
