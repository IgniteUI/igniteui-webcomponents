import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import type IgcCardActionsComponent from './card.actions.js';
import type IgcCardContentComponent from './card.content.js';
import type IgcCardHeaderComponent from './card.header.js';
import IgcCardComponent from './card.js';
import type IgcCardMediaComponent from './card.media.js';

describe('Card Component', () => {
  before(() => {
    defineComponents(IgcCardComponent);
  });

  let card: IgcCardComponent;

  describe('Main Card', () => {
    it('passes the a11y audit', async () => {
      card = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
      await expect(card).shadowDom.to.be.accessible();
      await expect(card).to.be.accessible();
    });

    it('should initialize with default values', async () => {
      card = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);

      expect(card.elevated).to.be.false;
      expect(card).dom.to.equal('<igc-card></igc-card>');
    });

    it('should set elevated property', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card elevated></igc-card>`
      );

      expect(card.elevated).to.be.true;
      expect(card).dom.to.equal('<igc-card elevated></igc-card>');
    });

    it('should change elevated property', async () => {
      card = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
      card.elevated = true;
      await elementUpdated(card);

      expect(card.elevated).to.be.true;
      expect(card).dom.to.equal('<igc-card elevated></igc-card>');

      card.elevated = false;
      await elementUpdated(card);

      expect(card.elevated).to.be.false;
      expect(card).dom.to.equal('<igc-card></igc-card>');
    });

    it('should render slotted content', async () => {
      const content = 'Card content';
      card = await fixture<IgcCardComponent>(
        html`<igc-card>${content}</igc-card>`
      );

      expect(card).dom.to.have.text(content);
    });

    it('should render complete card structure', async () => {
      const content = `
        <igc-card-header>
          <h1 slot="title">Title</h1>
          <h3 slot="subtitle">Subtitle</h3>
        </igc-card-header>
        <igc-card-media>
          <img src="someLink">
        </igc-card-media>
        <igc-card-content>
          <p>Some content</p>
        </igc-card-content>
        <igc-card-actions>
          <button slot="start">Like</button>
        </igc-card-actions>
      `;
      card = await fixture(html`<igc-card>${content}</igc-card>`);

      expect(card).dom.to.have.text(content);
    });
  });

  describe('Card Header', () => {
    let header: IgcCardHeaderComponent;

    it('passes the a11y audit', async () => {
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header></igc-card-header>`
      );
      await expect(header).shadowDom.to.be.accessible();
      await expect(header).to.be.accessible();
    });

    it('should render title slot', async () => {
      const title = 'Card Title';
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <h3 slot="title">${title}</h3>
        </igc-card-header>`
      );

      expect(header).dom.to.contain.text(title);
    });

    it('should render subtitle slot', async () => {
      const subtitle = 'Card Subtitle';
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <h5 slot="subtitle">${subtitle}</h5>
        </igc-card-header>`
      );

      expect(header).dom.to.contain.text(subtitle);
    });

    it('should render title and subtitle slots together', async () => {
      const title = 'Card Title';
      const subtitle = 'Card Subtitle';
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <h3 slot="title">${title}</h3>
          <h5 slot="subtitle">${subtitle}</h5>
        </igc-card-header>`
      );

      expect(header).dom.to.contain.text(title);
      expect(header).dom.to.contain.text(subtitle);
    });

    it('should render thumbnail slot', async () => {
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <div slot="thumbnail">Icon</div>
        </igc-card-header>`
      );

      expect(header).dom.to.contain.text('Icon');
    });

    it('should render default slot content', async () => {
      const content = 'Extra content';
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>${content}</igc-card-header>`
      );

      expect(header).dom.to.have.text(content);
    });

    it('should render all slots together', async () => {
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <div slot="thumbnail">Avatar</div>
          <h3 slot="title">Title</h3>
          <h5 slot="subtitle">Subtitle</h5>
          <span>Extra</span>
        </igc-card-header>`
      );

      expect(header).dom.to.contain.text('Avatar');
      expect(header).dom.to.contain.text('Title');
      expect(header).dom.to.contain.text('Subtitle');
      expect(header).dom.to.contain.text('Extra');
    });

    it('should have correct shadow DOM parts', async () => {
      header = await fixture<IgcCardHeaderComponent>(
        html`<igc-card-header>
          <h3 slot="title">Title</h3>
          <h5 slot="subtitle">Subtitle</h5>
        </igc-card-header>`
      );

      const headerPart = header.shadowRoot!.querySelector('[part="header"]');
      expect(headerPart).to.exist;
    });
  });

  describe('Card Media', () => {
    let media: IgcCardMediaComponent;

    it('passes the a11y audit', async () => {
      media = await fixture<IgcCardMediaComponent>(
        html`<igc-card-media></igc-card-media>`
      );
      await expect(media).shadowDom.to.be.accessible();
    });

    it('should render slotted image', async () => {
      media = await fixture<IgcCardMediaComponent>(
        html`<igc-card-media>
          <img src="test.jpg" alt="Test" />
        </igc-card-media>`
      );

      const img = media.querySelector('img');
      expect(img).to.exist;
      expect(img?.getAttribute('src')).to.equal('test.jpg');
      expect(img?.getAttribute('alt')).to.equal('Test');
    });

    it('should render slotted video', async () => {
      media = await fixture<IgcCardMediaComponent>(
        html`<igc-card-media>
          <video src="test.mp4"></video>
        </igc-card-media>`
      );

      const video = media.querySelector('video');
      expect(video).to.exist;
      expect(video?.getAttribute('src')).to.equal('test.mp4');
    });

    it('should render any slotted content', async () => {
      const content = 'Media content';
      media = await fixture<IgcCardMediaComponent>(
        html`<igc-card-media><div>${content}</div></igc-card-media>`
      );

      expect(media).dom.to.have.text(content);
    });
  });

  describe('Card Content', () => {
    let content: IgcCardContentComponent;

    it('passes the a11y audit', async () => {
      content = await fixture<IgcCardContentComponent>(
        html`<igc-card-content></igc-card-content>`
      );
      await expect(content).shadowDom.to.be.accessible();
    });

    it('should render slotted text content', async () => {
      const text = 'This is the card content text.';
      content = await fixture<IgcCardContentComponent>(
        html`<igc-card-content><p>${text}</p></igc-card-content>`
      );

      expect(content).dom.to.have.text(text);
    });

    it('should render slotted HTML content', async () => {
      content = await fixture<IgcCardContentComponent>(
        html`<igc-card-content>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </igc-card-content>`
      );

      expect(content).dom.to.contain.text('Paragraph 1');
      expect(content).dom.to.contain.text('Paragraph 2');
      expect(content).dom.to.contain.text('Item 1');
      expect(content).dom.to.contain.text('Item 2');
    });
  });

  describe('Card Actions', () => {
    let actions: IgcCardActionsComponent;

    it('passes the a11y audit', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions></igc-card-actions>`
      );
      await expect(actions).shadowDom.to.be.accessible();
    });

    it('should initialize with default orientation', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions></igc-card-actions>`
      );

      expect(actions.orientation).to.equal('horizontal');
      expect(actions).dom.to.equal(
        '<igc-card-actions orientation="horizontal"></igc-card-actions>'
      );
    });

    it('should set vertical orientation', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions orientation="vertical"></igc-card-actions>`
      );

      expect(actions.orientation).to.equal('vertical');
      expect(actions).dom.to.equal(
        '<igc-card-actions orientation="vertical"></igc-card-actions>'
      );
    });

    it('should change orientation property', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions></igc-card-actions>`
      );

      actions.orientation = 'vertical';
      await elementUpdated(actions);

      expect(actions.orientation).to.equal('vertical');
      expect(actions).dom.to.equal(
        '<igc-card-actions orientation="vertical"></igc-card-actions>'
      );

      actions.orientation = 'horizontal';
      await elementUpdated(actions);

      expect(actions.orientation).to.equal('horizontal');
      expect(actions).dom.to.equal(
        '<igc-card-actions orientation="horizontal"></igc-card-actions>'
      );
    });

    it('should render start slot content', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions>
          <button slot="start">Like</button>
        </igc-card-actions>`
      );

      expect(actions).dom.to.contain.text('Like');
      const button = actions.querySelector('[slot="start"]');
      expect(button).to.exist;
    });

    it('should render end slot content', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions>
          <button slot="end">More</button>
        </igc-card-actions>`
      );

      expect(actions).dom.to.contain.text('More');
      const button = actions.querySelector('[slot="end"]');
      expect(button).to.exist;
    });

    it('should render default slot content', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions>
          <button>Center</button>
        </igc-card-actions>`
      );

      expect(actions).dom.to.contain.text('Center');
    });

    it('should render all slots together', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions>
          <button slot="start">Start</button>
          <button>Center</button>
          <button slot="end">End</button>
        </igc-card-actions>`
      );

      expect(actions).dom.to.contain.text('Start');
      expect(actions).dom.to.contain.text('Center');
      expect(actions).dom.to.contain.text('End');

      const startButton = actions.querySelector('[slot="start"]');
      const endButton = actions.querySelector('[slot="end"]');
      const centerButton = actions.querySelector('button:not([slot])');

      expect(startButton).to.exist;
      expect(endButton).to.exist;
      expect(centerButton).to.exist;
    });

    it('should render multiple items in the same slot', async () => {
      actions = await fixture<IgcCardActionsComponent>(
        html`<igc-card-actions>
          <button slot="start">Like</button>
          <button slot="start">Share</button>
          <button slot="start">Comment</button>
        </igc-card-actions>`
      );

      const startButtons = actions.querySelectorAll('[slot="start"]');
      expect(startButtons).to.have.length(3);
      expect(actions).dom.to.contain.text('Like');
      expect(actions).dom.to.contain.text('Share');
      expect(actions).dom.to.contain.text('Comment');
    });
  });

  describe('Integration Tests', () => {
    it('should render a complete card with all components', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card elevated>
          <igc-card-header>
            <div slot="thumbnail">Avatar</div>
            <h3 slot="title">Card Title</h3>
            <h5 slot="subtitle">Card Subtitle</h5>
          </igc-card-header>
          <igc-card-media>
            <img src="image.jpg" alt="Card image" />
          </igc-card-media>
          <igc-card-content>
            <p>This is the main content of the card.</p>
          </igc-card-content>
          <igc-card-actions>
            <button slot="start">Like</button>
            <button slot="start">Share</button>
            <button slot="end">More</button>
          </igc-card-actions>
        </igc-card>`
      );

      expect(card.elevated).to.be.true;

      const header = card.querySelector('igc-card-header');
      const media = card.querySelector('igc-card-media');
      const content = card.querySelector('igc-card-content');
      const actions = card.querySelector('igc-card-actions');

      expect(header).to.exist;
      expect(media).to.exist;
      expect(content).to.exist;
      expect(actions).to.exist;

      expect(card).dom.to.contain.text('Card Title');
      expect(card).dom.to.contain.text('Card Subtitle');
      expect(card).dom.to.contain.text('This is the main content of the card.');
      expect(card).dom.to.contain.text('Like');
      expect(card).dom.to.contain.text('Share');
      expect(card).dom.to.contain.text('More');
    });

    it('should work with minimal structure (only content)', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card>
          <igc-card-content>
            <p>Simple card content</p>
          </igc-card-content>
        </igc-card>`
      );

      const content = card.querySelector('igc-card-content');
      expect(content).to.exist;
      expect(card).dom.to.contain.text('Simple card content');
    });

    it('should work without header', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card>
          <igc-card-media>
            <img src="image.jpg" />
          </igc-card-media>
          <igc-card-content>
            <p>Content without header</p>
          </igc-card-content>
          <igc-card-actions>
            <button slot="start">Action</button>
          </igc-card-actions>
        </igc-card>`
      );

      const header = card.querySelector('igc-card-header');
      expect(header).to.not.exist;
      expect(card).dom.to.contain.text('Content without header');
    });

    it('should work without actions', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card>
          <igc-card-header>
            <h3 slot="title">Title</h3>
          </igc-card-header>
          <igc-card-content>
            <p>Content without actions</p>
          </igc-card-content>
        </igc-card>`
      );

      const actions = card.querySelector('igc-card-actions');
      expect(actions).to.not.exist;
      expect(card).dom.to.contain.text('Content without actions');
    });

    it('should work with custom content order', async () => {
      card = await fixture<IgcCardComponent>(
        html`<igc-card>
          <igc-card-actions>
            <button slot="start">Top Action</button>
          </igc-card-actions>
          <igc-card-content>
            <p>Content</p>
          </igc-card-content>
          <igc-card-header>
            <h3 slot="title">Title at bottom</h3>
          </igc-card-header>
        </igc-card>`
      );

      expect(card).dom.to.contain.text('Top Action');
      expect(card).dom.to.contain.text('Content');
      expect(card).dom.to.contain.text('Title at bottom');
    });
  });
});
