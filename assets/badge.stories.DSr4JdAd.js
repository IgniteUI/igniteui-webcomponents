import{x as o}from"./lit-element.Wy23cYDu.js";import{d as m,b as l,c as u}from"./defineComponents.CVI5q4ti.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";m(u,l);const w={title:"Badge",component:"igc-badge",parameters:{docs:{description:{component:`The badge is a component indicating a status on a related item or an area
where some active indication is required.`}}},argTypes:{variant:{type:'"primary" | "info" | "success" | "warning" | "danger"',description:"The type of badge.",options:["primary","info","success","warning","danger"],control:{type:"select"},table:{defaultValue:{summary:"primary"}}},outlined:{type:"boolean",description:"Sets whether to draw an outlined version of the badge.",control:"boolean",table:{defaultValue:{summary:!1}}},shape:{type:'"rounded" | "square"',description:"The shape of the badge.",options:["rounded","square"],control:{type:"inline-radio"},table:{defaultValue:{summary:"rounded"}}}},args:{variant:"primary",outlined:!1,shape:"rounded"}};function b(e){return["primary","info","success","warning","danger"].map((a,t)=>o`
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
    `)}const r={render:({outlined:e,shape:a,variant:t})=>o`
    <igc-badge ?outlined=${e} shape=${a} variant=${t}>
      1
    </igc-badge>
  `},n={render:e=>o` <style>
        igc-badge {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <igc-tabs>${b(e)}</igc-tabs>`};var s,i,d;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: ({
    outlined,
    shape,
    variant
  }) => html\`
    <igc-badge ?outlined=\${outlined} shape=\${shape} variant=\${variant}>
      1
    </igc-badge>
  \`
}`,...(d=(i=r.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var p,c,g;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => html\` <style>
        igc-badge {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <igc-tabs>\${renderTabs(args)}</igc-tabs>\`
}`,...(g=(c=n.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};const V=["Basic","Variants"];export{r as Basic,n as Variants,V as __namedExportsOrder,w as default};
