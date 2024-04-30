import{x as s}from"./lit-element.Wy23cYDu.js";import{d as l,g as c,a as m,F as p}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";l(p,m,c);const y={title:"List",component:"igc-list",parameters:{docs:{description:{component:"Displays a collection of data items in a templatable list format."}}}},a=[{name:"John Smith",position:"Software Developer",avatar:"https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"},{name:"Abraham Lee",position:"Team Lead",avatar:"https://www.infragistics.com/angular-demos/assets/images/men/2.jpg"},{name:"Jonathan Deberkow",position:"UX Designer",avatar:"https://www.infragistics.com/angular-demos/assets/images/men/3.jpg"}],g=()=>{const r=new Array(48);return s`
    <igc-list>
      <igc-list-header>
        <h1>Job Positions</h1>
      </igc-list-header>
      ${r.fill(a[0],0,15).fill(a[1],16,31).fill(a[2],31).map(e=>s`
            <igc-list-item>
              <igc-avatar slot="start" src=${e.avatar} shape="circle"
                >AA</igc-avatar
              >
              <h2 slot="title">${e.name}</h2>
              <span slot="subtitle">${e.position}</span>
              <igc-button slot="end">Text</igc-button>
              <igc-button slot="end">Call</igc-button>
            </igc-list-item>
          `)}
    </igc-list>
  `},t=g.bind({});var i,o,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`() => {
  const employees = new Array(48);
  return html\`
    <igc-list>
      <igc-list-header>
        <h1>Job Positions</h1>
      </igc-list-header>
      \${employees.fill(employeeData[0], 0, 15).fill(employeeData[1], 16, 31).fill(employeeData[2], 31).map(employee => {
    return html\`
            <igc-list-item>
              <igc-avatar slot="start" src=\${employee.avatar} shape="circle"
                >AA</igc-avatar
              >
              <h2 slot="title">\${employee.name}</h2>
              <span slot="subtitle">\${employee.position}</span>
              <igc-button slot="end">Text</igc-button>
              <igc-button slot="end">Call</igc-button>
            </igc-list-item>
          \`;
  })}
    </igc-list>
  \`;
}`,...(n=(o=t.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};const v=["Basic"];export{t as Basic,v as __namedExportsOrder,y as default};
