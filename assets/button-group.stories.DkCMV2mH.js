import{x as r}from"./lit-element.Wy23cYDu.js";import{d as m,r as b,c as p,f as d}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";m(d,p);const S={title:"ButtonGroup",component:"igc-button-group",parameters:{docs:{description:{component:"The `igc-button-group` groups a series of `igc-toggle-button`s together, exposing features such as layout and selection."}},actions:{handles:["igcSelect","igcDeselect"]}},argTypes:{disabled:{type:"boolean",description:"Disables all buttons inside the group.",control:"boolean",table:{defaultValue:{summary:!1}}},alignment:{type:'"horizontal" | "vertical"',description:"Sets the orientation of the buttons in the group.",options:["horizontal","vertical"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},selection:{type:'"single" | "single-required" | "multiple"',description:"Controls the mode of selection for the button group.",options:["single","single-required","multiple"],control:{type:"inline-radio"},table:{defaultValue:{summary:"single"}}}},args:{disabled:!1,alignment:"horizontal",selection:"single"}},h=[{name:"bold",url:"https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_bold_24px.svg"},{name:"italic",url:"https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_italic_24px.svg"},{name:"underline",url:"https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_underlined_24px.svg"}];h.forEach(t=>{b(t.name,t.url,"material")});const v=({selection:t,disabled:u,alignment:s})=>r`
    <igc-button-group
      .selection=${t}
      .disabled=${u}
      .alignment=${s}
    >
      <igc-toggle-button value="left">Left</igc-toggle-button>
      <igc-toggle-button value="center">Center</igc-toggle-button>
      <igc-toggle-button value="right">Right</igc-toggle-button>
      <igc-toggle-button value="top">Top</igc-toggle-button>
      <igc-toggle-button value="bottom">Bottom</igc-toggle-button>
    </igc-button-group>
  `,f=()=>r`
    <igc-button-group selection="multiple">
      <igc-toggle-button aria-label="Bold" value="bold">
        <igc-icon name="bold" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Italic" value="italic">
        <igc-icon name="italic" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Underline" value="underline">
        <igc-icon name="underline" collection="material"></igc-icon>
      </igc-toggle-button>
    </igc-button-group>
  `,e=v.bind({}),o=f.bind({});var n,i,l;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`({
  selection,
  disabled,
  alignment
}: IgcButtonGroupArgs) => {
  return html\`
    <igc-button-group
      .selection=\${selection}
      .disabled=\${disabled}
      .alignment=\${alignment}
    >
      <igc-toggle-button value="left">Left</igc-toggle-button>
      <igc-toggle-button value="center">Center</igc-toggle-button>
      <igc-toggle-button value="right">Right</igc-toggle-button>
      <igc-toggle-button value="top">Top</igc-toggle-button>
      <igc-toggle-button value="bottom">Bottom</igc-toggle-button>
    </igc-button-group>
  \`;
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var g,a,c;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`() => {
  return html\`
    <igc-button-group selection="multiple">
      <igc-toggle-button aria-label="Bold" value="bold">
        <igc-icon name="bold" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Italic" value="italic">
        <igc-icon name="italic" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Underline" value="underline">
        <igc-icon name="underline" collection="material"></igc-icon>
      </igc-toggle-button>
    </igc-button-group>
  \`;
}`,...(c=(a=o.parameters)==null?void 0:a.docs)==null?void 0:c.source}}};const T=["Basic","SlottedContent"];export{e as Basic,o as SlottedContent,T as __namedExportsOrder,S as default};
