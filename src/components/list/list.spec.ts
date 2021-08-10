import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import { IgcListComponent } from './list';
import '../../../igniteui-webcomponents';

describe('List', () => {
  let el: IgcListComponent;

  describe('', async () => {
    beforeEach(async () => {
      el = await createListElement();
    });

    it('passes the a11y audit', async () => {
      expect(el).shadowDom.to.be.accessible();
    });

    it('renders list with items', async () => {
      el = await createListElement(`<igc-list>
              <igc-list-item></igc-list-item>
              <igc-list-item></igc-list-item>
              <igc-list-item></igc-list-item>
            </igc-list>`);

      expect(el.children.length).to.equals(3);
    });

    it('renders list with header and multiple items', async () => {
      el = await createListElement(`<igc-list>
              <igc-list-header></igc-list-header>
              <igc-list-item></igc-list-item>
              <igc-list-item></igc-list-item>
              <igc-list-item></igc-list-item>
            </igc-list>`);

      expect(el).to.contain('igc-list-header');
      expect(el).to.contain('igc-list-item');
    });

    it('render list item slots successfully', async () => {
      expect(el.children[0]).shadowDom.equal(`<section part="start">
              <slot name="start"></slot>
            </section>
            <section part="content">
              <header part="header">
                <slot part="title" name="title"></slot>
                <slot part="subtitle" name="subtitle"></slot>
              </header>
              <slot></slot>
            </section>
            <section part="end">
              <slot name="end"></slot>
            </section>`);
    });

    it('render list with multiple headers and items', async () => {
      el = await createListElement(`<igc-list>
                <igc-list-header>Header 1</igc-list-header>
                <igc-list-item>
                    <h4>Custom content</h4>
                </igc-list-item>
                <igc-list-header>Header 2</igc-list-header>
                <igc-list-item>
                    <h4>Custom content</h4>
                </igc-list-item>
              </igc-list>`);

      expect(el.getElementsByTagName('IGC-LIST-HEADER').length).to.equals(2);
    });

    it('displays the elements defined in the slots', async () => {
      el = await createListElement(`<igc-list>
              <igc-list-header>Header</igc-list-header>
              <igc-list-item>
                  <span slot="start"></span>
                  <h1 slot="title">Title</h1>
                  <p slot="subtitle">Subtitle</p>
                  <button slot="end">Action</button>
                  <h4>Custom content</h4>
              </igc-list-item>
            </igc-list>`);

      const listItem = el.children[1];

      expect(el).dom.to.have.descendant('igc-list-item');
      expect(el).dom.to.have.descendant('igc-list-header');
      expect(listItem).dom.to.have.descendant('span');
      expect(listItem).dom.to.have.descendant('h1');
      expect(listItem).dom.to.have.descendant('p');
      expect(listItem).dom.to.have.descendant('button');
      expect(listItem).dom.to.have.descendant('h4');
    });

    it('should render a custom template', async () => {
      el = await createListElement(`<igc-list>
              <p>Custom empty template!</p>
            </igc-list>`);

      expect(el).lightDom.to.equal('<p>Custom empty template!</p>');
    });

    it('should set roles properly', async () => {
      el = await createListElement(`<igc-list>
              <igc-list-header></igc-list-header>
              <igc-list-item></igc-list-item>
          </igc-list>`);

      verifyRole(el, 'list');
      verifyRole(el.children[0], 'separator');
      verifyRole(el.children[1], 'listitem');
    });

    const createListElement = (template = '<igc-list/><igc-list-item/>') => {
      return fixture<IgcListComponent>(html`${unsafeStatic(template)}`);
    };

    const verifyRole = (element: Element, role: string) => {
      expect(element.getAttribute('role')).to.equal(role);
    };
  });
});
