import{x as n}from"./lit-element.Wy23cYDu.js";import{d as g,s as m,o as h}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";g(m);const x={title:"Dialog",component:"igc-dialog",parameters:{docs:{description:{component:"Represents a Dialog component."}},actions:{handles:["igcClosing","igcClosed"]}},argTypes:{keepOpenOnEscape:{type:"boolean",description:"Whether the dialog should be kept open when pressing the 'ESCAPE' button.",control:"boolean",table:{defaultValue:{summary:!1}}},closeOnOutsideClick:{type:"boolean",description:"Whether the dialog should be closed when clicking outside of it.",control:"boolean",table:{defaultValue:{summary:!1}}},hideDefaultAction:{type:"boolean",description:`Whether to hide the default action button for the dialog.

When there is projected content in the \`footer\` slot this property
has no effect.`,control:"boolean",table:{defaultValue:{summary:!1}}},open:{type:"boolean",description:"Whether the dialog is opened.",control:"boolean",table:{defaultValue:{summary:!1}}},title:{type:"string",description:"Sets the title of the dialog.",control:"text"}},args:{keepOpenOnEscape:!1,closeOnOutsideClick:!1,hideDefaultAction:!1,open:!1}},o=e=>document.getElementById(e).show(),a=e=>document.getElementById(e).hide(),f=["Basic","Bearer","Digest","OAuth"],b=e=>{e.target.querySelector("igc-input").value=e.detail.value},y=({keepOpenOnEscape:e,closeOnOutsideClick:i,title:d,open:r,hideDefaultAction:p})=>n`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px; gap: 1rem"
    >
      <igc-button @click=${()=>o("default")}
        >Default dialog</igc-button
      >
      <igc-button @click=${()=>o("projected")}
        >Projected content</igc-button
      >

      <igc-button @click=${()=>o("with-form")}>With Form</igc-button>

      <igc-dialog
        id="default"
        ?keep-open-on-escape=${e}
        ?close-on-outside-click=${i}
        ?hide-default-action=${p}
        .open=${r}
        title=${h(d)}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Possimus rerum
        enim, incidunt magni ea asperiores laudantium, ducimus itaque quisquam
        dolore hic labore facere qui unde aliquam, dignissimos perspiciatis?
        Iusto, iure.
      </igc-dialog>

      <igc-dialog
        id="projected"
        ?keep-open-on-escape=${e}
        ?close-on-outside-click=${i}
      >
        <h4 slot="title">Danger</h4>
        <p>Doing this action is irrevocable?</p>
        <igc-button
          slot="footer"
          @click=${()=>a("projected")}
          variant="flat"
          >Cancel</igc-button
        >
        <igc-button
          slot="footer"
          @click=${()=>a("projected")}
          variant="contained"
          >OK</igc-button
        >
      </igc-dialog>

      <igc-dialog
        id="with-form"
        hide-default-action
        ?keep-open-on-escape=${e}
        ?close-on-outside-click=${i}
      >
        <h3 slot="title">Your credentials</h3>
        <div>
          <igc-form method="dialog">
            <div style="display: flex; flex-flow: column; gap: 1rem">
              <igc-input outlined label="Username"></igc-input>
              <igc-input outlined label="Password" type="password"></igc-input>
              <igc-dropdown flip same-width @igcChange=${b}>
                <igc-input
                  style="width: 100%"
                  outlined
                  label="Method"
                  slot="target"
                ></igc-input>
                ${f.map(u=>n`<igc-dropdown-item>${u}</igc-dropdown-item>`)}
              </igc-dropdown>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem">
              <igc-button type="reset" variant="flat">Reset</igc-button>
              <igc-button type="submit" variant="flat">Confirm</igc-button>
            </div>
          </igc-form>
        </div>
      </igc-dialog>
    </div>
  `,t=y.bind({});var l,c,s;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`({
  keepOpenOnEscape,
  closeOnOutsideClick,
  title,
  open,
  hideDefaultAction
}: IgcDialogComponent) => {
  return html\`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px; gap: 1rem"
    >
      <igc-button @click=\${() => openDialog('default')}
        >Default dialog</igc-button
      >
      <igc-button @click=\${() => openDialog('projected')}
        >Projected content</igc-button
      >

      <igc-button @click=\${() => openDialog('with-form')}>With Form</igc-button>

      <igc-dialog
        id="default"
        ?keep-open-on-escape=\${keepOpenOnEscape}
        ?close-on-outside-click=\${closeOnOutsideClick}
        ?hide-default-action=\${hideDefaultAction}
        .open=\${open}
        title=\${ifDefined(title)}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Possimus rerum
        enim, incidunt magni ea asperiores laudantium, ducimus itaque quisquam
        dolore hic labore facere qui unde aliquam, dignissimos perspiciatis?
        Iusto, iure.
      </igc-dialog>

      <igc-dialog
        id="projected"
        ?keep-open-on-escape=\${keepOpenOnEscape}
        ?close-on-outside-click=\${closeOnOutsideClick}
      >
        <h4 slot="title">Danger</h4>
        <p>Doing this action is irrevocable?</p>
        <igc-button
          slot="footer"
          @click=\${() => closeDialog('projected')}
          variant="flat"
          >Cancel</igc-button
        >
        <igc-button
          slot="footer"
          @click=\${() => closeDialog('projected')}
          variant="contained"
          >OK</igc-button
        >
      </igc-dialog>

      <igc-dialog
        id="with-form"
        hide-default-action
        ?keep-open-on-escape=\${keepOpenOnEscape}
        ?close-on-outside-click=\${closeOnOutsideClick}
      >
        <h3 slot="title">Your credentials</h3>
        <div>
          <igc-form method="dialog">
            <div style="display: flex; flex-flow: column; gap: 1rem">
              <igc-input outlined label="Username"></igc-input>
              <igc-input outlined label="Password" type="password"></igc-input>
              <igc-dropdown flip same-width @igcChange=\${authSelected}>
                <igc-input
                  style="width: 100%"
                  outlined
                  label="Method"
                  slot="target"
                ></igc-input>
                \${authMethods.map(each => html\`<igc-dropdown-item>\${each}</igc-dropdown-item>\`)}
              </igc-dropdown>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem">
              <igc-button type="reset" variant="flat">Reset</igc-button>
              <igc-button type="submit" variant="flat">Confirm</igc-button>
            </div>
          </igc-form>
        </div>
      </igc-dialog>
    </div>
  \`;
}`,...(s=(c=t.parameters)==null?void 0:c.docs)==null?void 0:s.source}}};const C=["Basic"];export{t as Basic,C as __namedExportsOrder,x as default};
