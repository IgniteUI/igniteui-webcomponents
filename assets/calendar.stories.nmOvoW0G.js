import{x as o}from"./lit-element.Wy23cYDu.js";import{d as T,h as C,o as e}from"./defineComponents.CVI5q4ti.js";import"./config.BLuXb-rQ.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-Dz6tlXcu.js";import"../sb-preview/runtime.js";T(C);const d={title:"Calendar",component:"igc-calendar",parameters:{docs:{description:{component:`Represents a calendar that lets users
to select a date value in a variety of different ways.`}},actions:{handles:["igcChange"]}},argTypes:{hideOutsideDays:{type:"boolean",description:"Controls the visibility of the dates that do not belong to the current month.",control:"boolean",table:{defaultValue:{summary:!1}}},hideHeader:{type:"boolean",description:"Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection.",control:"boolean",table:{defaultValue:{summary:!1}}},headerOrientation:{type:'"vertical" | "horizontal"',description:"The orientation of the header.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},orientation:{type:'"vertical" | "horizontal"',description:"The orientation of the multiple months displayed in days view.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},visibleMonths:{type:"number",description:"The number of months displayed in days view.",control:"number",table:{defaultValue:{summary:1}}},activeView:{type:'"days" | "months" | "years"',description:"The active view.",options:["days","months","years"],control:{type:"inline-radio"},table:{defaultValue:{summary:"days"}}},value:{type:"Date",description:`The current value of the calendar.
Used when selection is set to single.`,control:"date"},selection:{type:'"single" | "multiple" | "range"',description:"Sets the type of date selection.",options:["single","multiple","range"],control:{type:"inline-radio"},table:{defaultValue:{summary:"single"}}},showWeekNumbers:{type:"boolean",description:"Show/hide the week numbers.",control:"boolean",table:{defaultValue:{summary:!1}}},weekStart:{type:'"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',description:"Sets the start day of the week.",options:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],control:{type:"select"},table:{defaultValue:{summary:"sunday"}}},activeDate:{type:"Date",description:"Sets the date which is shown in view and is highlighted. By default it is the current date.",control:"date"},locale:{type:"string",description:"Sets the locale used for formatting and displaying the dates in the calendar.",control:"text",table:{defaultValue:{summary:"en"}}}},args:{hideOutsideDays:!1,hideHeader:!1,headerOrientation:"horizontal",orientation:"horizontal",visibleMonths:1,activeView:"days",selection:"single",showWeekNumbers:!1,weekStart:"sunday",locale:"en"}};Object.assign(d.argTypes,{weekDayFormat:{type:'"long" | "short" | "narrow"',options:["long","short","narrow"],control:{type:"inline-radio"}},monthFormat:{type:'"numeric" | "2-digit" | "long" | "short" | "narrow"',options:["numeric","2-digit","long","short","narrow"],control:{type:"inline-radio"}},title:{type:"string",control:"text"},values:{type:"string",control:"text"}});Object.assign(d.args,{weekDayFormat:"narrow",monthFormat:"long"});const F=({showWeekNumbers:c,hideOutsideDays:h,weekStart:p,locale:m,weekDayFormat:u,monthFormat:y,selection:f,activeView:w,hideHeader:g=!1,headerOrientation:D,orientation:v,title:a,visibleMonths:b,value:n,values:$,activeDate:i})=>{const k={month:y,weekday:u},O=[],V=[];return o`
    <igc-calendar
      ?hide-header=${g}
      ?show-week-numbers=${c}
      ?hide-outside-days=${h}
      header-orientation=${e(D)}
      orientation=${e(v)}
      week-start=${e(p)}
      locale=${e(m)}
      selection=${e(f)}
      active-view=${e(w)}
      .formatOptions=${k}
      .disabledDates=${O}
      .specialDates=${V}
      .activeDate=${i?new Date(i):new Date}
      .value=${n?new Date(n):void 0}
      values=${e($)}
      visible-months=${e(b)}
      @igcChange=${S=>{console.log(S)}}
    >
      ${a?o`<span slot="title">${a}</span>`:""}
    </igc-calendar>
  `},t=F.bind({});var s,r,l;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`({
  showWeekNumbers,
  hideOutsideDays,
  weekStart,
  locale,
  weekDayFormat,
  monthFormat,
  selection,
  activeView,
  hideHeader = false,
  headerOrientation,
  orientation,
  title,
  visibleMonths,
  value,
  values,
  activeDate
}: IgcCalendarArgs) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: monthFormat,
    weekday: weekDayFormat
  };
  const disabledDates: DateRangeDescriptor[] = [
    // {
    //   type: DateRangeType.Before,
    //   dateRange: [new Date()],
    // },
  ];
  const specialDates: DateRangeDescriptor[] = [
    // {
    //   type: DateRangeType.Specific,
    //   dateRange: [new Date(2021, 8, 22)],
    // },
  ];
  return html\`
    <igc-calendar
      ?hide-header=\${hideHeader}
      ?show-week-numbers=\${showWeekNumbers}
      ?hide-outside-days=\${hideOutsideDays}
      header-orientation=\${ifDefined(headerOrientation)}
      orientation=\${ifDefined(orientation)}
      week-start=\${ifDefined(weekStart)}
      locale=\${ifDefined(locale)}
      selection=\${ifDefined(selection)}
      active-view=\${ifDefined(activeView)}
      .formatOptions=\${formatOptions}
      .disabledDates=\${disabledDates}
      .specialDates=\${specialDates}
      .activeDate=\${activeDate ? new Date(activeDate) : new Date()}
      .value=\${value ? new Date((value as Date)) : undefined}
      values=\${ifDefined(values)}
      visible-months=\${ifDefined(visibleMonths)}
      @igcChange=\${(ev: Event) => {
    console.log(ev);
  }}
    >
      \${title ? html\`<span slot="title">\${title}</span>\` : ''}
    </igc-calendar>
  \`;
}`,...(l=(r=t.parameters)==null?void 0:r.docs)==null?void 0:l.source}}};const N=["Basic"];export{t as Basic,N as __namedExportsOrder,d as default};
