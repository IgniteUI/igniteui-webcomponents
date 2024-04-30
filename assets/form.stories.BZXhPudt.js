import{x as l}from"./lit-element.Wy23cYDu.js";import{d,c as u,w as b,x as g,l as h,p as v,y as f,z as k,q as x,t as C,g as w,A as S,B as $}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";d(S,w,C,x,k,f,v,h,g,b,u);const y={title:"Form",component:"igc-form",parameters:{docs:{description:{component:`The form is a component used to collect user input from
interactive controls.`}},actions:{handles:["igcSubmit","igcReset"]}},argTypes:{novalidate:{type:"boolean",description:"Specifies if form data validation should be skipped on submit.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{novalidate:!1}};Object.assign(y.argTypes,{disabled:{type:"boolean",description:"Disable input fields",control:"boolean",defaultValue:!1},outlined:{type:"boolean",description:"Mark input fields as outlined",control:"boolean",defaultValue:!1}});const I=()=>{const e=document.querySelector("igc-date-time-input");e==null||e.stepUp($.Date)},D=()=>{const e=document.querySelector("igc-date-time-input");e==null||e.stepDown()},F=()=>{const e=document.querySelector("igc-date-time-input");e==null||e.clear()},q=({novalidate:e,disabled:a,outlined:n})=>{const o=["Male","Female"],p=new Date(2020,2,3),m=[{make:"Volvo",group:"Swedish cars"},{make:"Saab",group:"Swedish cars"},{make:"Mercedes",group:"German cars"},{make:"Audi",group:"German cars"}];return l`
    <igc-form id="form" ?novalidate=${e}>
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
          ${o.map(i=>l`<igc-radio name="gender" required value=${i}
                >${i}</igc-radio
              >`)}
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
        ?disabled=${a}
        ?outlined=${n}
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
        .data=${m}
        display-key="make"
        group-key="group"
        name="cars-combo"
        label="Favorite car(s)"
        placeholder="Choose cars"
        ?disabled=${a}
        ?outlined=${n}
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
        ?disabled=${a}
        ?outlined=${n}
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
        ?disabled=${a}
        ?outlined=${n}
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-mask-input>
      <br />
      <igc-date-time-input
        label="Select a date"
        placeholder="15/04/1912"
        name="date-time-input"
        value="2020-03-10"
        .minValue="${p}"
        max-value="2020-04-02T21:00:00.000Z"
        required
        ?disabled=${a}
        ?outlined=${n}
      >
        <igc-icon
          name="clear"
          collection="internal"
          slot="prefix"
          @click=${F}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_up"
          slot="suffix"
          collection="internal"
          @click=${I}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_down"
          collection="internal"
          slot="suffix"
          @click=${D}
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
  `},t=q.bind({});document.addEventListener("igcSubmit",e=>{const n=e.detail;console.log("Form data:");for(const o of n.entries())console.log(`${o[0]}, ${o[1]}`);console.log("")});var c,r,s;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`({
  novalidate,
  disabled,
  outlined
}: IgcFormArgs) => {
  const radios = ['Male', 'Female'];
  const minDate = new Date(2020, 2, 3);
  const comboData = [{
    make: 'Volvo',
    group: 'Swedish cars'
  }, {
    make: 'Saab',
    group: 'Swedish cars'
  }, {
    make: 'Mercedes',
    group: 'German cars'
  }, {
    make: 'Audi',
    group: 'German cars'
  }];
  return html\`
    <igc-form id="form" ?novalidate=\${novalidate}>
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
          \${radios.map(v => html\`<igc-radio name="gender" required value=\${v}
                >\${v}</igc-radio
              >\`)}
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
        ?disabled=\${disabled}
        ?outlined=\${outlined}
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
        .data=\${comboData}
        display-key="make"
        group-key="group"
        name="cars-combo"
        label="Favorite car(s)"
        placeholder="Choose cars"
        ?disabled=\${disabled}
        ?outlined=\${outlined}
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
        ?disabled=\${disabled}
        ?outlined=\${outlined}
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-input>
      <br />
      <igc-mask-input
        name="part-number"
        required
        prompt="#"
        mask="\\\\C\\\\C (CC) - #### - [###CC]"
        label="Part number"
        ?disabled=\${disabled}
        ?outlined=\${outlined}
      >
        <span slot="helper-text">Sample helper text</span>
      </igc-mask-input>
      <br />
      <igc-date-time-input
        label="Select a date"
        placeholder="15/04/1912"
        name="date-time-input"
        value="2020-03-10"
        .minValue="\${minDate}"
        max-value="2020-04-02T21:00:00.000Z"
        required
        ?disabled=\${disabled}
        ?outlined=\${outlined}
      >
        <igc-icon
          name="clear"
          collection="internal"
          slot="prefix"
          @click=\${handleClear}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_up"
          slot="suffix"
          collection="internal"
          @click=\${handleIncrement}
        ></igc-icon>
        <igc-icon
          name="arrow_drop_down"
          collection="internal"
          slot="suffix"
          @click=\${handleDecrement}
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
  \`;
}`,...(s=(r=t.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};const E=["Basic"];export{t as Basic,E as __namedExportsOrder,y as default};
