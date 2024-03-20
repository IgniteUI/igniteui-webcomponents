import{s as x}from"./election.D3AHPmQe.js";import{I as F}from"./socialMedia.DmrXeeV-.js";import{x as o}from"./lit-element.Wy23cYDu.js";import{o as W}from"./range.wLE2hJlA.js";import{i as D,d as C,e as I,g as T,t as E,u as A}from"./defineComponents.CVI5q4ti.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";const P=[F,x];P.forEach(e=>{D(e.name,e.value)});C(A,E,T,I);const K={title:"Dropdown",component:"igc-dropdown",parameters:{docs:{description:{component:"Represents a DropDown component."}},actions:{handles:["igcChange","igcOpening","igcOpened","igcClosing","igcClosed"]}},argTypes:{placement:{type:'"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',description:"The preferred placement of the component around the target element.",options:["top","top-start","top-end","bottom","bottom-start","bottom-end","right","right-start","right-end","left","left-start","left-end"],control:{type:"select"},table:{defaultValue:{summary:"bottom-start"}}},positionStrategy:{type:'"absolute" | "fixed"',description:"Sets the component's positioning strategy.",options:["absolute","fixed"],control:{type:"inline-radio"},table:{defaultValue:{summary:"absolute"}}},scrollStrategy:{type:'"scroll" | "block" | "close"',description:"Determines the behavior of the component during scrolling of the parent container.",options:["scroll","block","close"],control:{type:"inline-radio"},table:{defaultValue:{summary:"scroll"}}},flip:{type:"boolean",description:`Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
When true, once enough space is detected on its preferred side, it will flip back.`,control:"boolean",table:{defaultValue:{summary:!1}}},distance:{type:"number",description:"The distance from the target element.",control:"number",table:{defaultValue:{summary:0}}},sameWidth:{type:"boolean",description:"Whether the dropdown's width should be the same as the target's one.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnSelect:{type:"boolean",description:"Whether the component dropdown should be kept open on selection.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnOutsideClick:{type:"boolean",description:"Whether the component dropdown should be kept open on clicking outside of it.",control:"boolean",table:{defaultValue:{summary:!1}}},open:{type:"boolean",description:"Sets the open state of the component.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{placement:"bottom-start",positionStrategy:"absolute",scrollStrategy:"scroll",flip:!1,distance:0,sameWidth:!1,keepOpenOnSelect:!1,keepOpenOnOutsideClick:!1,open:!1}},U=["Specification","Implementation","Testing","Samples","Documentation","Builds"].map(e=>o`<igc-dropdown-item value=${e}>${e}</igc-dropdown-item>`),V=Array.from(W(1,51)).map(e=>o`<igc-dropdown-item value=${e}>Item ${e}</igc-dropdown-item>`),s={render:({open:e,flip:n,keepOpenOnOutsideClick:t,keepOpenOnSelect:i,sameWidth:r,placement:a,positionStrategy:d,distance:p,scrollStrategy:m})=>o`
    <igc-dropdown
      id="dropdown"
      ?open=${e}
      ?flip=${n}
      ?keep-open-on-outside-click=${t}
      ?keep-open-on-select=${i}
      ?same-width=${r}
      .placement=${a}
      .positionStrategy=${d}
      .distance=${p}
      .scrollStrategy=${m}
    >
      <igc-button slot="target">Tasks</igc-button>
      <igc-dropdown-header>Available tasks:</igc-dropdown-header>
      ${U}
    </igc-dropdown>
  `},c={args:{sameWidth:!0},render:({distance:e,open:n,flip:t,keepOpenOnOutsideClick:i,keepOpenOnSelect:r,placement:a,positionStrategy:d,sameWidth:p,scrollStrategy:m})=>o`
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
        ?same-width=${p}
        ?open=${n}
        ?flip=${t}
        ?keep-open-on-outside-click=${i}
        ?keep-open-on-select=${r}
        .placement=${a}
        .positionStrategy=${d}
        .distance=${e}
        .scrollStrategy=${m}
      >
        <igc-button slot="target">With vertical overflow</igc-button>
        <igc-dropdown-header>Items:</igc-dropdown-header>
        ${V}
      </igc-dropdown>
    </div>
  `},R=[{country:"Luxembourg",value:"135,605",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/23px-Flag_of_Luxembourg.svg.png"},{country:"Ireland",value:"112,248",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/23px-Flag_of_Ireland.svg.png"},{country:"Switzerland",value:"102,865",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Flag_of_Switzerland_%28Pantone%29.svg/15px-Flag_of_Switzerland_%28Pantone%29.svg.png"}].map(({country:e,flag:n,value:t})=>o`<igc-dropdown-item value=${e}>
      <img slot="prefix" src=${n} alt="Flag of ${e}" />
      ${e} ${t}
    </igc-dropdown-item>`),N=[{country:"United States",value:"80,412",flag:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/23px-Flag_of_the_United_States.svg.png"},{country:"Canada",value:"53,247",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/23px-Flag_of_Canada_%28Pantone%29.svg.png"},{country:"Puerto Rico",value:"37,093",flag:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Flag_of_Puerto_Rico.svg/23px-Flag_of_Puerto_Rico.svg.png"}].map(({country:e,flag:n,value:t})=>o`<igc-dropdown-item value=${e}>
      <img slot="prefix" src=${n} alt="Flag of ${e}" />
      ${e} ${t}
    </igc-dropdown-item>`),l={args:{sameWidth:!0},render:({open:e,keepOpenOnOutsideClick:n,keepOpenOnSelect:t,distance:i,flip:r,placement:a,positionStrategy:d,sameWidth:p})=>o`
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
      ?flip=${r}
      ?keep-open-on-outside-click=${n}
      ?keep-open-on-select=${t}
      ?same-width=${p}
      .placement=${a}
      .positionStrategy=${d}
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
        ${N}
      </igc-dropdown-group>
    </igc-dropdown>
  `},g={render:({distance:e,open:n,flip:t,keepOpenOnOutsideClick:i,keepOpenOnSelect:r,placement:a,positionStrategy:d,sameWidth:p})=>o`
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
      ?flip=${t}
      ?keep-open-on-outside-click=${i}
      ?keep-open-on-select=${r}
      .placement=${a}
      .positionStrategy=${d}
      ?same-width=${p}
    >
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
      <igc-dropdown-item>3</igc-dropdown-item>
    </igc-dropdown>
  `};var u,h,w;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: ({
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    sameWidth,
    placement,
    positionStrategy,
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
      .positionStrategy=\${positionStrategy}
      .distance=\${distance}
      .scrollStrategy=\${scrollStrategy}
    >
      <igc-button slot="target">Tasks</igc-button>
      <igc-dropdown-header>Available tasks:</igc-dropdown-header>
      \${Items}
    </igc-dropdown>
  \`
}`,...(w=(h=s.parameters)==null?void 0:h.docs)==null?void 0:w.source}}};var f,b,$;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
    positionStrategy,
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
        .positionStrategy=\${positionStrategy}
        .distance=\${distance}
        .scrollStrategy=\${scrollStrategy}
      >
        <igc-button slot="target">With vertical overflow</igc-button>
        <igc-dropdown-header>Items:</igc-dropdown-header>
        \${overflowItems}
      </igc-dropdown>
    </div>
  \`
}`,...($=(b=c.parameters)==null?void 0:b.docs)==null?void 0:$.source}}};var k,y,S;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
    positionStrategy,
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
      .positionStrategy=\${positionStrategy}
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
}`,...(S=(y=l.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var O,v,_;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: ({
    distance,
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    placement,
    positionStrategy,
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
      .positionStrategy=\${positionStrategy}
      ?same-width=\${sameWidth}
    >
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
      <igc-dropdown-item>3</igc-dropdown-item>
    </igc-dropdown>
  \`
}`,...(_=(v=g.parameters)==null?void 0:v.docs)==null?void 0:_.source}}};const Q=["Basic","Overflow","GroupsAndHeaders","WithNonSlottedTarget"];export{s as Basic,l as GroupsAndHeaders,c as Overflow,g as WithNonSlottedTarget,Q as __namedExportsOrder,K as default};
