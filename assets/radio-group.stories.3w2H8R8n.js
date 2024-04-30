import{x as r}from"./lit-element.Wy23cYDu.js";import{d as p,o as a,x as f}from"./defineComponents.DVY7fKDn.js";import{f as $,a as v}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";p(f);const b={title:"RadioGroup",component:"igc-radio-group",parameters:{docs:{description:{component:"The igc-radio-group component unifies one or more igc-radio buttons."}}},argTypes:{alignment:{type:'"vertical" | "horizontal"',description:"Alignment of the radio controls inside this group.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"vertical"}}}},args:{alignment:"vertical"}};Object.assign(b.parameters,{actions:{handles:["igcChange","igcFocus","igcBlur"]}});const n=["apple","orange","mango","banana"],o=i=>i.replace(/^\w/,e=>e.toUpperCase()),h=({alignment:i})=>r`
    <igc-radio-group alignment="${a(i)}">
      ${n.map(e=>r`<igc-radio name="fruit" value=${e}>${o(e)}</igc-radio> `)}
    </igc-radio-group>
  `,t=h.bind({}),d={render:i=>r`
      <form action="" @submit=${$}>
        <fieldset>
          <legend>Default</legend>
          <igc-radio-group alignment=${a(i.alignment)}>
            ${n.map(e=>r`<igc-radio name="default-fruit" value=${e}
                  >${o(e)}</igc-radio
                >`)}
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Same name scattered outside of group</legend>
          <igc-radio name="scattered-fruit" value="apple">Apple</igc-radio>
          <igc-radio-group alignment=${a(i.alignment)}>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore
              dolorum, corporis exercitationem laborum dignissimos sunt itaque
              ducimus, soluta blanditiis inventore est quae provident dolores,
              labore asperiores totam voluptate et minima.
            </p>
            <igc-radio name="scattered-fruit" value="banana">Banana</igc-radio>
            <igc-radio name="scattered-fruit" value="lemon">Lemon</igc-radio>
            <igc-input label="Search..."></igc-input>
            <igc-radio name="scattered-fruit" value="orange">Orange</igc-radio>
          </igc-radio-group>
          <p>...</p>
          <igc-radio-group alignment=${a(i.alignment)}>
            <igc-radio name="scattered-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
            <igc-radio name="scattered-fruit" value="strawberry"
              >Strawberry</igc-radio
            >
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Initial value</legend>
          <igc-radio-group alignment=${a(i.alignment)}>
            ${n.map(e=>r`<igc-radio name="initial-fruit" checked value=${e}
                  >${o(e)}</igc-radio
                >`)}
          </igc-radio-group>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-radio-group alignment=${a(i.alignment)}>
            ${n.map(e=>r`<igc-radio name="default-fruit" value=${e}
                  >${o(e)}</igc-radio
                >`)}
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Required</legend>
          <igc-radio-group alignment=${a(i.alignment)}>
            ${n.map(e=>r`<igc-radio name="required-fruit" required value=${e}
                  >${o(e)}</igc-radio
                >`)}
            <igc-radio name="required-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
          </igc-radio-group>
        </fieldset>
        ${v()}
      </form>
    `};var g,l,c;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:'({\n  alignment\n}: IgcRadioGroupArgs) => {\n  return html`\n    <igc-radio-group alignment="${ifDefined(alignment)}">\n      ${radios.map(v => html`<igc-radio name="fruit" value=${v}>${titleCase(v)}</igc-radio> `)}\n    </igc-radio-group>\n  `;\n}',...(c=(l=t.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var m,s,u;d.parameters={...d.parameters,docs:{...(m=d.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default</legend>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            \${radios.map(e => html\`<igc-radio name="default-fruit" value=\${e}
                  >\${titleCase(e)}</igc-radio
                >\`)}
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Same name scattered outside of group</legend>
          <igc-radio name="scattered-fruit" value="apple">Apple</igc-radio>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore
              dolorum, corporis exercitationem laborum dignissimos sunt itaque
              ducimus, soluta blanditiis inventore est quae provident dolores,
              labore asperiores totam voluptate et minima.
            </p>
            <igc-radio name="scattered-fruit" value="banana">Banana</igc-radio>
            <igc-radio name="scattered-fruit" value="lemon">Lemon</igc-radio>
            <igc-input label="Search..."></igc-input>
            <igc-radio name="scattered-fruit" value="orange">Orange</igc-radio>
          </igc-radio-group>
          <p>...</p>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            <igc-radio name="scattered-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
            <igc-radio name="scattered-fruit" value="strawberry"
              >Strawberry</igc-radio
            >
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Initial value</legend>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            \${radios.map(e => html\`<igc-radio name="initial-fruit" checked value=\${e}
                  >\${titleCase(e)}</igc-radio
                >\`)}
          </igc-radio-group>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            \${radios.map(e => html\`<igc-radio name="default-fruit" value=\${e}
                  >\${titleCase(e)}</igc-radio
                >\`)}
          </igc-radio-group>
        </fieldset>
        <fieldset>
          <legend>Required</legend>
          <igc-radio-group alignment=\${ifDefined(args.alignment)}>
            \${radios.map(e => html\`<igc-radio name="required-fruit" required value=\${e}
                  >\${titleCase(e)}</igc-radio
                >\`)}
            <igc-radio name="required-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
          </igc-radio-group>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(u=(s=d.parameters)==null?void 0:s.docs)==null?void 0:u.source}}};const w=["Basic","Form"];export{t as Basic,d as Form,w as __namedExportsOrder,b as default};
