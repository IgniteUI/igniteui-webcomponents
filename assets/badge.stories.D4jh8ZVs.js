import{x as o}from"./lit-element.Wy23cYDu.js";import{d as m,r as u,b as l,c as b,e as h}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";m(h,b,l);const I={title:"Badge",component:"igc-badge",parameters:{docs:{description:{component:`The badge is a component indicating a status on a related item or an area
where some active indication is required.`}}},argTypes:{variant:{type:'"primary" | "info" | "success" | "warning" | "danger"',description:"The type of badge.",options:["primary","info","success","warning","danger"],control:{type:"select"},table:{defaultValue:{summary:"primary"}}},outlined:{type:"boolean",description:"Sets whether to draw an outlined version of the badge.",control:"boolean",table:{defaultValue:{summary:!1}}},shape:{type:'"rounded" | "square"',description:"The shape of the badge.",options:["rounded","square"],control:{type:"inline-radio"},table:{defaultValue:{summary:"rounded"}}}},args:{variant:"primary",outlined:!1,shape:"rounded"}};u("home","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg");function y(e){return["primary","info","success","warning","danger"].map((a,t)=>o`
      <igc-tab>
        <span>
          ${a.toUpperCase()}
          <igc-badge
            variant=${a}
            ?outlined=${e.outlined}
            shape=${e.shape}
            >${t+1}</igc-badge
          >
        </span>
      </igc-tab>
    `)}const n={render:({outlined:e,shape:a,variant:t})=>o`
    <igc-badge ?outlined=${e} shape=${a} variant=${t}>
      <igc-icon name="home"></igc-icon>
    </igc-badge>
  `},r={render:e=>o` <style>
        igc-badge {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <igc-tabs>${y(e)}</igc-tabs>`};var i,s,c;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: ({
    outlined,
    shape,
    variant
  }) => html\`
    <igc-badge ?outlined=\${outlined} shape=\${shape} variant=\${variant}>
      <igc-icon name="home"></igc-icon>
    </igc-badge>
  \`
}`,...(c=(s=n.parameters)==null?void 0:s.docs)==null?void 0:c.source}}};var d,p,g;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: args => html\` <style>
        igc-badge {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <igc-tabs>\${renderTabs(args)}</igc-tabs>\`
}`,...(g=(p=r.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};const V=["Basic","Variants"];export{n as Basic,r as Variants,V as __namedExportsOrder,I as default};
