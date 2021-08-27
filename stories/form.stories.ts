import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
// import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Form',
  component: 'igc-form',
  parameters: {
    actions: {
      handles: ['igcSubmit', 'igcReset'],
    },
  },
  argTypes: {
    novalidate: {
      control: 'boolean',
      description: 'Sets wether the validating of the form should be omitted.',
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
  novalidate: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = ({
  novalidate = false,
}: ArgTypes) => {
  const radios = ['I agree', "I don't agree"];
  return html`
    <igc-form id="form" ?novalidate=${novalidate}>
      <textarea name="textarea" rows="10" cols="30">
The cat was playing<br> in the garden.</textarea
      >
      <div>
        <igc-radio-group>
          ${radios.map(
            (v) =>
              html`<igc-radio name="agreement" value=${v}>${v}</igc-radio> `
          )}
        </igc-radio-group>
      </div>
      <div>
        <select name="cars" id="cars">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
      </div>
      <label for="fname">First name:</label><br />
      <input
        type="text"
        id="fname"
        name="fname"
        value="Your name"
      /><br /><br />
      <input
        type="checkbox"
        id="checkbox"
        name="checkbox"
        checked
      /><br /><br />
      <div>
        <igc-switch name="subscribe" value="igc-switch">Subscribe</igc-switch>
      </div>
      <igc-button type="reset">Reset</igc-button>
      <igc-button type="submit">Submit</igc-button>
    </igc-form>
  `;
};

export const Basic = Template.bind({});

document.addEventListener('igcSubmit', function (event) {
  const customEvent = event as CustomEvent<FormData>;
  const formData = customEvent.detail;
  console.log('form data:');
  for (const pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }
});
