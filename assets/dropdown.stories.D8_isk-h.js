import{s as _}from"./election.D3AHPmQe.js";import{I as x}from"./socialMedia.DmrXeeV-.js";import{x as t}from"./lit-element.Wy23cYDu.js";import{o as F}from"./range.wLE2hJlA.js";import{i as W,d as D,c as C,g as I,t as T,u as E}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";const A=[x,_];A.forEach(e=>{W(e.name,e.value)});D(E,T,I,C);const J={title:"Dropdown",component:"igc-dropdown",parameters:{docs:{description:{component:"Represents a DropDown component."}},actions:{handles:["igcChange","igcOpening","igcOpened","igcClosing","igcClosed"]}},argTypes:{placement:{type:'"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',description:"The preferred placement of the component around the target element.",options:["top","top-start","top-end","bottom","bottom-start","bottom-end","right","right-start","right-end","left","left-start","left-end"],control:{type:"select"},table:{defaultValue:{summary:"bottom-start"}}},scrollStrategy:{type:'"scroll" | "block" | "close"',description:"Determines the behavior of the component during scrolling of the parent container.",options:["scroll","block","close"],control:{type:"inline-radio"},table:{defaultValue:{summary:"scroll"}}},flip:{type:"boolean",description:`Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
When true, once enough space is detected on its preferred side, it will flip back.`,control:"boolean",table:{defaultValue:{summary:!1}}},distance:{type:"number",description:"The distance from the target element.",control:"number",table:{defaultValue:{summary:0}}},sameWidth:{type:"boolean",description:"Whether the dropdown's width should be the same as the target's one.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnSelect:{type:"boolean",description:"Whether the component dropdown should be kept open on selection.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnOutsideClick:{type:"boolean",description:"Whether the component dropdown should be kept open on clicking outside of it.",control:"boolean",table:{defaultValue:{summary:!1}}},open:{type:"boolean",description:"Sets the open state of the component.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{placement:"bottom-start",scrollStrategy:"scroll",flip:!1,distance:0,sameWidth:!1,keepOpenOnSelect:!1,keepOpenOnOutsideClick:!1,open:!1}},P=["Specification","Implementation","Testing","Samples","Documentation","Builds"].map(e=>t`<igc-dropdown-item value=${e}>${e}</igc-dropdown-item>`),U=Array.from(F(1,51)).map(e=>t`<igc-dropdown-item value=${e}>Item ${e}</igc-dropdown-item>`),p={render:({open:e,flip:n,keepOpenOnOutsideClick:o,keepOpenOnSelect:i,sameWidth:d,placement:r,distance:a,scrollStrategy:g})=>t`
    <igc-dropdown
      id="dropdown"
      ?open=${e}
      ?flip=${n}
      ?keep-open-on-outside-click=${o}
      ?keep-open-on-select=${i}
      ?same-width=${d}
      .placement=${r}
      .distance=${a}
      .scrollStrategy=${g}
    >
      <igc-button slot="target">Tasks</igc-button>
      <igc-dropdown-header>Available tasks:</igc-dropdown-header>
      ${P}
    </igc-dropdown>
  `},s={args:{sameWidth:!0},render:({distance:e,open:n,flip:o,keepOpenOnOutsideClick:i,keepOpenOnSelect:d,placement:r,sameWidth:a,scrollStrategy:g})=>t`
    <style>
      .dropdown-container {
        display: flex;
        margin: 20rem auto;
        justify-content: center;
      }

      #overflowing::part(list) {
        max-height: 50vh;
      }
    </style>
    <div class="dropdown-container">
      <igc-dropdown
        id="overflowing"
        ?same-width=${a}
        ?open=${n}
        ?flip=${o}
        ?keep-open-on-outside-click=${i}
        ?keep-open-on-select=${d}
        .placement=${r}
        .distance=${e}
        .scrollStrategy=${g}
      >
        <igc-button slot="target">With vertical overflow</igc-button>
        <igc-dropdown-header>Items:</igc-dropdown-header>
        ${U}
      </igc-dropdown>
    </div>
  `},R=[{country:"Luxembourg",value:"135,605",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/23px-Flag_of_Luxembourg.svg.png"},{country:"Ireland",value:"112,248",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/23px-Flag_of_Ireland.svg.png"},{country:"Switzerland",value:"102,865",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Flag_of_Switzerland_%28Pantone%29.svg/15px-Flag_of_Switzerland_%28Pantone%29.svg.png"}].map(({country:e,flag:n,value:o})=>t`<igc-dropdown-item value=${e}>
      <img slot="prefix" src=${n} alt="Flag of ${e}" />
      ${e} ${o}
    </igc-dropdown-item>`),V=[{country:"United States",value:"80,412",flag:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/23px-Flag_of_the_United_States.svg.png"},{country:"Canada",value:"53,247",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/23px-Flag_of_Canada_%28Pantone%29.svg.png"},{country:"Puerto Rico",value:"37,093",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Flag_of_Puerto_Rico.svg/23px-Flag_of_Puerto_Rico.svg.png"}].map(({country:e,flag:n,value:o})=>t`<igc-dropdown-item value=${e}>
      <img slot="prefix" src=${n} alt="Flag of ${e}" />
      ${e} ${o}
    </igc-dropdown-item>`),c={args:{sameWidth:!0},render:({open:e,keepOpenOnOutsideClick:n,keepOpenOnSelect:o,distance:i,flip:d,placement:r,sameWidth:a})=>t`
    <style>
      igc-dropdown-header {
        text-align: start;
      }
      img {
        width: 23px;
        height: 12px;
      }
      .group-title {
        font-size: 0.75rem;
      }
    </style>
    <igc-dropdown
      id="groups-and-headers"
      ?open=${e}
      ?flip=${d}
      ?keep-open-on-outside-click=${n}
      ?keep-open-on-select=${o}
      ?same-width=${a}
      .placement=${r}
      .distance=${i}
    >
      <igc-button slot="target"
        >GDP (in USD) per capita by country (IMF)</igc-button
      >

      <igc-dropdown-group>
        <p class="group-title" slot="label">
          UN Region: <strong>Europe</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        ${R}
      </igc-dropdown-group>

      <igc-dropdown-group>
        <p slot="label" class="group-title">
          UN Region: <strong>Americas</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        ${V}
      </igc-dropdown-group>
    </igc-dropdown>
  `},l={render:({distance:e,open:n,flip:o,keepOpenOnOutsideClick:i,keepOpenOnSelect:d,placement:r,sameWidth:a})=>t`
    <style>
      .container {
        display: flex;
        justify-content: space-between;
      }
    </style>
    <div class="container">
      <igc-button id="1st" onclick="detachedDropdown.show('1st')"
        >First</igc-button
      >
      <igc-button id="2nd" onclick="detachedDropdown.show('2nd')"
        >Second</igc-button
      >
      <igc-button id="3rd" onclick="detachedDropdown.show('3rd')"
        >Third</igc-button
      >
      <igc-button id="4th" onclick="detachedDropdown.show('4th')"
        >Fourth</igc-button
      >
    </div>
    <igc-input
      id="input"
      style="max-width: 15rem"
      label="Focus me"
      onfocus="detachedDropdown.show('input')"
    ></igc-input>

    <igc-dropdown
      id="detachedDropdown"
      .distance=${e}
      ?open=${n}
      ?flip=${o}
      ?keep-open-on-outside-click=${i}
      ?keep-open-on-select=${d}
      .placement=${r}
      ?same-width=${a}
    >
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
      <igc-dropdown-item>3</igc-dropdown-item>
    </igc-dropdown>
  `};var m,u,h;p.parameters={...p.parameters,docs:{...(m=p.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: ({
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    sameWidth,
    placement,
    distance,
    scrollStrategy
  }) => html\`
    <igc-dropdown
      id="dropdown"
      ?open=\${open}
      ?flip=\${flip}
      ?keep-open-on-outside-click=\${keepOpenOnOutsideClick}
      ?keep-open-on-select=\${keepOpenOnSelect}
      ?same-width=\${sameWidth}
      .placement=\${placement}
      .distance=\${distance}
      .scrollStrategy=\${scrollStrategy}
    >
      <igc-button slot="target">Tasks</igc-button>
      <igc-dropdown-header>Available tasks:</igc-dropdown-header>
      \${Items}
    </igc-dropdown>
  \`
}`,...(h=(u=p.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var w,f,b;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    sameWidth: true
  },
  render: ({
    distance,
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    placement,
    sameWidth,
    scrollStrategy
  }) => html\`
    <style>
      .dropdown-container {
        display: flex;
        margin: 20rem auto;
        justify-content: center;
      }

      #overflowing::part(list) {
        max-height: 50vh;
      }
    </style>
    <div class="dropdown-container">
      <igc-dropdown
        id="overflowing"
        ?same-width=\${sameWidth}
        ?open=\${open}
        ?flip=\${flip}
        ?keep-open-on-outside-click=\${keepOpenOnOutsideClick}
        ?keep-open-on-select=\${keepOpenOnSelect}
        .placement=\${placement}
        .distance=\${distance}
        .scrollStrategy=\${scrollStrategy}
      >
        <igc-button slot="target">With vertical overflow</igc-button>
        <igc-dropdown-header>Items:</igc-dropdown-header>
        \${overflowItems}
      </igc-dropdown>
    </div>
  \`
}`,...(b=(f=s.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var k,$,y;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    sameWidth: true
  },
  render: ({
    open,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    distance,
    flip,
    placement,
    sameWidth
  }) => html\`
    <style>
      igc-dropdown-header {
        text-align: start;
      }
      img {
        width: 23px;
        height: 12px;
      }
      .group-title {
        font-size: 0.75rem;
      }
    </style>
    <igc-dropdown
      id="groups-and-headers"
      ?open=\${open}
      ?flip=\${flip}
      ?keep-open-on-outside-click=\${keepOpenOnOutsideClick}
      ?keep-open-on-select=\${keepOpenOnSelect}
      ?same-width=\${sameWidth}
      .placement=\${placement}
      .distance=\${distance}
    >
      <igc-button slot="target"
        >GDP (in USD) per capita by country (IMF)</igc-button
      >

      <igc-dropdown-group>
        <p class="group-title" slot="label">
          UN Region: <strong>Europe</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        \${gdpEurope}
      </igc-dropdown-group>

      <igc-dropdown-group>
        <p slot="label" class="group-title">
          UN Region: <strong>Americas</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        \${gdpAmericas}
      </igc-dropdown-group>
    </igc-dropdown>
  \`
}`,...(y=($=c.parameters)==null?void 0:$.docs)==null?void 0:y.source}}};var O,v,S;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: ({
    distance,
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    placement,
    sameWidth
  }) => html\`
    <style>
      .container {
        display: flex;
        justify-content: space-between;
      }
    </style>
    <div class="container">
      <igc-button id="1st" onclick="detachedDropdown.show('1st')"
        >First</igc-button
      >
      <igc-button id="2nd" onclick="detachedDropdown.show('2nd')"
        >Second</igc-button
      >
      <igc-button id="3rd" onclick="detachedDropdown.show('3rd')"
        >Third</igc-button
      >
      <igc-button id="4th" onclick="detachedDropdown.show('4th')"
        >Fourth</igc-button
      >
    </div>
    <igc-input
      id="input"
      style="max-width: 15rem"
      label="Focus me"
      onfocus="detachedDropdown.show('input')"
    ></igc-input>

    <igc-dropdown
      id="detachedDropdown"
      .distance=\${distance}
      ?open=\${open}
      ?flip=\${flip}
      ?keep-open-on-outside-click=\${keepOpenOnOutsideClick}
      ?keep-open-on-select=\${keepOpenOnSelect}
      .placement=\${placement}
      ?same-width=\${sameWidth}
    >
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
      <igc-dropdown-item>3</igc-dropdown-item>
    </igc-dropdown>
  \`
}`,...(S=(v=l.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};const K=["Basic","Overflow","GroupsAndHeaders","WithNonSlottedTarget"];export{p as Basic,c as GroupsAndHeaders,s as Overflow,l as WithNonSlottedTarget,K as __namedExportsOrder,J as default};
