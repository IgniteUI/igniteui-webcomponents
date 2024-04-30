import{v as c,M as r,D as s}from"./socialMedia.DmrXeeV-.js";import{x as o}from"./lit-element.Wy23cYDu.js";import{d,i as l,j as g,k as m,g as h,a as u}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";d(u,h,m,g);const p=[c,r,s];p.forEach(t=>{l(t.name,t.value)});const k={title:"Card",component:"igc-card",parameters:{docs:{description:{component:"A container which wraps different elements related to a single subject"}}},argTypes:{elevated:{type:"boolean",description:"Sets card elevated style, otherwise card looks outlined.",control:"boolean",table:{defaultValue:{summary:!1}}}},args:{elevated:!1}},b=({elevated:t=!1})=>o`
    <div style="display:flex; margin:16px">
      <div style="max-width: 344px; margin-right: 16px">
        <igc-card ?elevated=${t}>
          <igc-card-media style="max-height: 194px">
            <img
              src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=180"
            />
          </igc-card-media>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              size="small"
              shape="rounded"
              src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            >
            </igc-avatar>
            <h3 slot="title">Title</h3>
            <h5 slot="subtitle">Subtitle</h5>
          </igc-card-header>
          <igc-card-content>
            <p>
              New York City comprises 5 boroughs sitting where the Hudson River
              meets the Atlantic Ocean. At its core is Manhattan, a densely
              populated borough that’s among the world’s major commercial,
              financial and cultural centers.
            </p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
            <igc-icon-button
              slot="end"
              name="star_border"
              collection="internal"
              variant="flat"
            ></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style="max-width: 344px">
        <igc-card ?elevated=${t}>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              size="small"
              shape="rounded"
              src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            >
            </igc-avatar>
            <h3 slot="title">Title</h3>
            <h5 slot="subtitle">Subtitle</h5>
          </igc-card-header>
          <igc-card-media style="max-height: 194px">
            <img
              src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=180"
            />
          </igc-card-media>
          <igc-card-content>
            <p>
              New York City comprises 5 boroughs sitting where the Hudson River
              meets the Atlantic Ocean. At its core is Manhattan, a densely
              populated borough that's among the world's major commercial,
              financial and cultural centers.
            </p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start">Like</igc-button>
            <igc-button slot="start">Learn More</igc-button>
            <igc-icon-button name="instagram" slot="end"></igc-icon-button>
            <igc-icon-button name="facebook" slot="end"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div></div>
    </div>
    <div style="display:flex; margin:16px">
      <div style="max-width: 400px; min-width: 250px; margin-right: 16px">
        <igc-card ?elevated=${t} style="flex-direction: row">
          <div>
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                size="small"
                shape="rounded"
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/ROZES-Under-the-Grave.jpg"
              >
              </igc-avatar>
              <h3 slot="title">Rozes</h3>
              <h5 slot="subtitle">Under the Grave (2016)</h5>
            </igc-card-header>
            <igc-card-content>
              As I have always said: I write what's real and what's true, even
              if it means throwing myself under the bus.
            </igc-card-content>
          </div>
          <igc-card-actions orientation="vertical">
            <igc-icon-button name="facebook"></igc-icon-button>
            <igc-icon-button name="instagram"></igc-icon-button>
            <igc-icon-button name="twitter"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style="max-width: 400px; max-height: 250px;">
        <igc-card ?elevated=${t}>
          <div style="display:flex; flex-direction:row">
            <div>
              <igc-card-header>
                <igc-avatar
                  slot="thumbnail"
                  size="small"
                  shape="rounded"
                  src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
                >
                </igc-avatar>
                <h3 slot="title">HERE</h3>
                <h5 slot="subtitle">By Mellow D</h5>
              </igc-card-header>
              <igc-card-content>
                <p>
                  Far far away, behind the word mountains, far from the
                  countries Vokalia and Consonantia, there live the blind texts.
                </p>
              </igc-card-content>
              <igc-card-actions>
                <igc-button slot="start">PLAY ALBUM</igc-button>
              </igc-card-actions>
            </div>
            <igc-card-media style="max-width: 96px">
              <img
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
              />
            </igc-card-media>
          </div>
        </igc-card>
      </div>
    </div>
  `,a=b.bind({});var i,e,n;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`({
  elevated = false
}: IgcCardArgs) => {
  return html\`
    <div style="display:flex; margin:16px">
      <div style="max-width: 344px; margin-right: 16px">
        <igc-card ?elevated=\${elevated}>
          <igc-card-media style="max-height: 194px">
            <img
              src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=180"
            />
          </igc-card-media>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              size="small"
              shape="rounded"
              src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            >
            </igc-avatar>
            <h3 slot="title">Title</h3>
            <h5 slot="subtitle">Subtitle</h5>
          </igc-card-header>
          <igc-card-content>
            <p>
              New York City comprises 5 boroughs sitting where the Hudson River
              meets the Atlantic Ocean. At its core is Manhattan, a densely
              populated borough that’s among the world’s major commercial,
              financial and cultural centers.
            </p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
            <igc-icon-button
              slot="end"
              name="star_border"
              collection="internal"
              variant="flat"
            ></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style="max-width: 344px">
        <igc-card ?elevated=\${elevated}>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              size="small"
              shape="rounded"
              src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            >
            </igc-avatar>
            <h3 slot="title">Title</h3>
            <h5 slot="subtitle">Subtitle</h5>
          </igc-card-header>
          <igc-card-media style="max-height: 194px">
            <img
              src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=180"
            />
          </igc-card-media>
          <igc-card-content>
            <p>
              New York City comprises 5 boroughs sitting where the Hudson River
              meets the Atlantic Ocean. At its core is Manhattan, a densely
              populated borough that's among the world's major commercial,
              financial and cultural centers.
            </p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start">Like</igc-button>
            <igc-button slot="start">Learn More</igc-button>
            <igc-icon-button name="instagram" slot="end"></igc-icon-button>
            <igc-icon-button name="facebook" slot="end"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div></div>
    </div>
    <div style="display:flex; margin:16px">
      <div style="max-width: 400px; min-width: 250px; margin-right: 16px">
        <igc-card ?elevated=\${elevated} style="flex-direction: row">
          <div>
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                size="small"
                shape="rounded"
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/ROZES-Under-the-Grave.jpg"
              >
              </igc-avatar>
              <h3 slot="title">Rozes</h3>
              <h5 slot="subtitle">Under the Grave (2016)</h5>
            </igc-card-header>
            <igc-card-content>
              As I have always said: I write what's real and what's true, even
              if it means throwing myself under the bus.
            </igc-card-content>
          </div>
          <igc-card-actions orientation="vertical">
            <igc-icon-button name="facebook"></igc-icon-button>
            <igc-icon-button name="instagram"></igc-icon-button>
            <igc-icon-button name="twitter"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style="max-width: 400px; max-height: 250px;">
        <igc-card ?elevated=\${elevated}>
          <div style="display:flex; flex-direction:row">
            <div>
              <igc-card-header>
                <igc-avatar
                  slot="thumbnail"
                  size="small"
                  shape="rounded"
                  src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
                >
                </igc-avatar>
                <h3 slot="title">HERE</h3>
                <h5 slot="subtitle">By Mellow D</h5>
              </igc-card-header>
              <igc-card-content>
                <p>
                  Far far away, behind the word mountains, far from the
                  countries Vokalia and Consonantia, there live the blind texts.
                </p>
              </igc-card-content>
              <igc-card-actions>
                <igc-button slot="start">PLAY ALBUM</igc-button>
              </igc-card-actions>
            </div>
            <igc-card-media style="max-width: 96px">
              <img
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
              />
            </igc-card-media>
          </div>
        </igc-card>
      </div>
    </div>
  \`;
}`,...(n=(e=a.parameters)==null?void 0:e.docs)==null?void 0:n.source}}};const C=["Basic"];export{a as Basic,C as __namedExportsOrder,k as default};
