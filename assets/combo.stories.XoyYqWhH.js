import{x as t}from"./lit-element.Wy23cYDu.js";import{d as w,i as z,p as q,o as a}from"./defineComponents.DVY7fKDn.js";import{d as V,f as G,a as D}from"./story.CeFfqOJR.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";w(q);const F={title:"Combo",component:"igc-combo",parameters:{docs:{description:{component:`The Combo component is similar to the Select component in that it provides a list of options from which the user can make a selection.
In contrast to the Select component, the Combo component displays all options in a virtualized list of items,
meaning the combo box can simultaneously show thousands of options, where one or more options can be selected.
Additionally, users can create custom item templates, allowing for robust data visualization.
The Combo component features case-sensitive filtering, grouping, complex data binding, dynamic addition of values and more.`}},actions:{handles:["igcFocus","igcBlur","igcChange","igcOpening","igcOpened","igcClosing","igcClosed"]}},argTypes:{outlined:{type:"boolean",description:"The outlined attribute of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},singleSelect:{type:"boolean",description:"Enables single selection mode and moves item filtering to the main input.",control:"boolean",table:{defaultValue:{summary:!1}}},autofocus:{type:"boolean",description:"The autofocus attribute of the control.",control:"boolean",table:{defaultValue:{summary:!1}}},autofocusList:{type:"boolean",description:"Focuses the list of options when the menu opens.",control:"boolean",table:{defaultValue:{summary:!1}}},label:{type:"string",description:"The label attribute of the control.",control:"text"},placeholder:{type:"string",description:"The placeholder attribute of the control.",control:"text"},placeholderSearch:{type:"string",description:"The placeholder attribute of the search input.",control:"text",table:{defaultValue:{summary:"Search"}}},open:{type:"boolean",description:"Sets the open state of the component.",control:"boolean",table:{defaultValue:{summary:!1}}},groupSorting:{type:'"asc" | "desc" | "none"',description:"Sorts the items in each group by ascending or descending order.",options:["asc","desc","none"],control:{type:"inline-radio"},table:{defaultValue:{summary:"asc"}}},caseSensitiveIcon:{type:"boolean",description:"Enables the case sensitive search icon in the filtering input.",control:"boolean",table:{defaultValue:{summary:!1}}},disableFiltering:{type:"boolean",description:"Disables the filtering of the list of options.",control:"boolean",table:{defaultValue:{summary:!1}}},required:{type:"boolean",description:"Makes the control a required field in a form context.",control:"boolean",table:{defaultValue:{summary:!1}}},name:{type:"string",description:"The name attribute of the control.",control:"text"},disabled:{type:"boolean",description:"The disabled state of the component",control:"boolean",table:{defaultValue:{summary:!1}}},invalid:{type:"boolean",description:"Control the validity of the control.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{outlined:!1,singleSelect:!1,autofocus:!1,autofocusList:!1,placeholderSearch:"Search",open:!1,groupSorting:"asc",caseSensitiveIcon:!1,disableFiltering:!1,required:!1,disabled:!1,invalid:!1}},I=({item:e})=>t`
    <div>
      <span><b>${(e==null?void 0:e.name)??e}</b> [${e==null?void 0:e.zip}]</span>
    </div>
  `,H=({item:e})=>t`<div>Country of ${(e==null?void 0:e.country)??e}</div>`,o=[{id:"BG01",name:"Sofia",country:"Bulgaria",zip:"1000"},{id:"BG02",name:"Plovdiv",country:"Bulgaria",zip:"4000"},{id:"BG03",name:"Varna",country:"Bulgaria",zip:"9000"},{id:"US01",name:"New York",country:"United States",zip:"10001"},{id:"US02",name:"Boston",country:"United States",zip:"02108"},{id:"US03",name:"San Francisco",country:"United States",zip:"94103"},{id:"JP01",name:"Tokyo",country:"Japan",zip:"163-8001"},{id:"JP02",name:"Yokohama",country:"Japan",zip:"781-0240"},{id:"JP03",name:"Osaka",country:"Japan",zip:"552-0021"}];z("location",'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>');const J=({name:e,disableFiltering:p,caseSensitiveIcon:u,label:b="Location(s)",placeholder:f="Cities of interest",placeholderSearch:g="Search",open:y=!1,disabled:h=!1,outlined:v=!1,invalid:$=!1,required:S=!1,autofocus:k=!1,singleSelect:T=!1,autofocusList:C,groupSorting:x="asc",sameWidth:B=!1})=>t`
  <igc-combo
    .data=${o}
    .itemTemplate=${I}
    .groupHeaderTemplate=${H}
    label=${a(b)}
    name=${a(e)}
    placeholder=${a(f)}
    placeholder-search=${a(g)}
    value-key="id"
    display-key="name"
    value='["BG01", "BG02"]'
    group-key="country"
    group-sorting=${a(x)}
    ?same-width=${B}
    ?case-sensitive-icon=${u}
    ?disable-filtering=${p}
    ?open=${y}
    ?autofocus=${k}
    ?autofocus-list=${C}
    ?outlined=${v}
    ?required=${S}
    ?disabled=${h}
    ?invalid=${$}
    ?single-select=${T}
  >
    <igc-icon slot="prefix" name="location"></igc-icon>
    <span slot="helper-text">Sample helper text.</span>
  </igc-combo>
`,n=J.bind({}),i={argTypes:V(F),render:()=>t`
      <form @submit=${G}>
        <fieldset>
          <igc-combo
            label="Default"
            name="combo"
            .data=${o}
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="Initial value"
            .data=${o}
            name="combo-initial"
            value='["BG01", "BG02"]'
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="No value key"
            .data=${o}
            name="combo-not-key"
            display-key="name"
          ></igc-combo>
          <igc-combo
            .data=${o}
            single-select
            label="Single selection"
            name="combo-single"
            display-key="name"
            value-key="id"
          ></igc-combo>
        </fieldset>
        <fieldset>
          <igc-combo
            name="combo-primitive"
            .value=${[1,"one"]}
            .data=${[1,2,3,4,5,"one","two","three","four","five"]}
            label="Primitives binding"
          ></igc-combo>
        </fieldset>
        <fieldset disabled="disabled">
          <igc-combo
            label="Disabled"
            name="combo-disabled"
            .data=${o}
            value-key="id"
            display-key="name"
          ></igc-combo>
        </fieldset>
        <fieldset>
          <igc-combo
            label="Required"
            name="combo-required"
            .data=${o}
            value-key="id"
            display-key="name"
            required
          ></igc-combo>
        </fieldset>

        ${D()}
      </form>
    `};var l,s,c;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`({
  name,
  disableFiltering,
  caseSensitiveIcon,
  label = 'Location(s)',
  placeholder = 'Cities of interest',
  placeholderSearch = 'Search',
  open = false,
  disabled = false,
  outlined = false,
  invalid = false,
  required = false,
  autofocus = false,
  singleSelect = false,
  autofocusList,
  groupSorting = 'asc',
  sameWidth = false
}: IgcComboComponent<City>) => html\`
  <igc-combo
    .data=\${cities}
    .itemTemplate=\${itemTemplate}
    .groupHeaderTemplate=\${groupHeaderTemplate}
    label=\${ifDefined(label)}
    name=\${ifDefined(name)}
    placeholder=\${ifDefined(placeholder)}
    placeholder-search=\${ifDefined(placeholderSearch)}
    value-key="id"
    display-key="name"
    value='["BG01", "BG02"]'
    group-key="country"
    group-sorting=\${ifDefined(groupSorting)}
    ?same-width=\${sameWidth}
    ?case-sensitive-icon=\${caseSensitiveIcon}
    ?disable-filtering=\${disableFiltering}
    ?open=\${open}
    ?autofocus=\${autofocus}
    ?autofocus-list=\${autofocusList}
    ?outlined=\${outlined}
    ?required=\${required}
    ?disabled=\${disabled}
    ?invalid=\${invalid}
    ?single-select=\${singleSelect}
  >
    <igc-icon slot="prefix" name="location"></igc-icon>
    <span slot="helper-text">Sample helper text.</span>
  </igc-combo>
\``,...(c=(s=n.parameters)==null?void 0:s.docs)==null?void 0:c.source}}};var r,d,m;i.parameters={...i.parameters,docs:{...(r=i.parameters)==null?void 0:r.docs,source:{originalSource:`{
  argTypes: disableStoryControls(metadata),
  render: () => {
    const primitive = [1, 2, 3, 4, 5, 'one', 'two', 'three', 'four', 'five'];
    return html\`
      <form @submit=\${formSubmitHandler}>
        <fieldset>
          <igc-combo
            label="Default"
            name="combo"
            .data=\${cities}
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="Initial value"
            .data=\${cities}
            name="combo-initial"
            value='["BG01", "BG02"]'
            value-key="id"
            display-key="name"
          ></igc-combo>
          <igc-combo
            label="No value key"
            .data=\${cities}
            name="combo-not-key"
            display-key="name"
          ></igc-combo>
          <igc-combo
            .data=\${cities}
            single-select
            label="Single selection"
            name="combo-single"
            display-key="name"
            value-key="id"
          ></igc-combo>
        </fieldset>
        <fieldset>
          <igc-combo
            name="combo-primitive"
            .value=\${[1, 'one']}
            .data=\${primitive}
            label="Primitives binding"
          ></igc-combo>
        </fieldset>
        <fieldset disabled="disabled">
          <igc-combo
            label="Disabled"
            name="combo-disabled"
            .data=\${cities}
            value-key="id"
            display-key="name"
          ></igc-combo>
        </fieldset>
        <fieldset>
          <igc-combo
            label="Required"
            name="combo-required"
            .data=\${cities}
            value-key="id"
            display-key="name"
            required
          ></igc-combo>
        </fieldset>

        \${formControls()}
      </form>
    \`;
  }
}`,...(m=(d=i.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};const R=["Basic","Form"];export{n as Basic,i as Form,R as __namedExportsOrder,F as default};
