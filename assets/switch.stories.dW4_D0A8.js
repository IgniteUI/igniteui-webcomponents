import{x as c}from"./lit-element.Wy23cYDu.js";import{d as f,w as h,o as u}from"./defineComponents.CVI5q4ti.js";import{d as b,f as p,a as g}from"./story.DvBJWGBA.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";f(h);const w={title:"Switch",component:"igc-switch",parameters:{docs:{description:{component:"Similar to a checkbox, a switch controls the state of a single setting on or off."}},actions:{handles:["igcChange","igcFocus","igcBlur"]}},argTypes:{required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},value:{type:"string",description:"The value attribute of the control.",control:"text"},checked:{type:"boolean",description:"The checked state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelPosition:{type:'"before" | "after"',description:"The label position of the control.",options:["before","after"],control:{type:"inline-radio"},table:{defaultValue:{summary:"after"}}}},args:{required:!1,disabled:!1,invalid:!1,checked:!1,labelPosition:"after"}},y=({labelPosition:l,checked:d,disabled:m})=>c`
    <igc-switch
      label-position=${u(l)}
      .checked=${d}
      .disabled=${m}
    >
      Label
    </igc-switch>
  `,e=y.bind({}),t={argTypes:b(w),render:()=>c`
      <form action="" @submit=${p}>
        <fieldset>
          <legend>Default section</legend>
          <igc-switch name="switch">Switch 1</igc-switch>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-switch required name="required-switch"
            >Required switch</igc-switch
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-switch name="switch-disabled">Switch 2</igc-switch>
        </fieldset>
        ${g()}
      </form>
    `};var i,o,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`({
  labelPosition,
  checked,
  disabled
}: IgcSwitchArgs) => {
  return html\`
    <igc-switch
      label-position=\${ifDefined(labelPosition)}
      .checked=\${checked}
      .disabled=\${disabled}
    >
      Label
    </igc-switch>
  \`;
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var s,a,r;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-switch name="switch">Switch 1</igc-switch>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-switch required name="required-switch"
            >Required switch</igc-switch
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-switch name="switch-disabled">Switch 2</igc-switch>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(r=(a=t.parameters)==null?void 0:a.docs)==null?void 0:r.source}}};const v=["Basic","Form"];export{e as Basic,t as Form,v as __namedExportsOrder,w as default};
