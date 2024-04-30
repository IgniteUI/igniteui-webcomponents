import{x as t}from"./lit-element.Wy23cYDu.js";import{o as l}from"./range.wLE2hJlA.js";import{d as p,I as c}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";p(c);const r={title:"Accordion",component:"igc-accordion",parameters:{docs:{description:{component:`The Accordion is a container-based component that can house multiple expansion panels
and offers keyboard navigation.`}}},argTypes:{singleExpand:{type:"boolean",description:"Allows only one panel to be expanded at a time.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{singleExpand:!1}};Object.assign(r.parameters,{actions:{handles:["igcOpening","igcOpened","igcClosing","igcClosed"]}});const i={render:s=>t`
    <igc-accordion ?single-expand=${s.singleExpand}>
      ${Array.from(l(1,4)).map(e=>t` <igc-expansion-panel>
            <h1 slot="title">Title ${e}</h1>
            <h2 slot="subtitle">Subtitle ${e}</h2>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi
              adipisci, ratione ut praesentium qui, similique molestiae
              voluptate at excepturi, a animi quam blanditiis. Tenetur tempore
              explicabo blanditiis harum ut delectus!
            </p>
          </igc-expansion-panel>`)}
      <igc-expansion-panel>
        <h1 slot="title">Title 4</h1>
        <h2 slot="subtitle">Subtitle 4</h2>
        <igc-accordion>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.1 title</h1>
            <h2 slot="subtitle">Subtitle 4.1 subtitle</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quia
              placeat natus illo voluptatum, praesentium similique excepturi
              corporis sequi at earum labore provident asperiores dolorem fugit
              explicabo ipsa distinctio doloremque?
            </p>
          </igc-expansion-panel>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.2</h1>
            <h2 slot="subtitle">Subtitle 4.2</h2>
            <igc-input placeholder="Your feedback"></igc-input>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Similique modi, cumque consequuntur omnis quis odio id facere
              placeat amet velit quos natus ipsam quasi, consequatur qui impedit
              ullam officiis earum.
            </p>
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
    </igc-accordion>
  `};var n,o,a;i.parameters={...i.parameters,docs:{...(n=i.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => html\`
    <igc-accordion ?single-expand=\${args.singleExpand}>
      \${Array.from(range(1, 4)).map(i => html\` <igc-expansion-panel>
            <h1 slot="title">Title \${i}</h1>
            <h2 slot="subtitle">Subtitle \${i}</h2>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi
              adipisci, ratione ut praesentium qui, similique molestiae
              voluptate at excepturi, a animi quam blanditiis. Tenetur tempore
              explicabo blanditiis harum ut delectus!
            </p>
          </igc-expansion-panel>\`)}
      <igc-expansion-panel>
        <h1 slot="title">Title 4</h1>
        <h2 slot="subtitle">Subtitle 4</h2>
        <igc-accordion>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.1 title</h1>
            <h2 slot="subtitle">Subtitle 4.1 subtitle</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quia
              placeat natus illo voluptatum, praesentium similique excepturi
              corporis sequi at earum labore provident asperiores dolorem fugit
              explicabo ipsa distinctio doloremque?
            </p>
          </igc-expansion-panel>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.2</h1>
            <h2 slot="subtitle">Subtitle 4.2</h2>
            <igc-input placeholder="Your feedback"></igc-input>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Similique modi, cumque consequuntur omnis quis odio id facere
              placeat amet velit quos natus ipsam quasi, consequatur qui impedit
              ullam officiis earum.
            </p>
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
    </igc-accordion>
  \`
}`,...(a=(o=i.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};const q=["Default"];export{i as Default,q as __namedExportsOrder,r as default};
