import{x as l}from"./lit-element.Wy23cYDu.js";import{d as g,K as y}from"./defineComponents.DVY7fKDn.js";import{d as b}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";g(y);const h={title:"RangeSlider",component:"igc-range-slider",parameters:{docs:{description:{component:"A range slider component used to select two numeric values within a range."}},actions:{handles:["igcInput","igcChange"]}},argTypes:{lower:{type:"number",description:"The current value of the lower thumb.",control:"number"},upper:{type:"number",description:"The current value of the upper thumb.",control:"number"},thumbLabelLower:{type:"string",description:"The aria label for the lower thumb.",control:"text"},thumbLabelUpper:{type:"string",description:"The aria label for the upper thumb.",control:"text"},min:{type:"number",description:"The minimum value of the slider scale. Defaults to 0.\n\nIf `min` is greater than `max` the call is a no-op.\n\nIf `labels` are provided (projected), then `min` is always set to 0.\n\nIf `lowerBound` ends up being less than than the current `min` value,\nit is automatically assigned the new `min` value.",control:"number"},max:{type:"number",description:"The maximum value of the slider scale. Defaults to 100.\n\nIf `max` is less than `min` the call is a no-op.\n\nIf `labels` are provided (projected), then `max` is always set to\nthe number of labels.\n\nIf `upperBound` ends up being greater than than the current `max` value,\nit is automatically assigned the new `max` value.",control:"number"},lowerBound:{type:"number",description:"The lower bound of the slider value. If not set, the `min` value is applied.",control:"number"},upperBound:{type:"number",description:"The upper bound of the slider value. If not set, the `max` value is applied.",control:"number"},disabled:{type:"boolean",description:"Disables the UI interactions of the slider.",control:"boolean",table:{defaultValue:{summary:!1}}},discreteTrack:{type:"boolean",description:"Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.",control:"boolean",table:{defaultValue:{summary:!1}}},hideTooltip:{type:"boolean",description:"Hides the thumb tooltip.",control:"boolean",table:{defaultValue:{summary:!1}}},step:{type:"number",description:`Specifies the granularity that the value must adhere to.

If set to 0 no stepping is implied and any value in the range is allowed.
If \`labels\` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.`,control:"number"},primaryTicks:{type:"number",description:"The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.",control:"number",table:{defaultValue:{summary:0}}},secondaryTicks:{type:"number",description:"The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.",control:"number",table:{defaultValue:{summary:0}}},tickOrientation:{type:'"mirror" | "start" | "end"',description:"Changes the orientation of the ticks.",options:["mirror","start","end"],control:{type:"inline-radio"},table:{defaultValue:{summary:"end"}}},hidePrimaryLabels:{type:"boolean",description:"Hides the primary tick labels.",control:"boolean",table:{defaultValue:{summary:!1}}},hideSecondaryLabels:{type:"boolean",description:"Hides the secondary tick labels.",control:"boolean",table:{defaultValue:{summary:!1}}},locale:{type:"string",description:"The locale used to format the thumb and tick label values in the slider.",control:"text",table:{defaultValue:{summary:"en"}}},valueFormat:{type:"string",description:"String format used for the thumb and tick label values in the slider.",control:"text"},tickLabelRotation:{type:"0 | 90 | -90",description:"The degrees for the rotation of the tick labels. Defaults to 0.",options:["0","90","-90"],control:{type:"inline-radio"},table:{defaultValue:{summary:"0"}}}},args:{disabled:!1,discreteTrack:!1,hideTooltip:!1,primaryTicks:0,secondaryTicks:0,tickOrientation:"end",hidePrimaryLabels:!1,hideSecondaryLabels:!1,locale:"en",tickLabelRotation:"0"}},r={args:{thumbLabelLower:"Default slider lower thumb",thumbLabelUpper:"Default slider upper thumb",lower:0,upper:25},render:e=>l`
    <style>
      igc-range-slider {
        padding: 60px;
      }
    </style>
    <igc-range-slider
      .thumbLabelLower=${e.thumbLabelLower}
      .thumbLabelUpper=${e.thumbLabelUpper}
      .lower=${e.lower}
      .upper=${e.upper}
      ?disabled=${e.disabled}
      ?discrete-track=${e.discreteTrack}
      ?hide-tooltip=${e.hideTooltip}
      ?hide-primary-labels=${e.hidePrimaryLabels}
      ?hide-secondary-labels=${e.hideSecondaryLabels}
      .step=${e.step}
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
    ></igc-range-slider>
  `},f={style:"currency",currency:"USD",minimumFractionDigits:2},w={style:"unit",unit:"kilometer",minimumFractionDigits:2},k={style:"unit",unit:"celsius",maximumFractionDigits:2},a={argTypes:b(h),parameters:{actions:{handles:["igcChange"]}},render:()=>l`
    <style>
      igc-range-slider {
        padding: 60px;
      }
    </style>

    <igc-range-slider
      thumb-label-lower="Currency low"
      thumb-label-upper="Currency high"
      lower="10"
      upper="50"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=${f}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Distance low"
      thumb-label-upper="Distance high"
      value-format="Distance: {0}"
      .valueFormatOptions=${w}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Temperature low"
      thumb-label-upper="Temperature high"
      step="1"
      lower="0"
      upper="37"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=${k}
      min="-273"
      max="273"
    ></igc-range-slider>
  `},t={argTypes:b(h),render:()=>l`
    <igc-range-slider
      style="padding: 60px"
      thumb-label-lower="Severity level low"
      thumb-label-upper="Severity level high"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Debugging</igc-slider-label>
      <igc-slider-label>Informational</igc-slider-label>
      <igc-slider-label>Notification</igc-slider-label>
      <igc-slider-label>Warning</igc-slider-label>
      <igc-slider-label>Error</igc-slider-label>
      <igc-slider-label>Critical</igc-slider-label>
      <igc-slider-label>Alert</igc-slider-label>
      <igc-slider-label>Emergency</igc-slider-label>
    </igc-range-slider>
  `};var i,n,s;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    thumbLabelLower: 'Default slider lower thumb',
    thumbLabelUpper: 'Default slider upper thumb',
    lower: 0,
    upper: 25
  },
  render: args => html\`
    <style>
      igc-range-slider {
        padding: 60px;
      }
    </style>
    <igc-range-slider
      .thumbLabelLower=\${args.thumbLabelLower}
      .thumbLabelUpper=\${args.thumbLabelUpper}
      .lower=\${args.lower}
      .upper=\${args.upper}
      ?disabled=\${args.disabled}
      ?discrete-track=\${args.discreteTrack}
      ?hide-tooltip=\${args.hideTooltip}
      ?hide-primary-labels=\${args.hidePrimaryLabels}
      ?hide-secondary-labels=\${args.hideSecondaryLabels}
      .step=\${args.step}
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
    ></igc-range-slider>
  \`
}`,...(s=(n=r.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};var o,c,d;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  parameters: {
    actions: {
      handles: ['igcChange']
    }
  },
  render: () => html\`
    <style>
      igc-range-slider {
        padding: 60px;
      }
    </style>

    <igc-range-slider
      thumb-label-lower="Currency low"
      thumb-label-upper="Currency high"
      lower="10"
      upper="50"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=\${currencyFormat}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Distance low"
      thumb-label-upper="Distance high"
      value-format="Distance: {0}"
      .valueFormatOptions=\${distanceFormat}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Temperature low"
      thumb-label-upper="Temperature high"
      step="1"
      lower="0"
      upper="37"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=\${temperatureFormat}
      min="-273"
      max="273"
    ></igc-range-slider>
  \`
}`,...(d=(c=a.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var u,p,m;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => html\`
    <igc-range-slider
      style="padding: 60px"
      thumb-label-lower="Severity level low"
      thumb-label-upper="Severity level high"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Debugging</igc-slider-label>
      <igc-slider-label>Informational</igc-slider-label>
      <igc-slider-label>Notification</igc-slider-label>
      <igc-slider-label>Warning</igc-slider-label>
      <igc-slider-label>Error</igc-slider-label>
      <igc-slider-label>Critical</igc-slider-label>
      <igc-slider-label>Alert</igc-slider-label>
      <igc-slider-label>Emergency</igc-slider-label>
    </igc-range-slider>
  \`
}`,...(m=(p=t.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const S=["Default","ValueFormat","Labels"];export{r as Default,t as Labels,a as ValueFormat,S as __namedExportsOrder,h as default};
