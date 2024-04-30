import{x as s}from"./lit-element.Wy23cYDu.js";import{d as c,J as p,o as m}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";c(p);const v={title:"Radio",component:"igc-radio",parameters:{docs:{description:{component:""}},actions:{handles:["igcChange","igcFocus","igcBlur"]}},argTypes:{value:{type:"string",description:"The value attribute of the control.",control:"text"},checked:{type:"boolean",description:"The checked state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelPosition:{type:'"before" | "after"',description:"The label position of the radio control.",options:["before","after"],control:{type:"inline-radio"},table:{defaultValue:{summary:"after"}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{checked:!1,labelPosition:"after",required:!1,disabled:!1,invalid:!1}},b=({labelPosition:i,checked:n,disabled:r,required:l,invalid:d})=>s`
  <igc-radio
    label-position="${m(i)}"
    .disabled="${r}"
    .checked="${n}"
    .required=${l}
    .invalid="${d}"
  >
    Label
  </igc-radio>
`,e=b.bind({});var o,a,t;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`({
  labelPosition,
  checked,
  disabled,
  required,
  invalid
}: IgcRadioArgs) => html\`
  <igc-radio
    label-position="\${ifDefined(labelPosition)}"
    .disabled="\${disabled}"
    .checked="\${checked}"
    .required=\${required}
    .invalid="\${invalid}"
  >
    Label
  </igc-radio>
\``,...(t=(a=e.parameters)==null?void 0:a.docs)==null?void 0:t.source}}};const k=["Basic"];export{e as Basic,k as __namedExportsOrder,v as default};
