import{y as s}from"./health.B5ghXXgr.js";import{x as g}from"./lit-element.Wy23cYDu.js";import{i as u,d as h,c as y,g as $,M as f}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";u(s.name,s.value);h(f,$,y);const A={title:"Snackbar",component:"igc-snackbar",parameters:{docs:{description:{component:`A snackbar component is used to provide feedback about an operation
by showing a brief message at the bottom of the screen.`}},actions:{handles:["igcAction"]}},argTypes:{actionText:{type:"string",description:"The snackbar action button.",control:"text"},open:{type:"boolean",description:"Whether the component is in shown state.",control:"boolean",table:{defaultValue:{summary:!1}}},displayTime:{type:"number",description:"Determines the duration in ms in which the component will be visible.",control:"number",table:{defaultValue:{summary:4e3}}},keepOpen:{type:"boolean",description:"Determines whether the component should close after the `displayTime` is over.",control:"boolean",table:{defaultValue:{summary:!1}}},position:{type:'"bottom" | "middle" | "top"',description:"Sets the position of the component in the viewport.",options:["bottom","middle","top"],control:{type:"inline-radio"},table:{defaultValue:{summary:"bottom"}}}},args:{open:!1,displayTime:4e3,keepOpen:!1,position:"bottom"}},n={render:({open:o,keepOpen:t,displayTime:a,actionText:i="Close",position:c})=>g`
    <igc-snackbar
      id="snackbar"
      ?open=${o}
      ?keep-open=${t}
      .displayTime=${a}
      .actionText=${i}
      .position=${c}
      @igcAction=${({target:k})=>k.hide()}
      >Snackbar Message</igc-snackbar
    >

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  `},e={render:({open:o,keepOpen:t,displayTime:a,position:i})=>g`
    <igc-snackbar
      id="snackbar"
      ?open=${o}
      ?keep-open=${t}
      .displayTime=${a}
      .position=${i}
      @igcAction=${({target:c})=>c.hide()}
    >
      Snackbar with slotted custom action
      <igc-button slot="action" variant="flat">
        <igc-icon name=${s.name}></igc-icon>
        OK
      </igc-button>
    </igc-snackbar>

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  `};var r,p,b;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: ({
    open,
    keepOpen,
    displayTime,
    actionText = 'Close',
    position
  }) => html\`
    <igc-snackbar
      id="snackbar"
      ?open=\${open}
      ?keep-open=\${keepOpen}
      .displayTime=\${displayTime}
      .actionText=\${actionText}
      .position=\${position}
      @igcAction=\${({
    target
  }) => target.hide()}
      >Snackbar Message</igc-snackbar
    >

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  \`
}`,...(b=(p=n.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var l,m,d;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: ({
    open,
    keepOpen,
    displayTime,
    position
  }) => html\`
    <igc-snackbar
      id="snackbar"
      ?open=\${open}
      ?keep-open=\${keepOpen}
      .displayTime=\${displayTime}
      .position=\${position}
      @igcAction=\${({
    target
  }) => target.hide()}
    >
      Snackbar with slotted custom action
      <igc-button slot="action" variant="flat">
        <igc-icon name=\${radioactive.name}></igc-icon>
        OK
      </igc-button>
    </igc-snackbar>

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  \`
}`,...(d=(m=e.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};const I=["Basic","SlottedAction"];export{n as Basic,e as SlottedAction,I as __namedExportsOrder,A as default};
