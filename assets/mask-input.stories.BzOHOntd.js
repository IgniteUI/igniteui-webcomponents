import{I as a}from"./socialMedia.DmrXeeV-.js";import{x as m}from"./lit-element.Wy23cYDu.js";import{d as D,i as C,c as x,z as q,o as e}from"./defineComponents.DVY7fKDn.js";import{d as w,f as T,a as F}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";D(q,x);C(a.name,a.value);const M={title:"MaskInput",component:"igc-mask-input",parameters:{docs:{description:{component:`A masked input is an input field where a developer can control user input and format the visible value,
based on configurable rules`}},actions:{handles:["igcInput","igcChange","igcFocus","igcBlur"]}},argTypes:{valueMode:{type:'"raw" | "withFormatting"',description:"Dictates the behavior when retrieving the value of the control:\n\n- `raw` will return the clean user input.\n- `withFormatting` will return the value with all literals and prompts.",options:["raw","withFormatting"],control:{type:"inline-radio"},table:{defaultValue:{summary:"raw"}}},value:{type:"string | Date",description:"The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value will return an empty string.",options:["string","Date"],control:"text"},mask:{type:"string",description:"The mask pattern to apply on the input.",control:"text"},prompt:{type:"string",description:"The prompt symbol to use for unfilled parts of the mask.",control:"text"},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},outlined:{type:"boolean",description:"Whether the control will have outlined appearance.",control:"boolean",table:{defaultValue:{summary:!1}}},readOnly:{type:"boolean",description:"Makes the control a readonly field.",control:"boolean",table:{defaultValue:{summary:!1}}},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},label:{type:"string",description:"The label for the control.",control:"text"}},args:{valueMode:"raw",required:!1,disabled:!1,invalid:!1,outlined:!1,readOnly:!1}},I=({name:u,readOnly:p,disabled:c,required:f,outlined:g,valueMode:b,label:k,value:h,placeholder:v,mask:y,prompt:$})=>m`<igc-mask-input
    name=${e(u)}
    placeholder=${e(v)}
    value=${e(h)}
    mask=${e(y)}
    prompt=${e($)}
    label=${e(k)}
    value-mode=${e(b)}
    ?readonly=${e(p)}
    ?outlined=${e(g)}
    ?required=${e(f)}
    ?disabled=${e(c)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-mask-input>`,n=I.bind({}),t={argTypes:w(M),render:()=>m`<form action="" @submit=${T}>
      <fieldset>
        <legend>Default masked input</legend>
        <igc-mask-input
          name="mask"
          value="XYZ"
          label="Default"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Formatted value mode</legend>
        <igc-mask-input
          required
          label="Formatted value mode"
          name="mask-formatted-value"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>
      </fieldset>
      <fieldset disabled>
        <legend>Disabled masked input</legend>
        <igc-mask-input
          name="mask-disabled"
          label="Disabled mask"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Masked constraints</legend>
        <igc-mask-input
          name="mask-required"
          label="Required"
          required
        ></igc-mask-input>
        <igc-mask-input
          name="required-mask-pattern"
          label="Mask pattern validation"
          mask="(+35\\9) 000-000-000"
        ></igc-mask-input>
      </fieldset>
      ${F()}
    </form>`};var i,l,o;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`({
  name,
  readOnly,
  disabled,
  required,
  outlined,
  valueMode,
  label,
  value,
  placeholder,
  mask,
  prompt
}: IgcMaskInputArgs) => {
  return html\`<igc-mask-input
    name=\${ifDefined(name)}
    placeholder=\${ifDefined(placeholder)}
    value=\${ifDefined(value)}
    mask=\${ifDefined(mask)}
    prompt=\${ifDefined(prompt)}
    label=\${ifDefined(label)}
    value-mode=\${ifDefined(valueMode)}
    ?readonly=\${ifDefined(readOnly)}
    ?outlined=\${ifDefined(outlined)}
    ?required=\${ifDefined(required)}
    ?disabled=\${ifDefined(disabled)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-mask-input>\`;
}`,...(o=(l=n.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};var r,s,d;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`<form action="" @submit=\${formSubmitHandler}>
      <fieldset>
        <legend>Default masked input</legend>
        <igc-mask-input
          name="mask"
          value="XYZ"
          label="Default"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Formatted value mode</legend>
        <igc-mask-input
          required
          label="Formatted value mode"
          name="mask-formatted-value"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>
      </fieldset>
      <fieldset disabled>
        <legend>Disabled masked input</legend>
        <igc-mask-input
          name="mask-disabled"
          label="Disabled mask"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Masked constraints</legend>
        <igc-mask-input
          name="mask-required"
          label="Required"
          required
        ></igc-mask-input>
        <igc-mask-input
          name="required-mask-pattern"
          label="Mask pattern validation"
          mask="(+35\\\\9) 000-000-000"
        ></igc-mask-input>
      </fieldset>
      \${formControls()}
    </form>\`;
  }
}`,...(d=(s=t.parameters)==null?void 0:s.docs)==null?void 0:d.source}}};const Y=["Basic","Form"];export{n as Basic,t as Form,Y as __namedExportsOrder,M as default};
