import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
// import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Form',
  component: 'igc-form',
  argTypes: {
    novalidate: {
      type: 'boolean',
      description:
        'Specifies if the form should not to be validated on submit.',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  novalidate: boolean;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcSubmit', 'igcReset'],
  },
};

const Template: Story<ArgTypes, Context> = ({
  novalidate = false,
}: ArgTypes) => {
  const radios = ['Male', 'Female'];
  return html`
    <igc-form id="form" ?novalidate=${novalidate}>
      <textarea name="textarea" rows="5" cols="30">
The cat was playing<br> in the garden.</textarea
      >
      <br /><br />
      <label for="full-name">Full name:</label>
      <input type="text" id="full-name" name="full-name" value="Your name" />
      <div>
        <label>Gender:</label>
        <igc-radio-group id="gender">
          ${radios.map(
            (v) => html`<igc-radio name="gender" value=${v}>${v}</igc-radio> `
          )}
        </igc-radio-group>
      </div>
      <label for="cars-multiple">Choose multiple cars:</label>
      <select name="cars-multiple" id="cars-multiple" multiple>
        <option value="volvo" selected>Volvo</option>
        <option value="saab">Saab</option>
        <option value="mercedes" selected>Mercedes</option>
        <option value="audi">Audi</option>
      </select>
      <br /><br />
      <label for="cars">Choose one car:</label>
      <select name="cars" id="cars">
        <optgroup label="Swedish Cars">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
        </optgroup>
        <optgroup label="German Cars">
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </optgroup>
      </select>
      <br /><br />
      <label for="browser">Choose your browser from the list:</label>
      <input list="browsers" name="browser" id="browser" />
      <datalist id="browsers">
        <option value="Chrome"></option>
        <option value="Firefox"></option>
        <option value="Edge"></option>
        <option value="Opera"></option>
        <option value="Safari"></option>
      </datalist>
      <br /><br />
      <div>
        Preferred soical media handle:
        <input
          type="checkbox"
          id="checkbox-linkedin"
          name="checkbox-linkedin"
        />
        <label for="checkbox-linkedin">LinkedIn</label>
        <input
          type="checkbox"
          id="checkbox-instagram"
          name="checkbox-instagram"
        />
        <label for="checkbox-instagram">Instagram</label>
        <input
          type="checkbox"
          id="checkbox-facebook"
          name="checkbox-facebook"
        />
        <label for="checkbox-facebook">Facebook</label>
      </div>
      <br />
      <div>
        <igc-switch name="subscribe" value="igc-switch"
          >Subscribe to newsletter</igc-switch
        >
      </div>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" /><br /><br />
      <igc-button type="reset">Reset</igc-button>
      <igc-button type="submit">Submit</igc-button>
    </igc-form>
  `;
};

export const Basic = Template.bind({});

document.addEventListener('igcSubmit', function (event) {
  const customEvent = event as CustomEvent<FormData>;
  const formData = customEvent.detail;
  console.log('Form data:');
  for (const pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }
  console.log('');
});
