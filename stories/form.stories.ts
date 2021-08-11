import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
// import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Form',
  component: 'igc-form',
  argTypes: {
    outlined: {
      control: 'boolean',
      description: 'Determines whether the form is outlined.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
};

interface ArgTypes {
  outlined: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = ({ outlined = false }: ArgTypes) => {
  const radios = ['I agree', "I don't agree"];
  return html`
    <igc-form ?outlined=${outlined}>
      <igc-radio-group>
        ${radios.map(
          (v) => html`<igc-radio name="aggreement" value=${v}>${v}</igc-radio> `
        )}
      </igc-radio-group>
      <igc-button type="submit">Submit</igc-button>
    </igc-form>
  `;
};

export const Basic = Template.bind({});

// const form = document.querySelector('.form');
// form?.addEventListener('igc-submit', event => {
//   console.log('SUBMIT');
// });
