import{x as o}from"./lit-element.Wy23cYDu.js";import{d as m,Q as g}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";m(g);const $={title:"Tree",component:"igc-tree",parameters:{docs:{description:{component:`The tree allows users to represent hierarchical data in a tree-view structure,
maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.`}},actions:{handles:["igcSelection","igcItemCollapsed","igcItemCollapsing","igcItemExpanded","igcItemExpanding","igcItemActivated"]}},argTypes:{singleBranchExpand:{type:"boolean",description:"Whether a single or multiple of a parent's child items can be expanded.",control:"boolean",table:{defaultValue:{summary:!1}}},toggleNodeOnClick:{type:"boolean",description:"Whether clicking over nodes will change their expanded state or not.",control:"boolean",table:{defaultValue:{summary:!1}}},selection:{type:'"none" | "multiple" | "cascade"',description:"The selection state of the tree.",options:["none","multiple","cascade"],control:{type:"inline-radio"},table:{defaultValue:{summary:"none"}}}},args:{singleBranchExpand:!1,toggleNodeOnClick:!1,selection:"none"}},p=[1,2,3],s=(t,e,i=!1)=>{for(let n=0;n<e;n++){const c=document.createElement("igc-tree-item");c.selected=i,c.innerHTML=`<p slot="label">Added Child ${n}</p>`,t.appendChild(c)}},u=()=>{var i;const t=document.getElementById("parent2");(i=t==null?void 0:t.parentElement)==null||i.removeChild(t);const e=document.getElementById("tree");console.log("Selected items: ",e.selectionService.itemSelection.size),console.log("Indeterminate items: ",e.selectionService.indeterminateItems.size)},b=()=>{const t=document.getElementById("asd1"),e=t.getChildren()[0];e&&t.removeChild(e);const i=document.getElementById("tree");console.log("Selected items: ",i.selectionService.itemSelection.size),console.log("Indeterminate items: ",i.selectionService.indeterminateItems.size)},h=()=>{const t=document.getElementById("asd");s(t,2,!0);const e=document.getElementById("tree");console.log("Selected items: ",e.selectionService.itemSelection.size),console.log("Indeterminate items: ",e.selectionService.indeterminateItems.size)},I=()=>{const t=document.getElementById("asd");s(t,2);const e=document.getElementById("tree");console.log("Selected items: ",e.selectionService.itemSelection.size),console.log("Indeterminate items: ",e.selectionService.indeterminateItems.size)},f=()=>{var n;const t=document.getElementById("asd"),e=document.getElementById("asd1");(n=e.parentNode)==null||n.removeChild(e),t.appendChild(e);const i=document.getElementById("tree");console.log("Selected items: ",i.selectionService.itemSelection.size),console.log("Indeterminate items: ",i.selectionService.indeterminateItems.size)},T=({singleBranchExpand:t,selection:e,toggleNodeOnClick:i})=>o`
      <igc-tree style="height: 250px"
        id="tree"
        .selection=${e}
        .singleBranchExpand=${t}
        .toggleNodeOnClick = ${i}
      >
        <igc-tree-item expanded active selected label="Tree Node 1">
          <igc-tree-item expanded id="parent" label="Tree Node 1.1">
            <igc-tree-item label="Tree Node 1.1.1"></igc-tree-item>
            <igc-tree-item id="asd" label="Tree Node 1.1.2">
              ${p.map(n=>o`
                  <igc-tree-item .label="Tree Node 1.1.2.${n}"></igc-tree-item>
                `)}
            </igc-tree-item>
            <igc-tree-item #asd>
              <p slot="label" role="none">
                <a href="http://infragistics.com">Infragistics</a>
              </p>
            </igc-tree-item>
          </igc-tree-item>
          <igc-tree-item id="parent2">
            <p slot="label" role="none">
              <span>
                <input />
                <button>asd</button>
              </span>
            </p>
            <igc-tree-item label="I'm a child"></igc-tree-item>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item expanded id="asd1" label="Tree Node 2">
          <igc-tree-item selected active label="Tree Node 2.1"></igc-tree-item>
          <igc-tree-item id="asd" label="Tree Node 2.2"></igc-tree-item>
          <igc-tree-item selected label="Tree Node 2.3"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item selected label="Tree Node 3"></igc-tree-item>
      </igc-tree>
    </div>
    <button @click=${u}>Delete parent</button>
    <button @click=${b}>Delete first child</button>
    <button @click=${h}>Add new selected children for normal</button>
    <button @click=${I}>Add new deselected children for normal</button>
    <button @click=${f}>Move item</button>
    <igc-tree>
      <igc-tree-item>
        <p slot="label">Tree Node 4</p>
      </igc-tree-item>
    </igc-tree>
  `,l=T.bind({});var r,d,a;l.parameters={...l.parameters,docs:{...(r=l.parameters)==null?void 0:r.docs,source:{originalSource:`({
  singleBranchExpand,
  selection,
  toggleNodeOnClick
}: IgcTreeArgs) => {
  return html\`
      <igc-tree style="height: 250px"
        id="tree"
        .selection=\${selection}
        .singleBranchExpand=\${singleBranchExpand}
        .toggleNodeOnClick = \${toggleNodeOnClick}
      >
        <igc-tree-item expanded active selected label="Tree Node 1">
          <igc-tree-item expanded id="parent" label="Tree Node 1.1">
            <igc-tree-item label="Tree Node 1.1.1"></igc-tree-item>
            <igc-tree-item id="asd" label="Tree Node 1.1.2">
              \${arr1.map(i => html\`
                  <igc-tree-item .label="Tree Node 1.1.2.\${i}"></igc-tree-item>
                \`)}
            </igc-tree-item>
            <igc-tree-item #asd>
              <p slot="label" role="none">
                <a href="http://infragistics.com">Infragistics</a>
              </p>
            </igc-tree-item>
          </igc-tree-item>
          <igc-tree-item id="parent2">
            <p slot="label" role="none">
              <span>
                <input />
                <button>asd</button>
              </span>
            </p>
            <igc-tree-item label="I'm a child"></igc-tree-item>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item expanded id="asd1" label="Tree Node 2">
          <igc-tree-item selected active label="Tree Node 2.1"></igc-tree-item>
          <igc-tree-item id="asd" label="Tree Node 2.2"></igc-tree-item>
          <igc-tree-item selected label="Tree Node 2.3"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item selected label="Tree Node 3"></igc-tree-item>
      </igc-tree>
    </div>
    <button @click=\${log}>Delete parent</button>
    <button @click=\${log1}>Delete first child</button>
    <button @click=\${log2}>Add new selected children for normal</button>
    <button @click=\${log3}>Add new deselected children for normal</button>
    <button @click=\${log4}>Move item</button>
    <igc-tree>
      <igc-tree-item>
        <p slot="label">Tree Node 4</p>
      </igc-tree-item>
    </igc-tree>
  \`;
}`,...(a=(d=l.parameters)==null?void 0:d.docs)==null?void 0:a.source}}};const B=["Basic"];export{l as Basic,B as __namedExportsOrder,$ as default};
