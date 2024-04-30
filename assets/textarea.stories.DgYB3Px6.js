import{o as v}from"./programming.bPQtr2JT.js";import{x as m}from"./lit-element.Wy23cYDu.js";import{d as y,i as w,c as T,O as I}from"./defineComponents.DVY7fKDn.js";import{d as D,f as q,a as C}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";y(I,T);w("source-code",v.value);const M={title:"Textarea",component:"igc-textarea",parameters:{docs:{description:{component:`This element represents a multi-line plain-text editing control,
useful when you want to allow users to enter a sizeable amount of free-form text,
for example a comment on a review or feedback form.`}},actions:{handles:["igcInput","igcChange","igcFocus","igcBlur"]}},argTypes:{autocomplete:{type:"string",description:`Specifies what if any permission the browser has to provide for automated assistance in filling out form field values,
as well as guidance to the browser as to the type of information expected in the field.
Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.`,control:"text"},autocapitalize:{type:'"off" | "none" | "on" | "sentences" | "words" | "characters"',description:`Controls whether and how text input is automatically capitalized as it is entered/edited by the user.

[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).`,options:["off","none","on","sentences","words","characters"],control:{type:"select"}},inputMode:{type:'"none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"',description:`Hints at the type of data that might be entered by the user while editing the element or its contents.
This allows a browser to display an appropriate virtual keyboard.

[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)`,options:["none","text","decimal","numeric","tel","search","email","url"],control:{type:"select"}},label:{type:"string",description:"The label for the control.",control:"text"},maxLength:{type:"number",description:`The maximum number of characters (UTF-16 code units) that the user can enter.
If this value isn't specified, the user can enter an unlimited number of characters.`,control:"number"},minLength:{type:"number",description:"The minimum number of characters (UTF-16 code units) required that the user should enter.",control:"number"},outlined:{type:"boolean",description:"Whether the control will have outlined appearance.",control:"boolean",table:{defaultValue:{summary:!1}}},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},readOnly:{type:"boolean",description:"Makes the control a readonly field.",control:"boolean",table:{defaultValue:{summary:!1}}},resize:{type:'"auto" | "vertical" | "none"',description:"Controls whether the control can be resized.\nWhen `auto` is set, the control will try to expand and fit its content.",options:["auto","vertical","none"],control:{type:"inline-radio"},table:{defaultValue:{summary:"vertical"}}},rows:{type:"number",description:`The number of visible text lines for the control. If it is specified, it must be a positive integer.
If it is not specified, the default value is 2.`,control:"number",table:{defaultValue:{summary:2}}},value:{type:"string",description:"The value of the component",control:"text",table:{defaultValue:{summary:""}}},spellcheck:{type:"boolean",description:"Controls whether the element may be checked for spelling errors.",control:"boolean",table:{defaultValue:{summary:!0}}},wrap:{type:'"hard" | "soft" | "off"',description:`Indicates how the control should wrap the value for form submission.
Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
for explanation of the available values.`,options:["hard","soft","off"],control:{type:"inline-radio"},table:{defaultValue:{summary:"soft"}}},validateOnly:{type:"boolean",description:"Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property\nwhen it is defined.",control:"boolean",table:{defaultValue:{summary:!1}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{outlined:!1,readOnly:!1,resize:"vertical",rows:2,value:"",spellcheck:!0,wrap:"soft",validateOnly:!1,required:!1,disabled:!1,invalid:!1}},e={args:{label:"Your feedback"}},t={render:({rows:u,resize:h,required:f,disabled:g,outlined:b},{globals:{direction:x}})=>m`
      <igc-textarea
        id="comment"
        dir=${x}
        spellcheck="false"
        .outlined=${b}
        autofocus
        label="Leave your comment"
        .rows=${u}
        .resize=${h}
        .required=${f}
        .disabled=${g}
      >
        <igc-icon
          name="source-code"
          aria-hidden="true"
          slot="prefix"
        ></igc-icon>
        <p>Hello world!</p>
        <span slot="helper-text">Helper text</span>
      </igc-textarea>
    `},a={argTypes:D(M),render:()=>m`
      <form action="" @submit=${q}>
        <fieldset>
          <igc-textarea name="textarea-default" label="Default">
            <p slot="helper-text">
              Default state. No initial value and no validation.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-initial-value"
            label="Initial value (binding)"
            value="Hello world!"
          >
            <p slot="helper-text">
              Initial value bound through property and no validation.Resetting
              the form will restore the initial value.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-initial-projected"
            label="Initial value (slot)"
          >
            Hello world!
            <p slot="helper-text">
              Initial value bound through text projection and no
              validation.Resetting the form will restore the initial value.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset disabled>
          <igc-textarea
            name="textarea-disabled"
            value="I'm disabled"
            label="Disabled"
          >
            <div slot="helper-text">
              <p>
                Disabled state. <strong>Does not</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-readonly"
            value="Can't edit me..."
            readonly
            label="Readonly"
          >
            <div slot="helper-text">
              <p>
                Read-only state. <strong>Does</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea name="textarea-required" label="Required" required>
            <p slot="helper-text">With required validator.</p>
          </igc-textarea>

          <igc-textarea
            name="textarea-min-length"
            label="Minimum length (3)"
            minlength="3"
            ><p slot="helper-text">
              With minimum length validator.
            </p></igc-textarea
          >

          <igc-textarea
            name="textarea-max-length"
            label="Maximum length (8)"
            maxlength="8"
          >
            <p slot="helper-text">
              With maximum length validator. Since validate-only is not applied,
              typing in the input beyond the maximum length is not possible.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-max-length-soft"
            label="Maximum length (8) validate-only"
            maxlength="8"
            validate-only
          >
            <p slot="helper-text">
              With maximum length validator and validate-only applied. Typing in
              the input beyond the maximum length is possible and will
              invalidate the input.
            </p>
          </igc-textarea>
        </fieldset>
        ${C()}
      </form>
    `};var n,i,l;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    label: 'Your feedback'
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var o,r,s;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: ({
    rows,
    resize,
    required,
    disabled,
    outlined
  }, {
    globals: {
      direction
    }
  }) => {
    return html\`
      <igc-textarea
        id="comment"
        dir=\${direction}
        spellcheck="false"
        .outlined=\${outlined}
        autofocus
        label="Leave your comment"
        .rows=\${rows}
        .resize=\${resize}
        .required=\${required}
        .disabled=\${disabled}
      >
        <igc-icon
          name="source-code"
          aria-hidden="true"
          slot="prefix"
        ></igc-icon>
        <p>Hello world!</p>
        <span slot="helper-text">Helper text</span>
      </igc-textarea>
    \`;
  }
}`,...(s=(r=t.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};var d,p,c;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <igc-textarea name="textarea-default" label="Default">
            <p slot="helper-text">
              Default state. No initial value and no validation.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-initial-value"
            label="Initial value (binding)"
            value="Hello world!"
          >
            <p slot="helper-text">
              Initial value bound through property and no validation.Resetting
              the form will restore the initial value.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-initial-projected"
            label="Initial value (slot)"
          >
            Hello world!
            <p slot="helper-text">
              Initial value bound through text projection and no
              validation.Resetting the form will restore the initial value.
            </p>
          </igc-textarea>
        </fieldset>

        <fieldset disabled>
          <igc-textarea
            name="textarea-disabled"
            value="I'm disabled"
            label="Disabled"
          >
            <div slot="helper-text">
              <p>
                Disabled state. <strong>Does not</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea
            name="textarea-readonly"
            value="Can't edit me..."
            readonly
            label="Readonly"
          >
            <div slot="helper-text">
              <p>
                Read-only state. <strong>Does</strong> participate in form
                submission.
              </p>
            </div>
          </igc-textarea>
        </fieldset>

        <fieldset>
          <igc-textarea name="textarea-required" label="Required" required>
            <p slot="helper-text">With required validator.</p>
          </igc-textarea>

          <igc-textarea
            name="textarea-min-length"
            label="Minimum length (3)"
            minlength="3"
            ><p slot="helper-text">
              With minimum length validator.
            </p></igc-textarea
          >

          <igc-textarea
            name="textarea-max-length"
            label="Maximum length (8)"
            maxlength="8"
          >
            <p slot="helper-text">
              With maximum length validator. Since validate-only is not applied,
              typing in the input beyond the maximum length is not possible.
            </p>
          </igc-textarea>

          <igc-textarea
            name="textarea-max-length-soft"
            label="Maximum length (8) validate-only"
            maxlength="8"
            validate-only
          >
            <p slot="helper-text">
              With maximum length validator and validate-only applied. Typing in
              the input beyond the maximum length is possible and will
              invalidate the input.
            </p>
          </igc-textarea>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(c=(p=a.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const L=["Default","ProjectContent","Form"];export{e as Default,a as Form,t as ProjectContent,L as __namedExportsOrder,M as default};
