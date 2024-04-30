import{x as c}from"./lit-element.Wy23cYDu.js";import{d as r,g as l,P as m}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";r(m,l);const T={title:"Toast",component:"igc-toast",parameters:{docs:{description:{component:"A toast component is used to show a notification"}}},argTypes:{open:{type:"boolean",description:"Whether the component is in shown state.",control:"boolean",table:{defaultValue:{summary:!1}}},displayTime:{type:"number",description:"Determines the duration in ms in which the component will be visible.",control:"number",table:{defaultValue:{summary:4e3}}},keepOpen:{type:"boolean",description:"Determines whether the component should close after the `displayTime` is over.",control:"boolean",table:{defaultValue:{summary:!1}}},position:{type:'"bottom" | "middle" | "top"',description:"Sets the position of the component in the viewport.",options:["bottom","middle","top"],control:{type:"inline-radio"},table:{defaultValue:{summary:"bottom"}}}},args:{open:!1,displayTime:4e3,keepOpen:!1,position:"bottom"}},o={render:({open:i,displayTime:s,keepOpen:a,position:p})=>c`
    <igc-toast
      id="toast"
      ?open=${i}
      ?keep-open=${a}
      .displayTime=${s}
      .position=${p}
    >
      Notification displayed
    </igc-toast>

    <igc-button onclick="toast.show()">Show Toast</igc-button>
    <igc-button onclick="toast.hide()">Hide Toast</igc-button>
    <igc-button onclick="toast.toggle()">Toggle Toast</igc-button>
  `};var t,e,n;o.parameters={...o.parameters,docs:{...(t=o.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: ({
    open,
    displayTime,
    keepOpen,
    position
  }) => html\`
    <igc-toast
      id="toast"
      ?open=\${open}
      ?keep-open=\${keepOpen}
      .displayTime=\${displayTime}
      .position=\${position}
    >
      Notification displayed
    </igc-toast>

    <igc-button onclick="toast.show()">Show Toast</igc-button>
    <igc-button onclick="toast.hide()">Hide Toast</igc-button>
    <igc-button onclick="toast.toggle()">Toggle Toast</igc-button>
  \`
}`,...(n=(e=o.parameters)==null?void 0:e.docs)==null?void 0:n.source}}};const f=["Basic"];export{o as Basic,f as __namedExportsOrder,T as default};
