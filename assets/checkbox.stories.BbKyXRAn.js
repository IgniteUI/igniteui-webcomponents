import{x as l}from"./lit-element.Wy23cYDu.js";import{d as f,l as h,o as u}from"./defineComponents.CVI5q4ti.js";import{d as p,f as g,a as k}from"./story.DvBJWGBA.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";f(h);const x={title:"Checkbox",component:"igc-checkbox",parameters:{docs:{description:{component:"A check box allowing single values to be selected/deselected."}},actions:{handles:["igcChange","igcFocus","igcBlur"]}},argTypes:{indeterminate:{type:"boolean",description:"Draws the checkbox in indeterminate state.",control:"boolean",table:{defaultValue:{summary:!1}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},value:{type:"string",description:"The value attribute of the control.",control:"text"},checked:{type:"boolean",description:"The checked state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelPosition:{type:'"before" | "after"',description:"The label position of the control.",options:["before","after"],control:{type:"inline-radio"},table:{defaultValue:{summary:"after"}}}},args:{indeterminate:!1,required:!1,disabled:!1,invalid:!1,checked:!1,labelPosition:"after"}},y=({labelPosition:s,checked:d,indeterminate:b,disabled:m})=>l`
    <igc-checkbox
      label-position=${u(s)}
      .checked=${d}
      .indeterminate=${b}
      .disabled=${m}
    >
      Label
    </igc-checkbox>
  `,e=y.bind({}),o={argTypes:p(x),render:()=>l`
      <form action="" @submit=${g}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox"
            >Required checkbox</igc-checkbox
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-checkbox name="checkbox-disabled">Checkbox 2</igc-checkbox>
        </fieldset>
        ${k()}
      </form>
    `};var t,n,c;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`({
  labelPosition,
  checked,
  indeterminate,
  disabled
}: IgcCheckboxArgs) => {
  return html\`
    <igc-checkbox
      label-position=\${ifDefined(labelPosition)}
      .checked=\${checked}
      .indeterminate=\${indeterminate}
      .disabled=\${disabled}
    >
      Label
    </igc-checkbox>
  \`;
}`,...(c=(n=e.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var a,i,r;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>
        <fieldset>
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox"
            >Required checkbox</igc-checkbox
          >
        </fieldset>
        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-checkbox name="checkbox-disabled">Checkbox 2</igc-checkbox>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(r=(i=o.parameters)==null?void 0:i.docs)==null?void 0:r.source}}};const V=["Basic","Form"];export{e as Basic,o as Form,V as __namedExportsOrder,x as default};
