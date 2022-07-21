import { html } from 'lit';
import { Story } from './story.js';

export default { title: 'Typogrpahy' };

const Template: Story<{}, {}> = () => html`
  <div class="igc-typography">
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <h4>Heading 4</h4>
    <h5>Heading 5</h5>
    <h6>Heading 6</h6>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Pretium lectus quam id
      leo in vitae turpis. Curabitur vitae nunc sed velit. Scelerisque fermentum
      dui faucibus in ornare quam viverra. Sit amet massa vitae tortor
      condimentum. Tellus in metus vulputate eu scelerisque. Volutpat diam ut
      venenatis tellus. Semper auctor neque vitae tempus quam pellentesque nec
      nam aliquam. Egestas integer eget aliquet nibh praesent. Morbi tristique
      senectus et netus. Pharetra massa massa ultricies mi quis.
    </p>
  </div>
`;

export const Basic = Template.bind({});
