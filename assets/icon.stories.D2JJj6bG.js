import{y as a}from"./index.drCtqaH1.js";import{x as p}from"./lit-element.Wy23cYDu.js";import{d,i as s,c as g,r as f}from"./defineComponents.DVY7fKDn.js";import"./content.BURghAKS.js";import"./election.D3AHPmQe.js";import"./health.B5ghXXgr.js";import"./programming.bPQtr2JT.js";import"./socialMedia.DmrXeeV-.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";d(g);const t=a.map(e=>e.name),c={title:"Icon",component:"igc-icon",parameters:{docs:{description:{component:"The icon component allows visualizing collections of pre-registered SVG icons."}}},argTypes:{name:{type:"string",description:"The name of the icon glyph to draw.",control:"text",table:{defaultValue:{summary:""}}},collection:{type:"string",description:"The name of the registered collection for look up of icons.\nDefaults to `default`.",control:"text",table:{defaultValue:{summary:"default"}}},mirrored:{type:"boolean",description:"Whether to flip the icon. Useful for RTL layouts.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{name:"",collection:"default",mirrored:!1}};Object.assign(c.argTypes.name,{control:"select",options:t});Object.assign(c.args,{name:"biking"});a.forEach(e=>{s(e.name,e.value)});s("biking",'<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>');t.push("biking");t.push("search");t.sort();const u=()=>{f("search","https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg","material")},h=({name:e="biking",collection:l="default",mirrored:m=!1})=>p`
    <div style="display: flex;">
      <igc-icon .name=${e} .collection=${l} .mirrored=${m}>
      </igc-icon>

      <button @click=${u}>Register Icon</button>
    </div>
  `,o=h.bind({});var i,n,r;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`({
  name = 'biking',
  collection = 'default',
  mirrored = false
}: IgcIconArgs) => {
  return html\`
    <div style="display: flex;">
      <igc-icon .name=\${name} .collection=\${collection} .mirrored=\${mirrored}>
      </igc-icon>

      <button @click=\${registerIconClick}>Register Icon</button>
    </div>
  \`;
}`,...(r=(n=o.parameters)==null?void 0:n.docs)==null?void 0:r.source}}};const _=["Basic"];export{o as Basic,_ as __namedExportsOrder,c as default};
