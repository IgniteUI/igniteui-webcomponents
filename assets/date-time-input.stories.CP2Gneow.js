import{x as u}from"./lit-element.Wy23cYDu.js";import{d as M,r as i,q as k,o as n}from"./defineComponents.DVY7fKDn.js";import{d as _,f as H,a as I}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";M(k);const C={title:"DateTimeInput",component:"igc-date-time-input",parameters:{docs:{description:{component:`A date time input is an input field that lets you set and edit the date and time in a chosen input element
using customizable display and input formats.`}},actions:{handles:["igcInput","igcChange","igcFocus","igcBlur"]}},argTypes:{inputFormat:{type:"string",description:"The date format to apply on the input.",control:"text"},value:{type:"string | Date",description:"The value of the input.",options:["string","Date"],control:"text"},min:{type:"Date",description:"The minimum value required for the input to remain valid.",control:"date"},max:{type:"Date",description:"The maximum value required for the input to remain valid.",control:"date"},displayFormat:{type:"string",description:`Format to display the value in when not editing.
Defaults to the input format if not set.`,control:"text"},spinLoop:{type:"boolean",description:"Sets whether to loop over the currently spun segment.",control:"boolean",table:{defaultValue:{summary:!0}}},locale:{type:"string",description:"The locale settings used to display the value.",control:"text",table:{defaultValue:{summary:"en"}}},prompt:{type:"string",description:"The prompt symbol to use for unfilled parts of the mask.",control:"text"},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},outlined:{type:"boolean",description:"Whether the control will have outlined appearance.",control:"boolean",table:{defaultValue:{summary:!1}}},readOnly:{type:"boolean",description:"Makes the control a readonly field.",control:"boolean",table:{defaultValue:{summary:!1}}},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},label:{type:"string",description:"The label for the control.",control:"text"}},args:{spinLoop:!0,locale:"en",required:!1,disabled:!1,invalid:!1,outlined:!1,readOnly:!1}};i("clear","https://unpkg.com/material-design-icons@3.0.1/content/svg/production/ic_clear_24px.svg");i("up","https://unpkg.com/material-design-icons@3.0.1/navigation/svg/production/ic_arrow_drop_up_24px.svg");i("down","https://unpkg.com/material-design-icons@3.0.1/navigation/svg/production/ic_arrow_drop_down_24px.svg");const O=({inputFormat:f,prompt:g,readOnly:y,disabled:b,required:h,outlined:v,placeholder:x,displayFormat:$,min:a,max:o,locale:D,spinLoop:T,value:l,label:w,invalid:q})=>{const F={date:2,year:10};return u`<igc-date-time-input
    id="editor"
    label=${w}
    .value=${l?new Date(l):null}
    .inputFormat=${f}
    .displayFormat=${$}
    .min=${a?new Date(a):null}
    .max=${o?new Date(o):null}
    locale=${n(D)}
    prompt=${n(g)}
    placeholder=${n(x)}
    ?spin-loop=${T}
    .readOnly=${y}
    .outlined=${v}
    .required=${h}
    .disabled=${b}
    .spinDelta=${F}
    .invalid=${q}
  >
    <igc-icon name="clear" slot="prefix" onclick="editor.clear()"></igc-icon>
    <igc-icon name="up" slot="suffix" onclick="editor.stepUp()"></igc-icon>
    <igc-icon name="down" slot="suffix" onclick="editor.stepDown()"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-time-input>`},e=O.bind({}),t={argTypes:_(C),render:()=>u`
      <form action="" @submit=${H}>
        <fieldset>
          <igc-date-time-input
            label="Default state"
            name="datetime-default"
          ></igc-date-time-input>
          <igc-date-time-input
            label="Initial value"
            name="datetime-initial"
            value="2023-03-17T15:35"
            display-format="yyyy-MM-dd HH:mm"
            input-format="yyyy-MM-dd HH:mm"
          ></igc-date-time-input>
          <igc-date-time-input
            readonly
            label="Readonly"
            name="datetime-readonly"
            value="1987-07-17"
          ></igc-date-time-input>
        </fieldset>
        <fieldset disabled="disabled">
          <igc-date-time-input
            name="datetime-disabled"
            label="Disabled editor"
          ></igc-date-time-input>
        </fieldset>
        <fieldset>
          <igc-date-time-input
            required
            name="datetime-required"
            label="Required"
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-min"
            label="Minimum constraint (2023-03-17)"
            min="2023-03-17"
            value="2020-01-01"
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-max"
            label="Maximum constraint (2023-04-17)"
            max="2023-04-17"
            value="2024-03-17"
          ></igc-date-time-input>
        </fieldset>
        ${I()}
      </form>
    `};var r,d,s;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`({
  inputFormat,
  prompt,
  readOnly,
  disabled,
  required,
  outlined,
  placeholder,
  displayFormat,
  min,
  max,
  locale,
  spinLoop,
  value,
  label,
  invalid
}: IgcDateTimeInputArgs) => {
  const spinDelta: DatePartDeltas = {
    date: 2,
    year: 10
  };
  return html\`<igc-date-time-input
    id="editor"
    label=\${label}
    .value=\${value ? new Date((value as Date)) : null}
    .inputFormat=\${inputFormat}
    .displayFormat=\${displayFormat}
    .min=\${min ? new Date((min as Date)) : null}
    .max=\${max ? new Date((max as Date)) : null}
    locale=\${ifDefined(locale)}
    prompt=\${ifDefined(prompt)}
    placeholder=\${ifDefined(placeholder)}
    ?spin-loop=\${spinLoop}
    .readOnly=\${readOnly}
    .outlined=\${outlined}
    .required=\${required}
    .disabled=\${disabled}
    .spinDelta=\${spinDelta}
    .invalid=\${invalid}
  >
    <igc-icon name="clear" slot="prefix" onclick="editor.clear()"></igc-icon>
    <igc-icon name="up" slot="suffix" onclick="editor.stepUp()"></igc-icon>
    <igc-icon name="down" slot="suffix" onclick="editor.stepDown()"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-time-input>\`;
}`,...(s=(d=e.parameters)==null?void 0:d.docs)==null?void 0:s.source}}};var m,p,c;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <igc-date-time-input
            label="Default state"
            name="datetime-default"
          ></igc-date-time-input>
          <igc-date-time-input
            label="Initial value"
            name="datetime-initial"
            value="2023-03-17T15:35"
            display-format="yyyy-MM-dd HH:mm"
            input-format="yyyy-MM-dd HH:mm"
          ></igc-date-time-input>
          <igc-date-time-input
            readonly
            label="Readonly"
            name="datetime-readonly"
            value="1987-07-17"
          ></igc-date-time-input>
        </fieldset>
        <fieldset disabled="disabled">
          <igc-date-time-input
            name="datetime-disabled"
            label="Disabled editor"
          ></igc-date-time-input>
        </fieldset>
        <fieldset>
          <igc-date-time-input
            required
            name="datetime-required"
            label="Required"
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-min"
            label="Minimum constraint (2023-03-17)"
            min="2023-03-17"
            value="2020-01-01"
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-max"
            label="Maximum constraint (2023-04-17)"
            max="2023-04-17"
            value="2024-03-17"
          ></igc-date-time-input>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(c=(p=t.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const z=["Basic","Form"];export{e as Basic,t as Form,z as __namedExportsOrder,C as default};
