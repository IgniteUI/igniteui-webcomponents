import{x as f}from"./lit-element.Wy23cYDu.js";import{d as b,E as g,o as e}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";b(g);const A={title:"LinearProgress",component:"igc-linear-progress",parameters:{docs:{description:{component:`A linear progress indicator used to express unspecified wait time or display
the length of a process.`}}},argTypes:{striped:{type:"boolean",description:"Sets the striped look of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelAlign:{type:'"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"',description:"The position for the default label of the control.",options:["top-start","top","top-end","bottom-start","bottom","bottom-end"],control:{type:"select"},table:{defaultValue:{summary:"top-start"}}},max:{type:"number",description:"Maximum value of the control.",control:"number",table:{defaultValue:{summary:100}}},value:{type:"number",description:"The value of the control.",control:"number",table:{defaultValue:{summary:0}}},variant:{type:'"primary" | "info" | "success" | "warning" | "danger"',description:"The variant of the control.",options:["primary","info","success","warning","danger"],control:{type:"select"},table:{defaultValue:{summary:"primary"}}},animationDuration:{type:"number",description:"Animation duration in milliseconds.",control:"number",table:{defaultValue:{summary:500}}},indeterminate:{type:"boolean",description:"The indeterminate state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},hideLabel:{type:"boolean",description:"Shows/hides the label of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelFormat:{type:"string",description:`Format string for the default label of the control.
Placeholders:
 {0} - current value of the control.
 {1} - max value of the control.`,control:"text"}},args:{striped:!1,labelAlign:"top-start",max:100,value:0,variant:"primary",animationDuration:500,indeterminate:!1,hideLabel:!1}},y=({striped:r,variant:i,hideLabel:l,value:s,max:m,animationDuration:d,indeterminate:p,labelAlign:c,labelFormat:u})=>f`
  <div
    style="display: flex; flex-direction: column; justify-content: center; gap: 16px"
  >
    <igc-linear-progress
      ?striped=${r}
      ?indeterminate=${p}
      ?hide-label=${l}
      value=${e(s)}
      max=${e(m)}
      animation-duration=${e(d)}
      variant=${e(i)}
      label-align=${c}
      label-format=${e(u)}
    >
    </igc-linear-progress>
  </div>
`,t=y.bind({});var a,n,o;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`({
  striped,
  variant,
  hideLabel,
  value,
  max,
  animationDuration,
  indeterminate,
  labelAlign,
  labelFormat
}: IgcLinearProgressArgs) => html\`
  <div
    style="display: flex; flex-direction: column; justify-content: center; gap: 16px"
  >
    <igc-linear-progress
      ?striped=\${striped}
      ?indeterminate=\${indeterminate}
      ?hide-label=\${hideLabel}
      value=\${ifDefined(value)}
      max=\${ifDefined(max)}
      animation-duration=\${ifDefined(animationDuration)}
      variant=\${ifDefined(variant)}
      label-align=\${labelAlign}
      label-format=\${ifDefined(labelFormat)}
    >
    </igc-linear-progress>
  </div>
\``,...(o=(n=t.parameters)==null?void 0:n.docs)==null?void 0:o.source}}};const L=["Basic"];export{t as Basic,L as __namedExportsOrder,A as default};
