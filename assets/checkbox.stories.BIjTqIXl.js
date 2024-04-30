import{x as r}from"./lit-element.Wy23cYDu.js";import{d as u,l as g,o as k}from"./defineComponents.DVY7fKDn.js";import{d as p,f as x,a as y}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";u(g);const C={title:"Checkbox",component:"igc-checkbox",parameters:{docs:{description:{component:"A check box allowing single values to be selected/deselected."}},actions:{handles:["igcChange","igcFocus","igcBlur"]}},argTypes:{indeterminate:{type:"boolean",description:"Draws the checkbox in indeterminate state.",control:"boolean",table:{defaultValue:{summary:!1}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},value:{type:"string",description:"The value attribute of the control.",control:"text"},checked:{type:"boolean",description:"The checked state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelPosition:{type:'"before" | "after"',description:"The label position of the control.",options:["before","after"],control:{type:"inline-radio"},table:{defaultValue:{summary:"after"}}}},args:{indeterminate:!1,required:!1,disabled:!1,invalid:!1,checked:!1,labelPosition:"after"}},$=({labelPosition:d,checked:s,indeterminate:b,disabled:m,invalid:h,required:f})=>r`
    <igc-checkbox
      label-position=${k(d)}
      .checked=${s}
      .indeterminate=${b}
      .disabled=${m}
      .required=${f}
      .invalid=${h}
    >
      Label
    </igc-checkbox>
  `,e=$.bind({}),o={argTypes:p(C),render:()=>r`
      <form action="" @submit=${x}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>
        <fieldset>
          <legend>Initial checked state</legend>
          <igc-checkbox name="checkbox-initial" value="initial" checked
            >Checked initial state</igc-checkbox
          >
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
        ${y()}
      </form>
    `};var t,n,i;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`({
  labelPosition,
  checked,
  indeterminate,
  disabled,
  invalid,
  required
}: IgcCheckboxArgs) => {
  return html\`
    <igc-checkbox
      label-position=\${ifDefined(labelPosition)}
      .checked=\${checked}
      .indeterminate=\${indeterminate}
      .disabled=\${disabled}
      .required=\${required}
      .invalid=\${invalid}
    >
      Label
    </igc-checkbox>
  \`;
}`,...(i=(n=e.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var c,a,l;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>
        <fieldset>
          <legend>Initial checked state</legend>
          <igc-checkbox name="checkbox-initial" value="initial" checked
            >Checked initial state</igc-checkbox
          >
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
}`,...(l=(a=o.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};const P=["Basic","Form"];export{e as Basic,o as Form,P as __namedExportsOrder,C as default};
