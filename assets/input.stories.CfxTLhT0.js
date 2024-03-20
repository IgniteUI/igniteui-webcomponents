import{I as i}from"./socialMedia.DmrXeeV-.js";import{x as m}from"./lit-element.Wy23cYDu.js";import{d as M,i as C,t as S,o as e}from"./defineComponents.CVI5q4ti.js";import{d as O,f as V,a as U}from"./story.DvBJWGBA.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";M(S);C(i.name,i.value);const w={title:"Input",component:"igc-input",parameters:{docs:{description:{component:""}},actions:{handles:["igcInput","igcChange","igcFocus","igcBlur"]}},argTypes:{value:{type:"string | Date",description:"The value of the control.",options:["string","Date"],control:"text"},type:{type:'"email" | "number" | "password" | "search" | "tel" | "text" | "url"',description:"The type attribute of the control.",options:["email","number","password","search","tel","text","url"],control:{type:"select"},table:{defaultValue:{summary:"text"}}},inputmode:{type:'"none" | "txt" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"',description:"The input mode attribute of the control.",options:["none","txt","decimal","numeric","tel","search","email","url"],control:{type:"select"}},pattern:{type:"string",description:"The pattern attribute of the control.",control:"text"},minLength:{type:"number",description:"The minimum string length required by the control.",control:"number"},maxLength:{type:"number",description:"The maximum string length of the control.",control:"number"},min:{type:"number | string",description:"The min attribute of the control.",options:["number","string"],control:"number"},max:{type:"number | string",description:"The max attribute of the control.",options:["number","string"],control:"number"},step:{type:"number",description:"The step attribute of the control.",control:"number"},autofocus:{type:"boolean",description:"The autofocus attribute of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},autocomplete:{type:"string",description:"The autocomplete attribute of the control.",control:"text"},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},outlined:{type:"boolean",description:"Whether the control will have outlined appearance.",control:"boolean",table:{defaultValue:{summary:!1}}},readOnly:{type:"boolean",description:"Makes the control a readonly field.",control:"boolean",table:{defaultValue:{summary:!1}}},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},label:{type:"string",description:"The label for the control.",control:"text"}},args:{type:"text",autofocus:!1,required:!1,disabled:!1,invalid:!1,outlined:!1,readOnly:!1}},F=({type:c,label:s="Sample Label",outlined:d,autofocus:g,autocomplete:b,minLength:h,maxLength:f,step:y,value:x,placeholder:$,readOnly:v,required:T,disabled:D,min:q,max:I,invalid:L})=>m`
  <igc-input
    type=${c}
    label=${s}
    placeholder=${e($)}
    minlength=${e(h)}
    maxlength=${e(f)}
    step=${e(y)}
    autocomplete=${e(b)}
    min=${e(q)}
    max=${e(I)}
    .value=${x??""}
    ?autofocus=${g}
    ?invalid=${L}
    .readOnly=${v}
    .outlined=${d}
    .required=${T}
    .disabled=${D}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-input>
`,n=F.bind({}),t={argTypes:O(w),render:()=>m`<form action="" @submit=${V}>
      <fieldset>
        <igc-input name="input" label="Default" label="Username"></igc-input>
        <igc-input
          name="input-default"
          label="Initial value"
          value="Jane Doe"
        ></igc-input>
      </fieldset>
      <fieldset disabled>
        <igc-input
          name="input-disabled"
          label="Username"
          value="John Doe"
        ></igc-input>
      </fieldset>
      <fieldset>
        <igc-input name="input-required" label="Required" required></igc-input>
        <igc-input
          name="input-minlength"
          label="Minimum length (3 characters)"
          minlength="3"
        ></igc-input>
        <igc-input
          name="input-maximum"
          label="Maximum length (3 characters)"
          maxlength="3"
        ></igc-input>
        <igc-input
          type="number"
          name="input-min"
          label="Minimum number (3)"
          min="3"
        ></igc-input>
        <igc-input
          type="number"
          name="input-max"
          label="Maximum number (17)"
          max="17"
        ></igc-input>
        <igc-input
          name="input-pattern"
          pattern="[0-9]{3}"
          label="Pattern [0-9]{3}"
        ></igc-input>
        <igc-input
          name="input-email"
          type="email"
          label="Email type"
          value="john.doe@example.com"
        ></igc-input>
        <igc-input
          name="input-url"
          type="url"
          label="URL type"
          value="https://igniteui.github.io/igniteui-webcomponents/"
        ></igc-input>
      </fieldset>
      ${U()}
    </form> `};var a,l,o;n.parameters={...n.parameters,docs:{...(a=n.parameters)==null?void 0:a.docs,source:{originalSource:`({
  type,
  label = 'Sample Label',
  outlined,
  autofocus,
  autocomplete,
  minLength,
  maxLength,
  step,
  value,
  placeholder,
  readOnly,
  required,
  disabled,
  min,
  max,
  invalid
}: IgcInputArgs) => html\`
  <igc-input
    type=\${type}
    label=\${label}
    placeholder=\${ifDefined(placeholder)}
    minlength=\${ifDefined(minLength)}
    maxlength=\${ifDefined(maxLength)}
    step=\${ifDefined(step)}
    autocomplete=\${ifDefined(autocomplete)}
    min=\${ifDefined(min)}
    max=\${ifDefined(max)}
    .value=\${value ?? ''}
    ?autofocus=\${autofocus}
    ?invalid=\${invalid}
    .readOnly=\${readOnly}
    .outlined=\${outlined}
    .required=\${required}
    .disabled=\${disabled}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-input>
\``,...(o=(l=n.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};var r,u,p;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`<form action="" @submit=\${formSubmitHandler}>
      <fieldset>
        <igc-input name="input" label="Default" label="Username"></igc-input>
        <igc-input
          name="input-default"
          label="Initial value"
          value="Jane Doe"
        ></igc-input>
      </fieldset>
      <fieldset disabled>
        <igc-input
          name="input-disabled"
          label="Username"
          value="John Doe"
        ></igc-input>
      </fieldset>
      <fieldset>
        <igc-input name="input-required" label="Required" required></igc-input>
        <igc-input
          name="input-minlength"
          label="Minimum length (3 characters)"
          minlength="3"
        ></igc-input>
        <igc-input
          name="input-maximum"
          label="Maximum length (3 characters)"
          maxlength="3"
        ></igc-input>
        <igc-input
          type="number"
          name="input-min"
          label="Minimum number (3)"
          min="3"
        ></igc-input>
        <igc-input
          type="number"
          name="input-max"
          label="Maximum number (17)"
          max="17"
        ></igc-input>
        <igc-input
          name="input-pattern"
          pattern="[0-9]{3}"
          label="Pattern [0-9]{3}"
        ></igc-input>
        <igc-input
          name="input-email"
          type="email"
          label="Email type"
          value="john.doe@example.com"
        ></igc-input>
        <igc-input
          name="input-url"
          type="url"
          label="URL type"
          value="https://igniteui.github.io/igniteui-webcomponents/"
        ></igc-input>
      </fieldset>
      \${formControls()}
    </form> \`;
  }
}`,...(p=(u=t.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};const _=["Basic","Form"];export{n as Basic,t as Form,_ as __namedExportsOrder,w as default};
