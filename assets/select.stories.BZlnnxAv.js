import{h as q,k as w}from"./content.BURghAKS.js";import{I as u}from"./socialMedia.DmrXeeV-.js";import{x as l}from"./lit-element.Wy23cYDu.js";import{g as A}from"./config.Dbb4Rit-.js";import{d as V,i as F,c as B,y as D}from"./defineComponents.DVY7fKDn.js";import{d as H,f as W,a as E}from"./story.CeFfqOJR.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";V(D,B);for(const e of[u,q,w])F(e.name,e.value);const R={title:"Select",component:"igc-select",parameters:{docs:{description:{component:"Represents a control that provides a menu of options."}},actions:{handles:["igcFocus","igcBlur","igcChange","igcOpening","igcOpened","igcClosing","igcClosed"]}},argTypes:{value:{type:"string",description:"The value attribute of the control.",control:"text"},outlined:{type:"boolean",description:"The outlined attribute of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},autofocus:{type:"boolean",description:"The autofocus attribute of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},distance:{type:"number",description:"The distance of the select dropdown from its input.",control:"number",table:{defaultValue:{summary:0}}},label:{type:"string",description:"The label attribute of the control.",control:"text"},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},placement:{type:'"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',description:"The preferred placement of the select dropdown around its input.",options:["top","top-start","top-end","bottom","bottom-start","bottom-end","right","right-start","right-end","left","left-start","left-end"],control:{type:"select"},table:{defaultValue:{summary:"bottom-start"}}},scrollStrategy:{type:'"scroll" | "block" | "close"',description:"Determines the behavior of the component during scrolling of the parent container.",options:["scroll","block","close"],control:{type:"inline-radio"},table:{defaultValue:{summary:"scroll"}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnSelect:{type:"boolean",description:"Whether the component dropdown should be kept open on selection.",control:"boolean",table:{defaultValue:{summary:!1}}},keepOpenOnOutsideClick:{type:"boolean",description:"Whether the component dropdown should be kept open on clicking outside of it.",control:"boolean",table:{defaultValue:{summary:!1}}},open:{type:"boolean",description:"Sets the open state of the component.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{outlined:!1,autofocus:!1,distance:0,placement:"bottom-start",scrollStrategy:"scroll",required:!1,disabled:!1,invalid:!1,keepOpenOnSelect:!1,keepOpenOnOutsideClick:!1,open:!1}},I=[{text:"Specification",value:"spec",disabled:!1,selected:!1},{text:"Implementation",value:"implementation",disabled:!1,selected:!1},{text:"Testing",value:"testing",disabled:!0,selected:!1},{text:"Samples",value:"samples",disabled:!1,selected:!1},{text:"Documentation",value:"docs",disabled:!1,selected:!1},{text:"Builds",value:"builds",disabled:!0,selected:!1}].map(e=>l`<igc-select-item
      .value=${e.value}
      ?disabled=${e.disabled}
      ?selected=${e.selected}
      >${e.text}</igc-select-item
    >`),c=Object.entries(A([{continent:"Europe",country:"Bulgaria",value:"bg",selected:!0,disabled:!1},{continent:"Europe",country:"United Kingdom",value:"uk",selected:!1,disabled:!0},{continent:"North America",country:"United States of America",value:"us",selected:!1,disabled:!1},{continent:"North America",country:"Canada",value:"ca",selected:!1,disabled:!1},{continent:"Asia",country:"Japan",value:"ja",selected:!1,disabled:!1},{continent:"Asia",country:"India",value:"in",selected:!1,disabled:!0}],"continent")),i={args:{label:"Assign task",value:"docs"},render:e=>l`
    <igc-select
      .value=${e.value}
      .label=${e.label}
      .name=${e.name}
      .placeholder=${e.placeholder}
      .placement=${e.placement}
      .scrollStrategy=${e.scrollStrategy}
      .distance=${e.distance}
      ?open=${e.open}
      ?keep-open-on-outside-click=${e.keepOpenOnOutsideClick}
      ?keep-open-on-select=${e.keepOpenOnSelect}
      ?autofocus=${e.autofocus}
      ?outlined=${e.outlined}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
    >
      <igc-select-header>Available tasks:</igc-select-header>
      ${I}
      <p slot="helper-text">Choose a task to assign.</p>
    </igc-select>
  `},s={args:{label:"Select a country"},render:e=>l`
    <igc-select
      .value=${e.value}
      .label=${e.label}
      .name=${e.name}
      .placeholder=${e.placeholder}
      .placement=${e.placement}
      .scrollStrategy=${e.scrollStrategy}
      .distance=${e.distance}
      ?open=${e.open}
      ?keep-open-on-outside-click=${e.keepOpenOnOutsideClick}
      ?keep-open-on-select=${e.keepOpenOnSelect}
      ?autofocus=${e.autofocus}
      ?outlined=${e.outlined}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
    >
      ${c.map(([n,t])=>l`
          <igc-select-group>
            <igc-select-header slot="label">${n}</igc-select-header>
            ${t.map(d=>l`
                <igc-select-item value=${d.value} ?disabled=${d.disabled}
                  >${d.country}</igc-select-item
                >
              `)}
          </igc-select-group>
        `)}
      <p slot="helper-text">Choose a country.</p>
    </igc-select>
  `},a={args:{value:"1"},render:({value:e})=>l`
    <style>
      igc-select {
        margin-bottom: 2rem;
      }
    </style>
    <igc-select value=${e} label="Initial through value attribute">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2">Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>
    </igc-select>

    <igc-select label="Through selected attribute on igc-select-item">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3" selected>Third</igc-select-item>

      <p slot="helper-text">
        If there are multiple items with the <code>selected</code> attribute,
        the last one will take precedence and set the initial value of the
        component.
      </p>
    </igc-select>

    <igc-select label="Both set on initial render" value=${e}>
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>

      <p slot="helper-text">
        If both are set on initial render, then the
        <code>selected</code> attribute of the child (if any) item will take
        precedence over the <code>value</code> attribute of the select.
      </p>
    </igc-select>
  `},o={render:()=>l`
    <style>
      .template {
        background-color: hsl(var(--ig-primary-A200));
        color: hsl(var(--ig-primary-A200-contrast));
        padding: 0.5rem;
      }

      igc-select::part(list) {
        max-height: 50vh;
      }
    </style>
    <igc-select label="Select component with all slots">
      <igc-icon name=${u.name} slot="prefix"></igc-icon>
      <igc-icon name=${u.name} slot="suffix"></igc-icon>

      <igc-icon name=${q.name} slot="toggle-icon"></igc-icon>
      <igc-icon name=${w.name} slot="toggle-icon-expanded"></igc-icon>

      <section class="template" slot="header">This is a header</section>
      <section class="template" slot="footer">This is a footer</section>

      <p slot="helper-text">Helper text</p>

      <igc-select-header>Tasks</igc-select-header>
      ${I}

      <igc-select-header>Countries</igc-select-header>
      ${c.map(([e,n])=>l`
          <igc-select-group>
            <igc-select-header slot="label">${e}</igc-select-header>
            ${n.map(t=>l`
                <igc-select-item value=${t.value} ?disabled=${t.disabled}
                  >${t.country}</igc-select-item
                >
              `)}
          </igc-select-group>
        `)}
    </igc-select>
  `},r={argTypes:H(R),render:()=>l`
      <form @submit=${W}>
        <fieldset>
          <legend>Default select</legend>
          <igc-select
            value="bg"
            name="default-select"
            label="Countries (value through attribute)"
          >
            ${c.map(([e,n])=>l`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${e}</igc-select-header
                  >
                  ${n.map(t=>l`
                      <igc-select-item
                        value=${t.value}
                        ?disabled=${t.disabled}
                        >${t.country}</igc-select-item
                      >
                    `)}
                </igc-select-group>
              `)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
          <igc-select
            name="default-select-2"
            label="Countries (value through selected item)"
          >
            ${c.map(([e,n])=>l`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${e}</igc-select-header
                  >
                  ${n.map(t=>l`
                      <igc-select-item
                        value=${t.value}
                        ?selected=${t.selected}
                        ?disabled=${t.disabled}
                        >${t.country}</igc-select-item
                      >
                    `)}
                </igc-select-group>
              `)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset>
          <legend>Required select</legend>
          <igc-select name="required-select" label="Countries" required>
            ${c.map(([e,n])=>l`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${e}</igc-select-header
                  >
                  ${n.map(t=>l`
                      <igc-select-item
                        value=${t.value}
                        ?disabled=${t.disabled}
                        >${t.country}</igc-select-item
                      >
                    `)}
                </igc-select-group>
              `)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled form group</legend>
          <igc-select label="Countries">
            ${c.map(([e,n])=>l`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${e}</igc-select-header
                  >
                  ${n.map(t=>l`
                      <igc-select-item
                        value=${t.value}
                        ?disabled=${t.disabled}
                        >${t.country}</igc-select-item
                      >
                    `)}
                </igc-select-group>
              `)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        ${E()}
      </form>
    `};var p,g,m;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Assign task',
    value: 'docs'
  },
  render: args => html\`
    <igc-select
      .value=\${args.value}
      .label=\${args.label}
      .name=\${args.name}
      .placeholder=\${args.placeholder}
      .placement=\${args.placement}
      .scrollStrategy=\${args.scrollStrategy}
      .distance=\${args.distance}
      ?open=\${args.open}
      ?keep-open-on-outside-click=\${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=\${args.keepOpenOnSelect}
      ?autofocus=\${args.autofocus}
      ?outlined=\${args.outlined}
      ?required=\${args.required}
      ?disabled=\${args.disabled}
      ?invalid=\${args.invalid}
    >
      <igc-select-header>Available tasks:</igc-select-header>
      \${items}
      <p slot="helper-text">Choose a task to assign.</p>
    </igc-select>
  \`
}`,...(m=(g=i.parameters)==null?void 0:g.docs)==null?void 0:m.source}}};var h,b,$;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Select a country'
  },
  render: args => html\`
    <igc-select
      .value=\${args.value}
      .label=\${args.label}
      .name=\${args.name}
      .placeholder=\${args.placeholder}
      .placement=\${args.placement}
      .scrollStrategy=\${args.scrollStrategy}
      .distance=\${args.distance}
      ?open=\${args.open}
      ?keep-open-on-outside-click=\${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=\${args.keepOpenOnSelect}
      ?autofocus=\${args.autofocus}
      ?outlined=\${args.outlined}
      ?required=\${args.required}
      ?disabled=\${args.disabled}
      ?invalid=\${args.invalid}
    >
      \${countries.map(([continent, countries]) => html\`
          <igc-select-group>
            <igc-select-header slot="label">\${continent}</igc-select-header>
            \${countries.map(item => html\`
                <igc-select-item value=\${item.value} ?disabled=\${item.disabled}
                  >\${item.country}</igc-select-item
                >
              \`)}
          </igc-select-group>
        \`)}
      <p slot="helper-text">Choose a country.</p>
    </igc-select>
  \`
}`,...($=(b=s.parameters)==null?void 0:b.docs)==null?void 0:$.source}}};var f,v,y;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    value: '1'
  },
  render: ({
    value
  }) => html\`
    <style>
      igc-select {
        margin-bottom: 2rem;
      }
    </style>
    <igc-select value=\${value} label="Initial through value attribute">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2">Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>
    </igc-select>

    <igc-select label="Through selected attribute on igc-select-item">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3" selected>Third</igc-select-item>

      <p slot="helper-text">
        If there are multiple items with the <code>selected</code> attribute,
        the last one will take precedence and set the initial value of the
        component.
      </p>
    </igc-select>

    <igc-select label="Both set on initial render" value=\${value}>
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>

      <p slot="helper-text">
        If both are set on initial render, then the
        <code>selected</code> attribute of the child (if any) item will take
        precedence over the <code>value</code> attribute of the select.
      </p>
    </igc-select>
  \`
}`,...(y=(v=a.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var k,x,S;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      .template {
        background-color: hsl(var(--ig-primary-A200));
        color: hsl(var(--ig-primary-A200-contrast));
        padding: 0.5rem;
      }

      igc-select::part(list) {
        max-height: 50vh;
      }
    </style>
    <igc-select label="Select component with all slots">
      <igc-icon name=\${github.name} slot="prefix"></igc-icon>
      <igc-icon name=\${github.name} slot="suffix"></igc-icon>

      <igc-icon name=\${arrowDownLeft.name} slot="toggle-icon"></igc-icon>
      <igc-icon name=\${arrowUpLeft.name} slot="toggle-icon-expanded"></igc-icon>

      <section class="template" slot="header">This is a header</section>
      <section class="template" slot="footer">This is a footer</section>

      <p slot="helper-text">Helper text</p>

      <igc-select-header>Tasks</igc-select-header>
      \${items}

      <igc-select-header>Countries</igc-select-header>
      \${countries.map(([continent, countries]) => html\`
          <igc-select-group>
            <igc-select-header slot="label">\${continent}</igc-select-header>
            \${countries.map(item => html\`
                <igc-select-item value=\${item.value} ?disabled=\${item.disabled}
                  >\${item.country}</igc-select-item
                >
              \`)}
          </igc-select-group>
        \`)}
    </igc-select>
  \`
}`,...(S=(x=o.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var O,C,T;r.parameters={...r.parameters,docs:{...(O=r.parameters)==null?void 0:O.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default select</legend>
          <igc-select
            value="bg"
            name="default-select"
            label="Countries (value through attribute)"
          >
            \${countries.map(([continent, countries]) => html\`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >\${continent}</igc-select-header
                  >
                  \${countries.map(item => html\`
                      <igc-select-item
                        value=\${item.value}
                        ?disabled=\${item.disabled}
                        >\${item.country}</igc-select-item
                      >
                    \`)}
                </igc-select-group>
              \`)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
          <igc-select
            name="default-select-2"
            label="Countries (value through selected item)"
          >
            \${countries.map(([continent, countries]) => html\`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >\${continent}</igc-select-header
                  >
                  \${countries.map(item => html\`
                      <igc-select-item
                        value=\${item.value}
                        ?selected=\${item.selected}
                        ?disabled=\${item.disabled}
                        >\${item.country}</igc-select-item
                      >
                    \`)}
                </igc-select-group>
              \`)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset>
          <legend>Required select</legend>
          <igc-select name="required-select" label="Countries" required>
            \${countries.map(([continent, countries]) => html\`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >\${continent}</igc-select-header
                  >
                  \${countries.map(item => html\`
                      <igc-select-item
                        value=\${item.value}
                        ?disabled=\${item.disabled}
                        >\${item.country}</igc-select-item
                      >
                    \`)}
                </igc-select-group>
              \`)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled form group</legend>
          <igc-select label="Countries">
            \${countries.map(([continent, countries]) => html\`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >\${continent}</igc-select-header
                  >
                  \${countries.map(item => html\`
                      <igc-select-item
                        value=\${item.value}
                        ?disabled=\${item.disabled}
                        >\${item.country}</igc-select-item
                      >
                    \`)}
                </igc-select-group>
              \`)}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(T=(C=r.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};const z=["Basic","WithGroups","InitialValue","Slots","Form"];export{i as Basic,r as Form,a as InitialValue,o as Slots,s as WithGroups,z as __namedExportsOrder,R as default};
