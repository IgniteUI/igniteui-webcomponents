import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import { IgcListComponent } from './list';

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

    it('renders list with header item and content items', async () => {
      el = await createListElement(`<igc-list>
                <igc-list-header-item></igc-list-header-item>
                <igc-list-item></igc-list-item>
                <igc-list-item></igc-list-item>
                <igc-list-item></igc-list-item>
            </igc-list>`);

      expect(el).to.contain('igc-list-header-item');
      expect(el).to.contain('igc-list-item');
    });

    const createListElement = (template = '<igc-list/><igc-list-item/>') => {
      return fixture<IgcListComponent>(html`${unsafeStatic(template)}`);
    };
  });
});
