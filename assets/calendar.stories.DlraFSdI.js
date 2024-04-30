import{x as l}from"./lit-element.Wy23cYDu.js";import{d as M,h as C,D as i,o as e}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";M(C);const p={title:"Calendar",component:"igc-calendar",parameters:{docs:{description:{component:`Represents a calendar that lets users
to select a date value in a variety of different ways.`}},actions:{handles:["igcChange"]}},argTypes:{hideOutsideDays:{type:"boolean",description:"Controls the visibility of the dates that do not belong to the current month.",control:"boolean",table:{defaultValue:{summary:!1}}},hideHeader:{type:"boolean",description:"Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection.",control:"boolean",table:{defaultValue:{summary:!1}}},headerOrientation:{type:'"vertical" | "horizontal"',description:"The orientation of the header.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},orientation:{type:'"vertical" | "horizontal"',description:"The orientation of the multiple months displayed in days view.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},visibleMonths:{type:"number",description:"The number of months displayed in days view.",control:"number",table:{defaultValue:{summary:1}}},activeView:{type:'"days" | "months" | "years"',description:"The active view.",options:["days","months","years"],control:{type:"inline-radio"},table:{defaultValue:{summary:"days"}}},value:{type:"Date",description:`The current value of the calendar.
Used when selection is set to single.`,control:"date"},selection:{type:'"single" | "multiple" | "range"',description:"Sets the type of date selection.",options:["single","multiple","range"],control:{type:"inline-radio"},table:{defaultValue:{summary:"single"}}},showWeekNumbers:{type:"boolean",description:"Show/hide the week numbers.",control:"boolean",table:{defaultValue:{summary:!1}}},weekStart:{type:'"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',description:"Sets the start day of the week.",options:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],control:{type:"select"},table:{defaultValue:{summary:"sunday"}}},activeDate:{type:"Date",description:"Sets the date which is shown in view and is highlighted. By default it is the current date.",control:"date"},locale:{type:"string",description:"Sets the locale used for formatting and displaying the dates in the calendar.",control:"text",table:{defaultValue:{summary:"en"}}}},args:{hideOutsideDays:!1,hideHeader:!1,headerOrientation:"horizontal",orientation:"horizontal",visibleMonths:1,activeView:"days",selection:"single",showWeekNumbers:!1,weekStart:"sunday",locale:"en"}};Object.assign(p.argTypes,{weekDayFormat:{type:'"long" | "short" | "narrow"',options:["long","short","narrow"],control:{type:"inline-radio"}},monthFormat:{type:'"numeric" | "2-digit" | "long" | "short" | "narrow"',options:["numeric","2-digit","long","short","narrow"],control:{type:"inline-radio"}},title:{type:"string",control:"text"},values:{type:"string",control:"text"}});Object.assign(p.args,{weekDayFormat:"narrow",monthFormat:"long"});const z=({showWeekNumbers:u,hideOutsideDays:y,weekStart:m,locale:f,weekDayFormat:g,monthFormat:w,selection:D,activeView:v,hideHeader:b=!1,headerOrientation:$,orientation:k,title:o,visibleMonths:O,value:s,values:S,activeDate:r})=>{const V={month:w,weekday:g},a=new Date().getFullYear(),n=new Date().getMonth(),R=[{type:i.Specific,dateRange:[new Date(a,n,7)]}],T=[{type:i.Specific,dateRange:[new Date(a,n,22)]},{type:i.Specific,dateRange:[new Date(a,n,23)]}];return l`
    <igc-calendar
      ?hide-header=${b}
      ?show-week-numbers=${u}
      ?hide-outside-days=${y}
      header-orientation=${e($)}
      orientation=${e(k)}
      week-start=${e(m)}
      locale=${e(f)}
      selection=${e(D)}
      active-view=${e(v)}
      .formatOptions=${V}
      .disabledDates=${R}
      .specialDates=${T}
      .activeDate=${r?new Date(r):new Date}
      .value=${s?new Date(s):void 0}
      values=${e(S)}
      visible-months=${e(O)}
      @igcChange=${F=>{console.log(F)}}
    >
      ${o?l`<span slot="title">${o}</span>`:""}
    </igc-calendar>
  `},t=z.bind({});var d,c,h;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`({
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
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const disabledDates: DateRangeDescriptor[] = [{
    type: DateRangeType.Specific,
    dateRange: [new Date(currentYear, currentMonth, 7)]
  }];
  const specialDates: DateRangeDescriptor[] = [{
    type: DateRangeType.Specific,
    dateRange: [new Date(currentYear, currentMonth, 22)]
  }, {
    type: DateRangeType.Specific,
    dateRange: [new Date(currentYear, currentMonth, 23)]
  }];
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
}`,...(h=(c=t.parameters)==null?void 0:c.docs)==null?void 0:h.source}}};const E=["Basic"];export{t as Basic,E as __namedExportsOrder,p as default};
