import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story';

// region default
const metadata = {
  title: 'Card',
  component: 'igc-card',
  argTypes: {
    outlined: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  outlined: boolean;
}
// endregion
interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { outlined = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="display:flex;margin-top:100px">
      <div style="max-width: 344px; margin-right: 10px">
        <igc-card ?outlined=${outlined} dir=${direction}>
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
          <hr
            style="height: 1px; margin: 0 0 5px 0; background-color: rgba(0,0,0, 0.2); border: 0px"
          />
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
            <igc-icon slot="end" name="home" collection="default"></igc-icon>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style="max-width: 344px">
        <igc-card ?outlined=${outlined} dir=${direction}>
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
              populated borough that’s among the world’s major commercial,
              financial and cultural centers.
            </p>
          </igc-card-content>
          <hr
            style="height: 1px; margin: 0 0 5px 0; background-color: rgba(0,0,0, 0.2); border: 0px"
          />
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
            <igc-icon slot="end" name="home" collection="default"></igc-icon>
          </igc-card-actions>
        </igc-card>
      </div>
      <div></div>
    </div>
    <br />
    <div style="max-width: 400px;min-width: 250px;">
      <igc-card ?outlined=${outlined}>
        <div style="display: flex; flex-direction: row">
          <div style="border-right:1px solid gray">
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                size="small"
                shape="rounded"
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/ROZES-Under-the-Grave.jpg"
              >
              </igc-avatar>
              <h3 slot="title">Rozes</h3>
              <h5 slot="subtitle">Under the Grave(2016)</h5>
            </igc-card-header>
            <igc-card-content>
              <p>
                As I have always said: I write what’s real and what’s true, even
                if it means throwing myself under the bus.
              </p>
            </igc-card-content>
          </div>
          <igc-card-actions>
            <igc-icon name="facebook" collection="default"></igc-icon>
            <igc-icon name="instagram" collection="default"></igc-icon>
            <igc-icon name="twitter" collection="default"></igc-icon>
          </igc-card-actions>
        </div>
      </igc-card>
    </div>
    <br />
    <div style="max-width: 400px;max-height: 250px;height:150px">
      <igc-card ?outlined=${outlined}>
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
                Far far away, behind the word mountains, far from the countries
                Vokalia and Consonantia, there live the blind texts.
              </p>
            </igc-card-content>
            <igc-card-actions>
              <igc-button slot="start" variant="flat">PLAY ALBUM</igc-button>
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
  `;
};

export const Basic = Template.bind({});
