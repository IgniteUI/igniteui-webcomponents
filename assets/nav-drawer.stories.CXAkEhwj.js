import{x as c}from"./lit-element.Wy23cYDu.js";import{d,r as l,G as p,c as v}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";d(v,p);const T={title:"NavDrawer",component:"igc-nav-drawer",parameters:{docs:{description:{component:`Represents a side navigation container that provides
quick access between views.`}}},argTypes:{position:{type:'"start" | "end" | "top" | "bottom" | "relative"',description:"The position of the drawer.",options:["start","end","top","bottom","relative"],control:{type:"select"},table:{defaultValue:{summary:"start"}}},open:{type:"boolean",description:"Determines whether the drawer is opened.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{position:"start",open:!1}};l("home","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg");l("search","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg");const h=e=>{var o;let t;const n=e.target;if(n.tagName.toLowerCase()==="igc-nav-drawer-item"&&(t=n),((o=n.parentElement)==null?void 0:o.tagName.toLowerCase())==="igc-nav-drawer-item"&&(t=n.parentElement),t!==void 0){t.active=!0;const g=document.querySelector("igc-nav-drawer");Array.from(g.querySelectorAll("igc-nav-drawer-item")).filter(a=>a!==t).forEach(a=>{a.active=!1})}},x=()=>{const e=document.querySelector("igc-nav-drawer");e==null||e.show()},b=()=>{const e=document.querySelector("igc-nav-drawer");e==null||e.hide()},w=()=>{const e=document.querySelector("igc-nav-drawer");e==null||e.toggle()},u=[{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"},{icon:"home",text:"Navbar item text"}],f=({open:e=!1,position:t})=>c`
    <style>
      .main {
        display: flex;
        margin: -1rem;
        height: 100vh;
        overflow: hidden;
      }

      .content {
        padding-inline-start: 20px;
        font-family: var(--ig-font-family);
      }
    </style>

    <div class="ig-scrollbar main">
      <igc-nav-drawer
        .open=${e}
        .position=${t}
        @click="${h}"
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        ${u.map(n=>c`
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="${n.icon}"></igc-icon>
              <span slot="content">${n.text}</span>
            </igc-nav-drawer-item>
          `)}

        <div slot="mini">
          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
          </igc-nav-drawer-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="search"></igc-icon>
          </igc-nav-drawer-item>
        </div>
      </igc-nav-drawer>

      <section class="content">
        <p>Sample page content</p>
        <igc-button @click="${x}">Open</igc-button>
        <igc-button @click="${b}">Close</igc-button>
        <igc-button @click="${w}">Toggle</igc-button>
      </section>
    </div>
  `,i=f.bind({});var r,m,s;i.parameters={...i.parameters,docs:{...(r=i.parameters)==null?void 0:r.docs,source:{originalSource:`({
  open = false,
  position
}: IgcNavDrawerArgs) => {
  return html\`
    <style>
      .main {
        display: flex;
        margin: -1rem;
        height: 100vh;
        overflow: hidden;
      }

      .content {
        padding-inline-start: 20px;
        font-family: var(--ig-font-family);
      }
    </style>

    <div class="ig-scrollbar main">
      <igc-nav-drawer
        .open=\${open}
        .position=\${position}
        @click="\${handleClick}"
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        \${navbarItems.map(items => {
    return html\`
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="\${items.icon}"></igc-icon>
              <span slot="content">\${items.text}</span>
            </igc-nav-drawer-item>
          \`;
  })}

        <div slot="mini">
          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
          </igc-nav-drawer-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="search"></igc-icon>
          </igc-nav-drawer-item>
        </div>
      </igc-nav-drawer>

      <section class="content">
        <p>Sample page content</p>
        <igc-button @click="\${handleOpen}">Open</igc-button>
        <igc-button @click="\${handleClose}">Close</igc-button>
        <igc-button @click="\${handleToggle}">Toggle</igc-button>
      </section>
    </div>
  \`;
}`,...(s=(m=i.parameters)==null?void 0:m.docs)==null?void 0:s.source}}};const D=["Basic"];export{i as Basic,D as __namedExportsOrder,T as default};
