import{x as a}from"./lit-element.Wy23cYDu.js";import{d as r,r as e,u as s,g,c as p,t as d,a as m,H as l}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";r(l,m,d,p,g,s);const h={title:"Navbar",component:"igc-navbar",parameters:{docs:{description:{component:`A navigation bar component is used to facilitate navigation through
a series of hierarchical screens within an app.`}}}};Object.assign(h,{argTypes:{content:{type:"string",control:"text"}},args:{content:"Title"}});e("home","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg");e("favorite","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg");const u=({content:c})=>a`
    <igc-navbar style="height:30px">
      <igc-icon slot="start" name="home"></igc-icon>
      <h2>${c}</h2>
      <igc-input
        slot="end"
        style="align-self: center"
        type="search"
        placeholder="search"
        size="small"
        outlined
      >
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-input>
      <igc-icon slot="end" name="favorite"></igc-icon>
      <igc-dropdown slot="end">
        <igc-avatar
          slot="target"
          size="small"
          shape="circle"
          src="https://i.pravatar.cc/200"
          >MP</igc-avatar
        >
        <igc-dropdown-item>Settings</igc-dropdown-item>
        <igc-dropdown-item>Help</igc-dropdown-item>
        <igc-dropdown-item>Log Out</igc-dropdown-item>
      </igc-dropdown>
    </igc-navbar>
  `,n=u.bind({});var t,o,i;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:`({
  content
}: NavbarStoryArgs) => {
  return html\`
    <igc-navbar style="height:30px">
      <igc-icon slot="start" name="home"></igc-icon>
      <h2>\${content}</h2>
      <igc-input
        slot="end"
        style="align-self: center"
        type="search"
        placeholder="search"
        size="small"
        outlined
      >
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-input>
      <igc-icon slot="end" name="favorite"></igc-icon>
      <igc-dropdown slot="end">
        <igc-avatar
          slot="target"
          size="small"
          shape="circle"
          src="https://i.pravatar.cc/200"
          >MP</igc-avatar
        >
        <igc-dropdown-item>Settings</igc-dropdown-item>
        <igc-dropdown-item>Help</igc-dropdown-item>
        <igc-dropdown-item>Log Out</igc-dropdown-item>
      </igc-dropdown>
    </igc-navbar>
  \`;
}`,...(i=(o=n.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};const I=["Basic"];export{n as Basic,I as __namedExportsOrder,h as default};
