import{x as u}from"./lit-element.Wy23cYDu.js";import{d as f,n as g,o as e}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";f(g);const D={title:"CircularProgress",component:"igc-circular-progress",parameters:{docs:{description:{component:`A circular progress indicator used to express unspecified wait time or display
the length of a process.`}}},argTypes:{max:{type:"number",description:"Maximum value of the control.",control:"number",table:{defaultValue:{summary:100}}},value:{type:"number",description:"The value of the control.",control:"number",table:{defaultValue:{summary:0}}},variant:{type:'"primary" | "info" | "success" | "warning" | "danger"',description:"The variant of the control.",options:["primary","info","success","warning","danger"],control:{type:"select"},table:{defaultValue:{summary:"primary"}}},animationDuration:{type:"number",description:"Animation duration in milliseconds.",control:"number",table:{defaultValue:{summary:500}}},indeterminate:{type:"boolean",description:"The indeterminate state of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},hideLabel:{type:"boolean",description:"Shows/hides the label of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},labelFormat:{type:"string",description:`Format string for the default label of the control.
Placeholders:
 {0} - current value of the control.
 {1} - max value of the control.`,control:"text"}},args:{max:100,value:0,variant:"primary",animationDuration:500,indeterminate:!1,hideLabel:!1}},p=({variant:i,hideLabel:n,value:a,max:t,animationDuration:o,indeterminate:l,labelFormat:c})=>u`
  <div style="display: flex; align-items: center; gap: 16px">
    <igc-circular-progress
      ?indeterminate=${l}
      ?hide-label=${n}
      value=${e(a)}
      max=${e(t)}
      animation-duration=${e(o)}
      variant=${e(i)}
      label-format=${e(c)}
    ></igc-circular-progress>
    <igc-circular-progress
      ?indeterminate=${l}
      ?hide-label=${n}
      value=${e(a)}
      max=${e(t)}
      animation-duration=${e(o)}
      variant=${e(i)}
      label-format=${e(c)}
    >
      <igc-circular-gradient slot="gradient" offset="0%" color="#ff9a40">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="50%" color="#1eccd4">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="100%" color="#ff0079">
      </igc-circular-gradient>
      <span>${a}</span>
    </igc-circular-progress>
    <igc-circular-progress
      style="--diameter: 72px; --stroke-thickness: 12px;"
      ?indeterminate=${l}
      ?hide-label=${n}
      value=${e(a)}
      max=${e(t)}
      animation-duration=${e(o)}
      variant=${e(i)}
      label-format=${e(c)}
      ><div>Label</div>
    </igc-circular-progress>
  </div>
`,r=p.bind({});var s,d,m;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`({
  variant,
  hideLabel,
  value,
  max,
  animationDuration,
  indeterminate,
  labelFormat
}: IgcCircularProgressArgs) => html\`
  <div style="display: flex; align-items: center; gap: 16px">
    <igc-circular-progress
      ?indeterminate=\${indeterminate}
      ?hide-label=\${hideLabel}
      value=\${ifDefined(value)}
      max=\${ifDefined(max)}
      animation-duration=\${ifDefined(animationDuration)}
      variant=\${ifDefined(variant)}
      label-format=\${ifDefined(labelFormat)}
    ></igc-circular-progress>
    <igc-circular-progress
      ?indeterminate=\${indeterminate}
      ?hide-label=\${hideLabel}
      value=\${ifDefined(value)}
      max=\${ifDefined(max)}
      animation-duration=\${ifDefined(animationDuration)}
      variant=\${ifDefined(variant)}
      label-format=\${ifDefined(labelFormat)}
    >
      <igc-circular-gradient slot="gradient" offset="0%" color="#ff9a40">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="50%" color="#1eccd4">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="100%" color="#ff0079">
      </igc-circular-gradient>
      <span>\${value}</span>
    </igc-circular-progress>
    <igc-circular-progress
      style="--diameter: 72px; --stroke-thickness: 12px;"
      ?indeterminate=\${indeterminate}
      ?hide-label=\${hideLabel}
      value=\${ifDefined(value)}
      max=\${ifDefined(max)}
      animation-duration=\${ifDefined(animationDuration)}
      variant=\${ifDefined(variant)}
      label-format=\${ifDefined(labelFormat)}
      ><div>Label</div>
    </igc-circular-progress>
  </div>
\``,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};const L=["Basic"];export{r as Basic,L as __namedExportsOrder,D as default};
