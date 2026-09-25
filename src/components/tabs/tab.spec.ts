import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcTabComponent from './tab.js';
import IgcTabsComponent from './tabs.js';

describe('Tab component', () => {
  before(() => {
    defineComponents(IgcTabComponent, IgcTabsComponent);
  });

  let element: IgcTabsComponent;

  beforeEach(async () => {
    element = await fixture<IgcTabsComponent>(html`
      <igc-tabs>
        <igc-tab label="Tab 1">Content 1</igc-tab>
        <igc-tab label="Tab 2">Content 2</igc-tab>
        <igc-tab label="Tab 3" disabled>Content 3</igc-tab>
      </igc-tabs>
    `);
  });

  // See the note on the `igc-tabs` accessibility test for the suppressed rule.
  it('is accessible', async () => {
    await expect(element).to.be.accessible({
      ignoredRules: ['aria-required-children'],
    });
  });

  it('is initialized with the proper default values', async () => {
    const tab = await fixture<IgcTabComponent>(html`<igc-tab></igc-tab>`);

    expect(tab.label).to.be.empty;
    expect(tab.selected).to.be.false;
    expect(tab.disabled).to.be.false;
  });

  it('generates an id when none is provided and keeps an author set one', async () => {
    const [first, second] = element.tabs;

    expect(first.id).to.match(/^igc-tab-\d+$/);
    expect(second.id).to.match(/^igc-tab-\d+$/);
    expect(first.id).to.not.equal(second.id);

    const tab = await fixture<IgcTabComponent>(
      html`<igc-tab id="custom"></igc-tab>`
    );
    expect(tab.id).to.equal('custom');
  });

  it('wires the header and the panel through ARIA', () => {
    for (const tab of element.tabs) {
      const { header, body } = getTabDOM(tab);

      expect(header.role).to.equal('tab');
      expect(body.role).to.equal('tabpanel');
      expect(header.getAttribute('aria-controls')).to.equal(body.id);
      expect(body.getAttribute('aria-labelledby')).to.equal(header.id);
    }
  });

  it('keeps the ARIA wiring when the public id changes', async () => {
    const [tab] = element.tabs;
    const { header, body } = getTabDOM(tab);
    const controls = header.getAttribute('aria-controls');

    tab.id = 'renamed';
    await elementUpdated(tab);

    expect(header.getAttribute('aria-controls')).to.equal(controls);
    expect(body.id).to.equal(controls);
  });

  it('exposes the position of each tab in the set', () => {
    const size = element.tabs.length;

    element.tabs.forEach((tab, index) => {
      const { header } = getTabDOM(tab);

      expect(header.getAttribute('aria-posinset')).to.equal(`${index + 1}`);
      expect(header.getAttribute('aria-setsize')).to.equal(`${size}`);
    });
  });

  it('updates the set information when tabs are added and removed', async () => {
    const tab = document.createElement(IgcTabComponent.tagName);
    tab.label = 'Tab 4';
    element.append(tab);

    await elementUpdated(tab);
    await elementUpdated(element);

    expect(getTabDOM(tab).header.getAttribute('aria-posinset')).to.equal('4');

    for (const each of element.tabs) {
      expect(getTabDOM(each).header.getAttribute('aria-setsize')).to.equal('4');
    }

    element.tabs[0].remove();
    await elementUpdated(element);

    element.tabs.forEach((each, index) => {
      const { header } = getTabDOM(each);

      expect(header.getAttribute('aria-posinset')).to.equal(`${index + 1}`);
      expect(header.getAttribute('aria-setsize')).to.equal('3');
    });
  });

  it('does not expose set information for a standalone tab', async () => {
    const tab = await fixture<IgcTabComponent>(
      html`<igc-tab label="Standalone"></igc-tab>`
    );
    const { header } = getTabDOM(tab);

    expect(header.hasAttribute('aria-posinset')).to.be.false;
    expect(header.hasAttribute('aria-setsize')).to.be.false;
  });

  it('gives the selected tab the roving tab stop', async () => {
    expect(getTabDOM(element.tabs[0]).header.tabIndex).to.equal(0);
    expect(getTabDOM(element.tabs[1]).header.tabIndex).to.equal(-1);

    element.select(element.tabs[1]);
    await elementUpdated(element);

    expect(getTabDOM(element.tabs[0]).header.tabIndex).to.equal(-1);
    expect(getTabDOM(element.tabs[1]).header.tabIndex).to.equal(0);
  });

  it('keeps a tab stop when there is no selection', async () => {
    element.tabs[0].selected = false;
    await elementUpdated(element);

    expect(element.selectedTab).to.be.null;
    expect(getTabDOM(element.tabs[0]).header.tabIndex).to.equal(0);
  });

  it('makes only the selected panel focusable and inerts the rest', async () => {
    const [first, second] = element.tabs;

    expect(getTabDOM(first).body.tabIndex).to.equal(0);
    expect(getTabDOM(first).body.inert).to.be.false;
    expect(getTabDOM(second).body.tabIndex).to.equal(-1);
    expect(getTabDOM(second).body.inert).to.be.true;

    element.select(second);
    await elementUpdated(element);

    expect(getTabDOM(first).body.inert).to.be.true;
    expect(getTabDOM(second).body.tabIndex).to.equal(0);
    expect(getTabDOM(second).body.inert).to.be.false;
  });

  it('reflects the selected and disabled state to the header', async () => {
    const [first, , third] = element.tabs;

    expect(getTabDOM(first).header.getAttribute('aria-selected')).to.equal(
      'true'
    );
    expect(getTabDOM(third).header.getAttribute('aria-disabled')).to.equal(
      'true'
    );

    third.disabled = false;
    await elementUpdated(third);

    expect(getTabDOM(third).header.getAttribute('aria-disabled')).to.equal(
      'false'
    );
  });
});

function getTabDOM(tab: IgcTabComponent) {
  const root = tab.renderRoot;
  return {
    get header() {
      return root.querySelector<HTMLElement>('[part~="tab-header"]')!;
    },

    get body() {
      return root.querySelector<HTMLElement>('[part~="tab-body"]')!;
    },
  };
}
