import{x as a}from"./lit-element.Wy23cYDu.js";import{d as C,r,b as T,o as t}from"./defineComponents.DVY7fKDn.js";import{o as g}from"./range.wLE2hJlA.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function*$(n,i){if(n!==void 0){let s=0;for(const y of n)yield i(y,s++)}}C(T);const B={title:"Tabs",component:"igc-tabs",parameters:{docs:{description:{component:"Represents tabs component"}},actions:{handles:["igcChange"]}},argTypes:{alignment:{type:'"start" | "end" | "center" | "justify"',description:"Sets the alignment for the tab headers",options:["start","end","center","justify"],control:{type:"select"},table:{defaultValue:{summary:"start"}}},activation:{type:'"auto" | "manual"',description:`Determines the tab activation. When set to auto,
the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
and the corresponding panel is displayed.
When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.`,options:["auto","manual"],control:{type:"inline-radio"},table:{defaultValue:{summary:"auto"}}}},args:{alignment:"start",activation:"auto"}};r("home","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg");r("search","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg");r("favorite","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg");const D=n=>{var i;(i=n.target.closest("igc-tab"))==null||i.remove()},_=Array.from($(g(10),n=>a`<igc-tab panel=${n}>
          Item ${n+1}
          <igc-icon-button
            @click=${D}
            size="small"
            slot="suffix"
            collection="internal"
            name="chip_cancel"
          ></igc-icon-button>
        </igc-tab>
        <igc-tab-panel id=${n}><h1>Content for ${n+1}</h1></igc-tab-panel>`)),A=Array.from($(g(18),n=>a`<igc-tab panel=${n} ?disabled=${n===2}> Item ${n+1} </igc-tab>
        <igc-tab-panel id=${n}> Content ${n+1}</igc-tab-panel>`)),S=({activation:n,alignment:i})=>a`
  <igc-tabs
    alignment="${t(i)}"
    activation="${t(n)}"
  >
    ${A}
  </igc-tabs>

  <igc-tabs alignment="${t(i)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
    </igc-tab>
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
  </igc-tabs>

  <igc-tabs alignment="${t(i)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
      <input />
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
  </igc-tabs>
`,x=({activation:n,alignment:i})=>a`
  <igc-tabs
    alignment="${t(i)}"
    activation="${t(n)}"
  >
    ${Array.from(g(1,11)).map(s=>a` <igc-tab>${s}</igc-tab> `)}
  </igc-tabs>
`,I=({activation:n,alignment:i})=>a`
  <igc-tabs
    alignment="${t(i)}"
    activation="${t(n)}"
  >
    ${_}
  </igc-tabs>
`,e=S.bind({}),c=I.bind({}),o=x.bind({});var m,l,d;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`({
  activation,
  alignment
}: IgcTabsArgs) => html\`
  <igc-tabs
    alignment="\${ifDefined(alignment)}"
    activation="\${ifDefined(activation)}"
  >
    \${tabs}
  </igc-tabs>

  <igc-tabs alignment="\${ifDefined(alignment)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
    </igc-tab>
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
  </igc-tabs>

  <igc-tabs alignment="\${ifDefined(alignment)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
      <input />
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
  </igc-tabs>
\``,...(d=(l=e.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,b,u;c.parameters={...c.parameters,docs:{...(p=c.parameters)==null?void 0:p.docs,source:{originalSource:`({
  activation,
  alignment
}: IgcTabsArgs) => html\`
  <igc-tabs
    alignment="\${ifDefined(alignment)}"
    activation="\${ifDefined(activation)}"
  >
    \${removableTabs}
  </igc-tabs>
\``,...(u=(b=c.parameters)==null?void 0:b.docs)==null?void 0:u.source}}};var f,h,v;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`({
  activation,
  alignment
}: IgcTabsArgs) => html\`
  <igc-tabs
    alignment="\${ifDefined(alignment)}"
    activation="\${ifDefined(activation)}"
  >
    \${Array.from(range(1, 11)).map(i => html\` <igc-tab>\${i}</igc-tab> \`)}
  </igc-tabs>
\``,...(v=(h=o.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const V=["Basic","Removable","Strip"];export{e as Basic,c as Removable,o as Strip,V as __namedExportsOrder,B as default};
