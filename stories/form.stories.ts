import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { DatePart } from '../src/components/date-time-input/date-util.js';
import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcComboComponent,
  IgcDateTimeInputComponent,
  IgcFormComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcMaskInputComponent,
  IgcRadioGroupComponent,
  IgcSelectComponent,
  IgcSwitchComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(
  IgcFormComponent,
  IgcButtonComponent,
  IgcInputComponent,
  IgcDateTimeInputComponent,
  IgcMaskInputComponent,
  IgcSelectComponent,
  IgcComboComponent,
  IgcCheckboxComponent,
  IgcRadioGroupComponent,
  IgcSwitchComponent,
  IgcIconComponent
);

// region default
const metadata: Meta<IgcFormComponent> = {
  title: 'Form',
  component: 'igc-form',
  parameters: {
    docs: {
      description: {
        component:
          'The form is a component used to collect user input from\ninteractive controls.',
      },
    },
    actions: { handles: ['igcSubmit', 'igcReset'] },
  },
  argTypes: {
    novalidate: {
      type: 'boolean',
      description:
        'Specifies if form data validation should be skipped on submit.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: { novalidate: false },
};

export default metadata;

interface IgcFormArgs {
  /** Specifies if form data validation should be skipped on submit. */
  novalidate: boolean;
}
type Story = StoryObj<IgcFormArgs>;

// endregion

Object.assign(metadata.argTypes!, {
  disabled: {
    type: 'boolean',
    description: 'Disable input fields',
    control: 'boolean',
    defaultValue: false,
  },
  outlined: {
    type: 'boolean',
    description: 'Mark input fields as outlined',
    control: 'boolean',
    defaultValue: false,
  },
});

interface IgcFormArgs {
  disabled: boolean;
  outlined: boolean;
}

const handleIncrement = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input?.stepUp(DatePart.Date);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input?.stepDown();
};

const handleClear = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input?.clear();
};

const Template = ({ novalidate, disabled, outlined }: IgcFormArgs) => {
  const radios = ['Male', 'Female'];
  const minDate = new Date(2020, 2, 3);
  const comboData = [
    { make: 'Volvo', group: 'Swedish cars' },
    { make: 'Saab', group: 'Swedish cars' },
    { make: 'Mercedes', group: 'German cars' },
    { make: 'Audi', group: 'German cars' },
  ];

  return html`
    <igc-form id="form" ?novalidate=${novalidate}>
      <textarea name="textarea" rows="5" cols="30">
The cat was playing<br> in the garden.</textarea
      >
      <br /><br />
      <label for="full-name">Full name:</label>
      <input
        type="text"
        id="full-name"
        name="full-name"
        value="Your name"
      />
      <br /><br />
      <div>
        <label>Gender:</label>
        <igc-radio-group id="gender">
          ${radios.map(
            (v) =>
              html`<igc-radio name="gender" required value=${v}
                >${v}</igc-radio
              >`
          )}
        </igc-radio-group>
      </div>
      <br /><br />
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
      <igc-select
        name="cars-custom"
        label="Favorite car"
        placeholder="Choose a car"
        ?disabled=${disabled}
        ?outlined=${outlined}
        required
      >
        <span slot="helper-text">Sample helper text</span>
        <igc-select-group>
          <igc-select-header slot="label">Swedish Cars</igc-select-header>
          <igc-select-item value="volvo">Volvo</igc-select-item>
          <igc-select-item value="saab">Saab</igc-select-item>
        </igc-select-group>
        <igc-select-group>
          <igc-select-header slot="label">German Cars</igc-select-header>
          <igc-select-item value="mercedes">Mercedes</igc-select-item>
          <igc-select-item value="audi">Audi</igc-select-item>
        </igc-select-group>
      </igc-select>
      <br />
      <igc-combo
        .data=${comboData}
        display-key="make"
        group-key="group"
        name="cars-combo"
        label="Favorite car(s)"
        placeholder="Choose cars"
        ?disabled=${disabled}
        ?outlined=${outlined}
        required
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-combo>
      <br />
      <igc-input
        placeholder="test@example.com"
        name="email-confirm"
        type="email"
        label="Confirm email"
        value="..."
        ?disabled=${disabled}
        ?outlined=${outlined}
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-input>
      <br />
      <igc-mask-input
        name="part-number"
        required
        prompt="#"
        mask="\\C\\C (CC) - #### - [###CC]"
        label="Part number"
        ?disabled=${disabled}
        ?outlined=${outlined}
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-mask-input>
      <br />
      <igc-date-time-input
        label="Select a date"
        placeholder="15/04/1912"
        name="date-time-input"
        value="2020-03-10"
        .minValue="${minDate}"
        max-value="2020-04-02T21:00:00.000Z"
        required
        ?disabled=${disabled}
        ?outlined=${outlined}
      >
        <igc-icon
          name="clear"
          collection="internal"
          slot="prefix"
          @click=${handleClear}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_up"
          slot="suffix"
          collection="internal"
          @click=${handleIncrement}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_down"
          collection="internal"
          slot="suffix"
          @click=${handleDecrement}
        ></igc-icon>
        <span slot="helper-text">Sample helper text</span>
      </igc-date-time-input>
      <br />
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
      <igc-rating name="rating" label="Rating"></igc-rating>
      <igc-checkbox name="checkbox-longform"
        >Check if you think this is a long form</igc-checkbox
      >
      <igc-button type="reset">Reset</igc-button>
      <igc-button type="submit">Submit</igc-button>
    </igc-form>
  </igc-combo></igc-combo
>
  `;
};

export const Basic: Story = Template.bind({});

document.addEventListener('igcSubmit', (event) => {
  const customEvent = event as CustomEvent<FormData>;
  const formData = customEvent.detail;
  console.log('Form data:');
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}, ${pair[1]}`);
  }
  console.log('');
});
