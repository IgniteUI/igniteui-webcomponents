import{x as i}from"./lit-element.Wy23cYDu.js";import{d as k,g as x}from"./defineComponents.CVI5q4ti.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";k(x);const U={title:"Button",component:"igc-button",parameters:{docs:{description:{component:`Represents a clickable button, used to submit forms or anywhere in a
document for accessible, standard button functionality.`}},actions:{handles:["igcFocus","igcBlur"]}},argTypes:{variant:{type:'"flat" | "contained" | "outlined" | "fab"',description:"Sets the variant of the button.",options:["flat","contained","outlined","fab"],control:{type:"select"},table:{defaultValue:{summary:"contained"}}},type:{type:'"button" | "reset" | "submit"',description:"The type of the button. Defaults to `button`.",options:["button","reset","submit"],control:{type:"inline-radio"},table:{defaultValue:{summary:"button"}}},href:{type:"string",description:"The URL the button points to.",control:"text"},download:{type:"string",description:"Prompts to save the linked URL instead of navigating to it.",control:"text"},target:{type:'"_blank" | "_parent" | "_self" | "_top"',description:"Where to display the linked URL, as the name for a browsing context.",options:["_blank","_parent","_self","_top"],control:{type:"select"}},rel:{type:"string",description:`The relationship of the linked URL.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types`,control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{variant:"contained",type:"button",disabled:!1}},a={render:({disabled:t,variant:n,type:e})=>i`
    <igc-button ?disabled=${t} variant=${n} type=${e}>
      Basic button
    </igc-button>
  `},o={render:({disabled:t,variant:n,type:e})=>i`
    <igc-button ?disabled=${t} variant=${n} type=${e}>
      <span slot="prefix">+</span>
      Click me
      <span slot="suffix">-</span>
    </igc-button>
  `},r={args:{href:"https://www.infragistics.com/products/ignite-ui-web-components"},render:({disabled:t,download:n,href:e,rel:d,target:c,variant:l})=>i`<igc-button
      ?disabled=${t}
      download=${n}
      href=${e}
      rel=${d}
      target=${c}
      variant=${l}
    >
      Basic link button
    </igc-button>`},s={args:{href:"https://www.infragistics.com/products/ignite-ui-web-components",target:"_blank"},render:({disabled:t,download:n,href:e,rel:d,target:c,variant:l})=>i`<igc-button
      ?disabled=${t}
      download=${n}
      href=${e}
      rel=${d}
      target=${c}
      variant=${l}
    >
      <span slot="prefix">+</span>
      Open in new tab
      <span slot="suffix">-</span>
    </igc-button>`};var p,u,b;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: ({
    disabled,
    variant,
    type
  }) => html\`
    <igc-button ?disabled=\${disabled} variant=\${variant} type=\${type}>
      Basic button
    </igc-button>
  \`
}`,...(b=(u=a.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var m,g,f;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: ({
    disabled,
    variant,
    type
  }) => html\`
    <igc-button ?disabled=\${disabled} variant=\${variant} type=\${type}>
      <span slot="prefix">+</span>
      Click me
      <span slot="suffix">-</span>
    </igc-button>
  \`
}`,...(f=(g=o.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var h,$,w;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    href: 'https://www.infragistics.com/products/ignite-ui-web-components'
  },
  render: ({
    disabled,
    download,
    href,
    rel,
    target,
    variant
  }) => html\`<igc-button
      ?disabled=\${disabled}
      download=\${download}
      href=\${href}
      rel=\${rel}
      target=\${target}
      variant=\${variant}
    >
      Basic link button
    </igc-button>\`
}`,...(w=($=r.parameters)==null?void 0:$.docs)==null?void 0:w.source}}};var y,v,B;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    href: 'https://www.infragistics.com/products/ignite-ui-web-components',
    target: '_blank'
  },
  render: ({
    disabled,
    download,
    href,
    rel,
    target,
    variant
  }) => html\`<igc-button
      ?disabled=\${disabled}
      download=\${download}
      href=\${href}
      rel=\${rel}
      target=\${target}
      variant=\${variant}
    >
      <span slot="prefix">+</span>
      Open in new tab
      <span slot="suffix">-</span>
    </igc-button>\`
}`,...(B=(v=s.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};const C=["BasicButton","ButtonWithSlots","BasicLinkButton","LinkButtonWithSlots"];export{a as BasicButton,r as BasicLinkButton,o as ButtonWithSlots,s as LinkButtonWithSlots,C as __namedExportsOrder,U as default};
