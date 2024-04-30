import{x as s}from"./lit-element.Wy23cYDu.js";import{d as k,r as x,c as _,g as S}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";k(S,_);const I={title:"Button",component:"igc-button",parameters:{docs:{description:{component:`Represents a clickable button, used to submit forms or anywhere in a
document for accessible, standard button functionality.`}},actions:{handles:["igcFocus","igcBlur"]}},argTypes:{variant:{type:'"flat" | "contained" | "outlined" | "fab"',description:"Sets the variant of the button.",options:["flat","contained","outlined","fab"],control:{type:"select"},table:{defaultValue:{summary:"contained"}}},type:{type:'"button" | "reset" | "submit"',description:"The type of the button. Defaults to `button`.",options:["button","reset","submit"],control:{type:"inline-radio"},table:{defaultValue:{summary:"button"}}},href:{type:"string",description:"The URL the button points to.",control:"text"},download:{type:"string",description:"Prompts to save the linked URL instead of navigating to it.",control:"text"},target:{type:'"_blank" | "_parent" | "_self" | "_top"',description:"Where to display the linked URL, as the name for a browsing context.",options:["_blank","_parent","_self","_top"],control:{type:"select"}},rel:{type:"string",description:`The relationship of the linked URL.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types`,control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{variant:"contained",type:"button",disabled:!1}};x("home","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg");const o={render:({disabled:t,variant:n,type:e})=>s`
    <igc-button ?disabled=${t} variant=${n} type=${e}>
      Basic button
    </igc-button>
  `},a={render:({disabled:t,variant:n,type:e})=>s`
    <igc-button ?disabled=${t} variant=${n} type=${e}>
      <span slot="prefix">+</span>
      Click me
      <span slot="suffix">-</span>
    </igc-button>
  `},i={args:{href:"https://www.infragistics.com/products/ignite-ui-web-components"},render:({disabled:t,download:n,href:e,rel:c,target:d,variant:l})=>s`<igc-button
      ?disabled=${t}
      download=${n}
      href=${e}
      rel=${c}
      target=${d}
      variant=${l}
    >
      Basic link button
    </igc-button>`},r={args:{href:"https://www.infragistics.com/products/ignite-ui-web-components",target:"_blank"},render:({disabled:t,download:n,href:e,rel:c,target:d,variant:l})=>s`<igc-button
      ?disabled=${t}
      download=${n}
      href=${e}
      rel=${c}
      target=${d}
      variant=${l}
    >
      <igc-icon name="home" slot="prefix"></igc-icon>
      Open in new tab
      <igc-icon name="home" slot="suffix"></igc-icon>
    </igc-button>`};var p,u,b;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: ({
    disabled,
    variant,
    type
  }) => html\`
    <igc-button ?disabled=\${disabled} variant=\${variant} type=\${type}>
      Basic button
    </igc-button>
  \`
}`,...(b=(u=o.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var m,g,f;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(f=(g=a.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var h,$,w;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=($=i.parameters)==null?void 0:$.docs)==null?void 0:w.source}}};var y,v,B;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
      <igc-icon name="home" slot="prefix"></igc-icon>
      Open in new tab
      <igc-icon name="home" slot="suffix"></igc-icon>
    </igc-button>\`
}`,...(B=(v=r.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};const O=["BasicButton","ButtonWithSlots","BasicLinkButton","LinkButtonWithSlots"];export{o as BasicButton,i as BasicLinkButton,a as ButtonWithSlots,r as LinkButtonWithSlots,O as __namedExportsOrder,I as default};
