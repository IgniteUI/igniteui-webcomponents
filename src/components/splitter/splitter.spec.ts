import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcSplitterComponent from './splitter.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import IgcSplitterPaneComponent from './splitter-pane.js';

describe('Splitter', () => {
  before(() => {
    defineComponents(
      IgcSplitterComponent,
      IgcSplitterPaneComponent,
      IgcSplitterBarComponent
    );
  });

  let splitter: IgcSplitterComponent;

  describe('Rendering', () => {
    beforeEach(async () => {
      splitter = await fixture<IgcSplitterComponent>(createSplitter());
    });

    it('should render', () => {
      expect(splitter).to.exist;
      expect(splitter).to.be.instanceOf(IgcSplitterComponent);
    });

    it('is accessible', async () => {
      await expect(splitter).to.be.accessible();
      await expect(splitter).shadowDom.to.be.accessible();
    });

    it('should render panes and assign correct flex order', async () => {
      await elementUpdated(splitter);

      expect(splitter.panes).to.have.lengthOf(3);

      expect(splitter.panes[0].order).to.equal(0);
      expect(splitter.panes[1].order).to.equal(2);
      expect(splitter.panes[2].order).to.equal(4);
    });

    it('should render splitter bars and assign correct flex order', async () => {
      await elementUpdated(splitter);
      const bars = Array.from(
        splitter.renderRoot.querySelectorAll(IgcSplitterBarComponent.tagName)
      );

      expect(bars).to.have.lengthOf(2);

      expect(bars[0].order).to.equal(1);
      expect(bars[1].order).to.equal(3);
    });

    it('should have default horizontal orientation', () => {
      expect(splitter.orientation).to.equal('horizontal');
      expect(splitter.hasAttribute('orientation')).to.be.true;
      expect(splitter.getAttribute('orientation')).to.equal('horizontal');
    });

    it('should change orientation to vertical', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(splitter.orientation).to.equal('vertical');
      expect(splitter.getAttribute('orientation')).to.equal('vertical');
    });
  });
});

function createSplitter() {
  return html`
    <igc-splitter>
      <igc-splitter-pane>Pane 1</igc-splitter-pane>
      <igc-splitter-pane>Pane 2</igc-splitter-pane>
      <igc-splitter-pane>Pane 3</igc-splitter-pane>
    </igc-splitter>
  `;
}
