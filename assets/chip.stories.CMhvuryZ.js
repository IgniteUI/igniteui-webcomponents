import{x as c}from"./lit-element.Wy23cYDu.js";import{d as p,m as d,o as m}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";p(d);const C={title:"Chip",component:"igc-chip",parameters:{docs:{description:{component:"Chips help people enter information, make selections, filter content, or trigger actions."}},actions:{handles:["igcRemove","igcSelect"]}},argTypes:{disabled:{type:"boolean",description:"Sets the disabled state for the chip.",control:"boolean",table:{defaultValue:{summary:!1}}},removable:{type:"boolean",description:"Defines if the chip is removable or not.",control:"boolean",table:{defaultValue:{summary:!1}}},selectable:{type:"boolean",description:"Defines if the chip is selectable or not.",control:"boolean",table:{defaultValue:{summary:!1}}},selected:{type:"boolean",description:"Defines if the chip is selected or not.",control:"boolean",table:{defaultValue:{summary:!1}}},variant:{type:'"primary" | "success" | "danger" | "warning" | "info"',description:"A property that sets the color variant of the chip component.",options:["primary","success","danger","warning","info"],control:{type:"select"}}},args:{disabled:!1,removable:!1,selectable:!1,selected:!1}},f=({disabled:o,removable:n,selectable:i,selected:l,variant:r})=>c`
  <igc-chip
    .disabled="${o}"
    .removable=${n}
    .selectable=${i}
    .selected=${l}
    variant=${m(r)}
  >
    <span slot="prefix">😱</span>
    Chip
    <span slot="suffix">👀</span>
  </igc-chip>
`,e=f.bind({});var a,t,s;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`({
  disabled,
  removable,
  selectable,
  selected,
  variant
}: IgcChipArgs) => html\`
  <igc-chip
    .disabled="\${disabled}"
    .removable=\${removable}
    .selectable=\${selectable}
    .selected=\${selected}
    variant=\${ifDefined(variant)}
  >
    <span slot="prefix">😱</span>
    Chip
    <span slot="suffix">👀</span>
  </igc-chip>
\``,...(s=(t=e.parameters)==null?void 0:t.docs)==null?void 0:s.source}}};const D=["Basic"];export{e as Basic,D as __namedExportsOrder,C as default};
