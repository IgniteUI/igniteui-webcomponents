import{x as i,b as D}from"./lit-element.Wy23cYDu.js";import{d as O,i as P,o as I,c as A,R as L}from"./defineComponents.DVY7fKDn.js";import{x as M,z as H}from"./health.B5ghXXgr.js";import{d as j,f as G,a as Z}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";const z=D`
<?xml version="1.0" ?>
<svg
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  width="100%"
  height="100%"
>
  <defs>
    <style>
      .cls-1 {
        fill: #da3380;
      }
      .cls-2 {
        fill: #f55fa6;
      }
      .cls-3 {
        fill: #6c2e7c;
      }
    </style>
  </defs>
  <g id="Icons">
    <path
      class="cls-1"
      d="M23,8c0,5-3,10-11,14C4,18,1,13,1,8a5.823,5.823,0,0,1,.37-2.05A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95,5.823,5.823,0,0,1,23,8Z"
    />
    <path
      class="cls-2"
      d="M22.63,5.95c-.96,3.782-3.9,7.457-9.7,10.567a1.984,1.984,0,0,1-1.864,0c-5.8-3.11-8.738-6.785-9.7-10.567A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95Z"
    />
  </g>
  <g data-name="Layer 4" id="Layer_4">
    <path
      class="cls-3"
      d="M17,1a6.98,6.98,0,0,0-5,2.1A7,7,0,0,0,0,8c0,4.16,2,10.12,11.553,14.9a1,1,0,0,0,.894,0C22,18.12,24,12.16,24,8A7.008,7.008,0,0,0,17,1ZM12,20.878C5.363,17.447,2,13.116,2,8a5,5,0,0,1,9.167-2.761,1.038,1.038,0,0,0,1.666,0A5,5,0,0,1,22,8C22,13.116,18.637,17.447,12,20.878Z"
    />
  </g>
</svg>
`,a={icons:[M,H],svg:z,emoji:["😣","😔","😐","🙂","😆"].map(e=>i`<igc-rating-symbol>
        <div>${e}</div>
        <div slot="empty">${e}</div>
      </igc-rating-symbol>`),hoverListener:e=>{const n=["Select a value","Terrible","Bad","Meh","Great","Superb"];document.getElementById("selection").textContent=`${n[Math.ceil(e.detail)]??"Unknown"}`},renderSymbols:(e,n)=>Array.from({length:e},()=>n())};O(L,A);a.icons.forEach(e=>P(e.name,e.value));const B={title:"Rating",component:"igc-rating",parameters:{docs:{description:{component:`Rating provides insight regarding others' opinions and experiences,
and can allow the user to submit a rating of their own`}},actions:{handles:["igcChange","igcHover"]}},argTypes:{max:{type:"number",description:`The maximum value for the rating.

If there are projected symbols, the maximum value will be resolved
based on the number of symbols.`,control:"number",table:{defaultValue:{summary:5}}},step:{type:"number",description:`The minimum value change allowed.

Valid values are in the interval between 0 and 1 inclusive.`,control:"number",table:{defaultValue:{summary:1}}},label:{type:"string",description:"The label of the control.",control:"text"},valueFormat:{type:"string",description:`A format string which sets aria-valuetext. Instances of '{0}' will be replaced
with the current value of the control and instances of '{1}' with the maximum value for the control.

Important for screen-readers and useful for localization.`,control:"text"},value:{type:"number",description:"The current value of the component",control:"number",table:{defaultValue:{summary:0}}},hoverPreview:{type:"boolean",description:"Sets hover preview behavior for the component",control:"boolean",table:{defaultValue:{summary:!1}}},readOnly:{type:"boolean",description:"Makes the control a readonly field.",control:"boolean",table:{defaultValue:{summary:!1}}},single:{type:"boolean",description:"Toggles single selection visual mode.",control:"boolean",table:{defaultValue:{summary:!1}}},allowReset:{type:"boolean",description:"Whether to reset the rating when the user selects the same value.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{max:5,step:1,value:0,hoverPreview:!1,readOnly:!1,single:!1,allowReset:!1,disabled:!1,invalid:!1}},m={args:{label:"Default rating"},render:({single:e,label:n,disabled:t,allowReset:s,hoverPreview:l,invalid:r,max:d,readOnly:o,step:g,value:c,valueFormat:$})=>i`<igc-rating
      label=${I(n)}
      ?single=${e}
      ?allow-reset=${s}
      ?hover-preview=${l}
      ?readonly=${o}
      ?invalid=${r}
      ?disabled=${t}
      .max=${d}
      .step=${g}
      .value=${c}
      .valueFormat=${$}
    ></igc-rating>`},v={args:{label:"Single selection",single:!0},render:({single:e,label:n,disabled:t,allowReset:s,hoverPreview:l,invalid:r,max:d,readOnly:o,step:g,value:c,valueFormat:$})=>i`<igc-rating
      label=${I(n)}
      ?single=${e}
      ?allow-reset=${s}
      ?hover-preview=${l}
      ?readonly=${o}
      ?invalid=${r}
      ?disabled=${t}
      .max=${d}
      .step=${g}
      .value=${c}
      .valueFormat=${$}
    ></igc-rating>`},u={render:({allowReset:e,disabled:n,hoverPreview:t,invalid:s,max:l,readOnly:r,single:d,step:o,value:g,valueFormat:c})=>i`
    <style>
      igc-rating {
        display: flex;
      }
    </style>

    <igc-rating
      label="Custom Icons"
      ?single=${d}
      ?allow-reset=${e}
      ?hover-preview=${t}
      ?readonly=${r}
      ?invalid=${s}
      ?disabled=${n}
      .max=${l}
      .step=${o}
      .value=${g}
      .valueFormat=${c}
    >
      ${a.renderSymbols(l,()=>i`
          <igc-rating-symbol>
            <igc-icon collection="default" name="bandage"></igc-icon>
            <igc-icon
              collection="default"
              name="bacteria"
              slot="empty"
            ></igc-icon>
          </igc-rating-symbol>
        `)}
    </igc-rating>

    <igc-rating
      label="SVG"
      ?single=${d}
      ?allow-reset=${e}
      ?hover-preview=${t}
      ?readonly=${r}
      ?invalid=${s}
      ?disabled=${n}
      .max=${l}
      .step=${o}
      .value=${g}
      .valueFormat=${c}
    >
      ${a.renderSymbols(l,()=>i`
          <igc-rating-symbol>
            <div>${a.svg}</div>
            <div slot="empty">${a.svg}</div>
          </igc-rating-symbol>
        `)}
    </igc-rating>

    <igc-rating
      label="Custom symbols with single selection"
      @igcChange=${a.hoverListener}
      @igcHover=${a.hoverListener}
      ?allow-reset=${e}
      ?disabled=${n}
      ?hover-preview=${t}
      ?readonly=${r}
      .step=${o}
      max="5"
      single
    >
      ${a.emoji}
      <p slot="value-label" id="selection">Select a value</p>
    </igc-rating>
  `},b={argTypes:j(B),render:()=>i`
      <form action="" @submit=${G}>
        <fieldset>
          <div>
            <igc-rating name="default-rating" label="Default"></igc-rating>
          </div>
          <div>
            <igc-rating
              name="single-select-rating"
              label="Single select"
              single
              value="1"
            >
              ${a.renderSymbols(5,()=>i`
                  <igc-rating-symbol>
                    <div>${a.svg}</div>
                    <div slot="empty">${a.svg}</div>
                  </igc-rating-symbol>
                `)}
            </igc-rating>
          </div>
          <div>
            <igc-rating
              name="default-value"
              label="With default value"
              max="7"
              step="0.25"
              value="3.5"
            ></igc-rating>
          </div>
        </fieldset>

        <fieldset>
          <igc-rating
            name="readonly-rating"
            label="Readonly"
            value="4"
            readonly
          ></igc-rating>
        </fieldset>

        <fieldset disabled>
          <igc-rating
            name="disabled-rating"
            value="2"
            label="Disabled"
          ></igc-rating>
        </fieldset>

        ${Z()}
      </form>
    `};var p,f,y;m.parameters={...m.parameters,docs:{...(p=m.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Default rating'
  },
  render: ({
    single,
    label,
    disabled,
    allowReset,
    hoverPreview,
    invalid,
    max,
    readOnly,
    step,
    value,
    valueFormat
  }) => html\`<igc-rating
      label=\${ifDefined(label)}
      ?single=\${single}
      ?allow-reset=\${allowReset}
      ?hover-preview=\${hoverPreview}
      ?readonly=\${readOnly}
      ?invalid=\${invalid}
      ?disabled=\${disabled}
      .max=\${max}
      .step=\${step}
      .value=\${value}
      .valueFormat=\${valueFormat}
    ></igc-rating>\`
}`,...(y=(f=m.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var h,w,x;v.parameters={...v.parameters,docs:{...(h=v.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Single selection',
    single: true
  },
  render: ({
    single,
    label,
    disabled,
    allowReset,
    hoverPreview,
    invalid,
    max,
    readOnly,
    step,
    value,
    valueFormat
  }) => html\`<igc-rating
      label=\${ifDefined(label)}
      ?single=\${single}
      ?allow-reset=\${allowReset}
      ?hover-preview=\${hoverPreview}
      ?readonly=\${readOnly}
      ?invalid=\${invalid}
      ?disabled=\${disabled}
      .max=\${max}
      .step=\${step}
      .value=\${value}
      .valueFormat=\${valueFormat}
    ></igc-rating>\`
}`,...(x=(w=v.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var S,C,F;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: ({
    allowReset,
    disabled,
    hoverPreview,
    invalid,
    max,
    readOnly,
    single,
    step,
    value,
    valueFormat
  }) => html\`
    <style>
      igc-rating {
        display: flex;
      }
    </style>

    <igc-rating
      label="Custom Icons"
      ?single=\${single}
      ?allow-reset=\${allowReset}
      ?hover-preview=\${hoverPreview}
      ?readonly=\${readOnly}
      ?invalid=\${invalid}
      ?disabled=\${disabled}
      .max=\${max}
      .step=\${step}
      .value=\${value}
      .valueFormat=\${valueFormat}
    >
      \${utils.renderSymbols(max, () => html\`
          <igc-rating-symbol>
            <igc-icon collection="default" name="bandage"></igc-icon>
            <igc-icon
              collection="default"
              name="bacteria"
              slot="empty"
            ></igc-icon>
          </igc-rating-symbol>
        \`)}
    </igc-rating>

    <igc-rating
      label="SVG"
      ?single=\${single}
      ?allow-reset=\${allowReset}
      ?hover-preview=\${hoverPreview}
      ?readonly=\${readOnly}
      ?invalid=\${invalid}
      ?disabled=\${disabled}
      .max=\${max}
      .step=\${step}
      .value=\${value}
      .valueFormat=\${valueFormat}
    >
      \${utils.renderSymbols(max, () => html\`
          <igc-rating-symbol>
            <div>\${utils.svg}</div>
            <div slot="empty">\${utils.svg}</div>
          </igc-rating-symbol>
        \`)}
    </igc-rating>

    <igc-rating
      label="Custom symbols with single selection"
      @igcChange=\${utils.hoverListener}
      @igcHover=\${utils.hoverListener}
      ?allow-reset=\${allowReset}
      ?disabled=\${disabled}
      ?hover-preview=\${hoverPreview}
      ?readonly=\${readOnly}
      .step=\${step}
      max="5"
      single
    >
      \${utils.emoji}
      <p slot="value-label" id="selection">Select a value</p>
    </igc-rating>
  \`
}`,...(F=(C=u.parameters)==null?void 0:C.docs)==null?void 0:F.source}}};var R,V,T;b.parameters={...b.parameters,docs:{...(R=b.parameters)==null?void 0:R.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <div>
            <igc-rating name="default-rating" label="Default"></igc-rating>
          </div>
          <div>
            <igc-rating
              name="single-select-rating"
              label="Single select"
              single
              value="1"
            >
              \${utils.renderSymbols(5, () => html\`
                  <igc-rating-symbol>
                    <div>\${utils.svg}</div>
                    <div slot="empty">\${utils.svg}</div>
                  </igc-rating-symbol>
                \`)}
            </igc-rating>
          </div>
          <div>
            <igc-rating
              name="default-value"
              label="With default value"
              max="7"
              step="0.25"
              value="3.5"
            ></igc-rating>
          </div>
        </fieldset>

        <fieldset>
          <igc-rating
            name="readonly-rating"
            label="Readonly"
            value="4"
            readonly
          ></igc-rating>
        </fieldset>

        <fieldset disabled>
          <igc-rating
            name="disabled-rating"
            value="2"
            label="Disabled"
          ></igc-rating>
        </fieldset>

        \${formControls()}
      </form>
    \`;
  }
}`,...(T=(V=b.parameters)==null?void 0:V.docs)==null?void 0:T.source}}};const N=["Default","SingleSelection","Slots","Form"];export{m as Default,b as Form,v as SingleSelection,u as Slots,N as __namedExportsOrder,B as default};
