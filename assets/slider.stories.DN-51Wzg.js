import{x as n}from"./lit-element.Wy23cYDu.js";import{d as v,L as $}from"./defineComponents.DVY7fKDn.js";import{d as l,f as T,a as x}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";v($);const s={title:"Slider",component:"igc-slider",parameters:{docs:{description:{component:"A slider component used to select numeric value within a range."}},actions:{handles:["igcInput","igcChange"]}},argTypes:{value:{type:"number",description:"The current value of the component.",control:"number"},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},min:{type:"number",description:"The minimum value of the slider scale. Defaults to 0.\n\nIf `min` is greater than `max` the call is a no-op.\n\nIf `labels` are provided (projected), then `min` is always set to 0.\n\nIf `lowerBound` ends up being less than than the current `min` value,\nit is automatically assigned the new `min` value.",control:"number"},max:{type:"number",description:"The maximum value of the slider scale. Defaults to 100.\n\nIf `max` is less than `min` the call is a no-op.\n\nIf `labels` are provided (projected), then `max` is always set to\nthe number of labels.\n\nIf `upperBound` ends up being greater than than the current `max` value,\nit is automatically assigned the new `max` value.",control:"number"},lowerBound:{type:"number",description:"The lower bound of the slider value. If not set, the `min` value is applied.",control:"number"},upperBound:{type:"number",description:"The upper bound of the slider value. If not set, the `max` value is applied.",control:"number"},discreteTrack:{type:"boolean",description:"Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.",control:"boolean",table:{defaultValue:{summary:!1}}},hideTooltip:{type:"boolean",description:"Hides the thumb tooltip.",control:"boolean",table:{defaultValue:{summary:!1}}},step:{type:"number",description:`Specifies the granularity that the value must adhere to.

If set to 0 no stepping is implied and any value in the range is allowed.
If \`labels\` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.`,control:"number"},primaryTicks:{type:"number",description:"The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.",control:"number",table:{defaultValue:{summary:0}}},secondaryTicks:{type:"number",description:"The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.",control:"number",table:{defaultValue:{summary:0}}},tickOrientation:{type:'"mirror" | "start" | "end"',description:"Changes the orientation of the ticks.",options:["mirror","start","end"],control:{type:"inline-radio"},table:{defaultValue:{summary:"end"}}},hidePrimaryLabels:{type:"boolean",description:"Hides the primary tick labels.",control:"boolean",table:{defaultValue:{summary:!1}}},hideSecondaryLabels:{type:"boolean",description:"Hides the secondary tick labels.",control:"boolean",table:{defaultValue:{summary:!1}}},locale:{type:"string",description:"The locale used to format the thumb and tick label values in the slider.",control:"text",table:{defaultValue:{summary:"en"}}},valueFormat:{type:"string",description:"String format used for the thumb and tick label values in the slider.",control:"text"},tickLabelRotation:{type:"0 | 90 | -90",description:"The degrees for the rotation of the tick labels. Defaults to 0.",options:["0","90","-90"],control:{type:"inline-radio"},table:{defaultValue:{summary:"0"}}}},args:{disabled:!1,invalid:!1,discreteTrack:!1,hideTooltip:!1,primaryTicks:0,secondaryTicks:0,tickOrientation:"end",hidePrimaryLabels:!1,hideSecondaryLabels:!1,locale:"en",tickLabelRotation:"0"}},a={render:e=>n`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>
    <igc-slider
      aria-label="Default slider"
      ?disabled=${e.disabled}
      ?discrete-track=${e.discreteTrack}
      ?hide-tooltip=${e.hideTooltip}
      ?hide-primary-labels=${e.hidePrimaryLabels}
      ?hide-secondary-labels=${e.hideSecondaryLabels}
      .step=${e.step}
      .value=${e.value}
      .min=${e.min}
      .max=${e.max}
      .locale=${e.locale}
      .lowerBound=${e.lowerBound}
      .upperBound=${e.upperBound}
      .primaryTicks=${e.primaryTicks}
      .secondaryTicks=${e.secondaryTicks}
      .tickOrientation=${e.tickOrientation}
      .tickLabelRotation=${e.tickLabelRotation}
      .valueFormat=${e.valueFormat}
    ></igc-slider>
  `},F={style:"currency",currency:"USD",minimumFractionDigits:2},D={style:"unit",unit:"kilometer",minimumFractionDigits:2},w={style:"unit",unit:"celsius",maximumFractionDigits:2},i={argTypes:l(s),parameters:{actions:{handles:["igcChange"]}},render:()=>n`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>

    <igc-slider
      aria-label="Currency"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=${F}
    ></igc-slider>

    <igc-slider
      aria-label="Distance"
      value-format="Distance: {0}"
      locale="fr"
      .valueFormatOptions=${D}
    ></igc-slider>

    <igc-slider
      aria-label="Temperature"
      step="0"
      value="26"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=${w}
      min="-273"
      max="273"
    ></igc-slider>
  `},r={argTypes:l(s),render:()=>n`
    <igc-slider
      style="max-width: 300px; margin-top: 40px"
      aria-label="Priority"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Low</igc-slider-label>
      <igc-slider-label>Medium</igc-slider-label>
      <igc-slider-label>High</igc-slider-label>
    </igc-slider>
  `},t={argTypes:l(s),render:()=>n`
      <form action="" @submit=${T}>
        <fieldset>
          <legend>Default</legend>
          <igc-slider
            aria-label="Default"
            name="default-slider"
            value="77"
          ></igc-slider>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-slider
            aria-label="Default"
            name="disabled-slider"
            value="50"
          ></igc-slider>
        </fieldset>
        ${x()}
      </form>
    `};var o,d,c;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => html\`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>
    <igc-slider
      aria-label="Default slider"
      ?disabled=\${args.disabled}
      ?discrete-track=\${args.discreteTrack}
      ?hide-tooltip=\${args.hideTooltip}
      ?hide-primary-labels=\${args.hidePrimaryLabels}
      ?hide-secondary-labels=\${args.hideSecondaryLabels}
      .step=\${args.step}
      .value=\${args.value}
      .min=\${args.min}
      .max=\${args.max}
      .locale=\${args.locale}
      .lowerBound=\${args.lowerBound}
      .upperBound=\${args.upperBound}
      .primaryTicks=\${args.primaryTicks}
      .secondaryTicks=\${args.secondaryTicks}
      .tickOrientation=\${args.tickOrientation}
      .tickLabelRotation=\${args.tickLabelRotation}
      .valueFormat=\${args.valueFormat}
    ></igc-slider>
  \`
}`,...(c=(d=a.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var m,u,p;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  parameters: {
    actions: {
      handles: ['igcChange']
    }
  },
  render: () => html\`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>

    <igc-slider
      aria-label="Currency"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=\${currencyFormat}
    ></igc-slider>

    <igc-slider
      aria-label="Distance"
      value-format="Distance: {0}"
      locale="fr"
      .valueFormatOptions=\${distanceFormat}
    ></igc-slider>

    <igc-slider
      aria-label="Temperature"
      step="0"
      value="26"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=\${temperatureFormat}
      min="-273"
      max="273"
    ></igc-slider>
  \`
}`,...(p=(u=i.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var b,y,g;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => html\`
    <igc-slider
      style="max-width: 300px; margin-top: 40px"
      aria-label="Priority"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Low</igc-slider-label>
      <igc-slider-label>Medium</igc-slider-label>
      <igc-slider-label>High</igc-slider-label>
    </igc-slider>
  \`
}`,...(g=(y=r.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var h,f,k;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html\`
      <form action="" @submit=\${formSubmitHandler}>
        <fieldset>
          <legend>Default</legend>
          <igc-slider
            aria-label="Default"
            name="default-slider"
            value="77"
          ></igc-slider>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-slider
            aria-label="Default"
            name="disabled-slider"
            value="50"
          ></igc-slider>
        </fieldset>
        \${formControls()}
      </form>
    \`;
  }
}`,...(k=(f=t.parameters)==null?void 0:f.docs)==null?void 0:k.source}}};const H=["Default","ValueFormat","Labels","Form"];export{a as Default,t as Form,r as Labels,i as ValueFormat,H as __namedExportsOrder,s as default};
