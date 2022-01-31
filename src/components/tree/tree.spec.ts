import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { _$LE } from 'lit';
import sinon from 'sinon';
import { defineComponents, IgcCheckboxComponent } from '../..';
import IgcTreeComponent from './tree';
import IgcTreeItemComponent from './tree-item';

const DIFF_OPTIONS = {
  ignoreAttributes: ['id', 'part', 'tabindex', 'role', 'size'],
};

const SLOTS = {
  indentation: 'slot[name="indentation"',
  indicator: 'slot[name="indicator"',
  label: 'slot[name="label"]',
  loading: 'slot[name="loading"]',
};

const PARTS = {
  indentation: 'div[part="indentation"]',
  indicator: 'div[part="indicator"',
  select: 'div[part="select"]',
  label: 'div[part="label"]',
  spacer: 'span[part="spacer"]',
};

describe('Tree', () => {
  before(() => {
    defineComponents(IgcTreeItemComponent, IgcTreeComponent);
  });

  let tree: IgcTreeComponent;

  describe('Basic', async () => {
    beforeEach(async () => {
      tree = await createTreeElement();
    });

    it('Should render tree with items', async () => {
      tree = await createTreeElement(simpleHierarchyTree);

      //tree.items should return all tree items
      expect(tree.items.length).to.equal(14);
      expect(tree).to.contain('igc-tree-item');
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(tree.children.length).to.equal(topLevelItems.length);

      // Verify tree item slots are rendered successfully and elements are correctly displayed.
      tree.items.forEach((item) => {
        const indentationSlot = item.shadowRoot?.querySelector(
          SLOTS.indentation
        );
        expect(indentationSlot).not.to.be.null;
        const spacers = indentationSlot?.querySelectorAll(PARTS.spacer);
        expect(spacers?.length).to.equal(item.level);

        const indicatorSlot = item.shadowRoot?.querySelector(SLOTS.indicator);
        expect(indicatorSlot).not.to.be.null;

        const labelSLot = item.shadowRoot?.querySelector(SLOTS.label);
        expect(labelSLot).not.to.be.null;
        const label = labelSLot?.querySelector('span[part="text"]');
        expect(label?.textContent).to.equal(item.label);

        // the last slot is unnamed and is where child tree items are rendered
        const slots = item.shadowRoot!.querySelectorAll('slot');
        const childrenSlot = Array.from(slots).filter(
          (s) => s.name === ''
        )[0] as HTMLSlotElement;
        expect(childrenSlot).not.to.be.null;
      });
    });

    it('Should support multiple levels of nesting', async () => {
      tree = await createTreeElement(simpleHierarchyTree);

      const treeItem1 = tree.items[0];
      const treeItem1Chidlren = treeItem1.getChildren();
      expect(treeItem1Chidlren.length).to.equal(2);
      expect(treeItem1).dom.to.have.descendants('igc-tree-item');

      const treeItem1GrandChildren = treeItem1Chidlren[0].getChildren();
      expect(treeItem1GrandChildren.length).to.equal(2);
      expect(treeItem1Chidlren[0]).dom.to.have.descendants('igc-tree-item');
    });

    it("Should calculate items' path and level correctly, depending on data hierarchy", async () => {
      tree = await createTreeElement(simpleHierarchyTree);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(topLevelItems.length).to.equal(2);
      expect(topLevelItems[0].path)
        .to.have.lengthOf(1)
        .and.to.contain(topLevelItems[0]);
      expect(topLevelItems[1].path)
        .to.lengthOf(1)
        .and.to.contain(topLevelItems[1]);

      const item1Children = topLevelItems[0].getChildren();
      expect(item1Children.length).to.equal(2);
      expect(item1Children[0].level).to.equal(1);
      expect(item1Children[1].level).to.equal(1);
      expect(item1Children[0].path)
        .to.have.lengthOf(2)
        .and.to.contain(topLevelItems[0])
        .and.to.contain(item1Children[0]);
      expect(
        item1Children[0].path.findIndex((tree) => tree === topLevelItems[0])
      ).to.equal(0);
      expect(
        item1Children[0].path.findIndex((tree) => tree === item1Children[0])
      ).to.equal(1);

      // item.getChildren({flatten: false}) should return only the direct children of item
      const item2Children = topLevelItems[1].getChildren();
      expect(item2Children.length).to.equal(2);
      expect(item2Children[0].level).to.equal(1);
      expect(item2Children[0].path)
        .to.have.lengthOf(2)
        .and.to.contain(topLevelItems[1])
        .and.to.contain(item2Children[0]);
      expect(
        item2Children[0].path.findIndex((tree) => tree === topLevelItems[1])
      ).to.equal(0);
      expect(
        item2Children[0].path.findIndex((tree) => tree === item2Children[0])
      ).to.equal(1);

      const item2GrandChildren = item2Children[0].getChildren();
      expect(item2GrandChildren.length).to.equal(2);
      expect(item2GrandChildren[0].level).to.equal(2);
      expect(item2GrandChildren[0].path.length).to.equal(3);
      expect(item2GrandChildren[0].path)
        .to.contain(topLevelItems[1])
        .and.to.contain(item2Children[0])
        .and.to.contain(item2GrandChildren[0]);
      expect(
        item2GrandChildren[0].path.findIndex(
          (tree) => tree === topLevelItems[1]
        )
      ).to.equal(0);
      expect(
        item2GrandChildren[0].path.findIndex(
          (tree) => tree === item2Children[0]
        )
      ).to.equal(1);
      expect(
        item2GrandChildren[0].path.findIndex(
          (tree) => tree === item2GrandChildren[0]
        )
      ).to.equal(2);

      // item.getChildren({flatten: true}) should return all item's children
      const item2AllChildren = topLevelItems[1].getChildren({ flatten: true });
      expect(item2AllChildren.length).to.equal(6);
    });

    it("Should be able to set tree item's value and label properties successfully", async () => {
      tree = await createTreeElement(simpleTree);

      expect(tree.items[0].label).to.equal('Tree Node 1');
      expect(tree.items[0].value).to.equal('val1');
      expect(tree.items[1].value).to.be.undefined;
      tree.items[0].label = 'Tree Node 1 new';
      await elementUpdated(tree);
      expect(tree.items[0].label).to.equal('Tree Node 1 new');
      tree.items[1].value = 'val2';
      await elementUpdated(tree);
      expect(tree.items[1].value).to.equal('val2');
    });

    it("Should not render collapsed item's children", async () => {
      tree = await createTreeElement(expandCollapseTree);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(topLevelItems[0].expanded).to.be.false; // collapsed by default
      expect(topLevelItems[1].expanded).to.be.true;

      const slots1 = topLevelItems[0].shadowRoot!.querySelectorAll('slot');
      const childrenSlot1 = Array.from(slots1).filter((s) => s.name === '');
      expect((childrenSlot1[0] as HTMLSlotElement).hidden).to.be.true;

      const slots2 = topLevelItems[1].shadowRoot!.querySelectorAll('slot');
      const childrenSlot2 = Array.from(slots2).filter((s) => s.name === '');
      expect((childrenSlot2[0] as HTMLSlotElement).hidden).to.be.false;
    });

    it('Should not render expand indicator if an item has no children', async () => {
      tree = await createTreeElement(simpleTree);

      tree.items.forEach((item) => {
        const indSlot = getSlot(item, SLOTS.indicator);
        expect(indSlot).to.exist;
        expect(indSlot).shadowDom.not.to.have.descendant('igc-icon');
      });
    });

    it("Should not render default select indicator if selection mode is 'None'", async () => {
      tree = await createTreeElement(simpleTree);
      expect(tree.selection).to.equal('none'); // by default

      tree.items.forEach((item) => {
        const selectionPart = item.shadowRoot!.querySelector(PARTS.select);
        expect(selectionPart).to.be.null;
      });

      tree.selection = 'multiple';
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        const selectionPart = item.shadowRoot!.querySelector(PARTS.select);
        expect(selectionPart).dom.to.equal(
          `<div part="select">
              <igc-checkbox></igc-checkbox>
          </div>`,
          DIFF_OPTIONS
        );
      });
    });

    it('Should render default indicator for expansion properly depending on item state', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);

      const item1IndSlot = getSlot(topLevelItems[0], SLOTS.indicator);
      expect(item1IndSlot).to.exist;
      expect(topLevelItems[0].expanded).to.be.false;
      verifyIndicatorIcon(item1IndSlot, topLevelItems[0].expanded);

      const item2IndSlot = getSlot(topLevelItems[1], SLOTS.indicator);
      expect(item2IndSlot).to.exist;
      expect(topLevelItems[1].expanded).to.be.true;
      verifyIndicatorIcon(item2IndSlot, topLevelItems[1].expanded);
    });

    it('Should render default select marker properly depending on item state', async () => {
      tree = await createTreeElement(expandCollapseTree);

      tree.selection = 'multiple';
      await elementUpdated(tree);

      expect(tree.items[0].selected).to.be.false;
      let selectionPart = tree.items[0].shadowRoot!.querySelector(PARTS.select);
      expect(selectionPart).lightDom.to.equal(
        `<igc-checkbox></igc-checkbox>`,
        DIFF_OPTIONS
      );

      let cb = selectionPart?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.false;

      tree.items[0].selected = true;
      await elementUpdated(tree);

      selectionPart = tree.items[0].shadowRoot!.querySelector(PARTS.select);
      cb = selectionPart?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.true;
      expect(cb.indeterminate).to.be.false;

      tree.selection = 'cascade';
      tree.items[0].selected = false;
      tree.items[0].getChildren()[0].selected = true;
      await elementUpdated(tree);

      expect(tree.items[0].getChildren()[0].selected).to.be.true;
      expect(tree.items[0].getChildren()[1].selected).to.be.false;

      cb = selectionPart?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.true;
    });

    it('Should accept custom slot for the tree item expansion indicator', async () => {
      tree = await createTreeElement(expandCollapseTree);

      const topLevelItems = tree.items.filter((i) => i.level === 0);

      const indSlot1 = getSlot(topLevelItems[0], SLOTS.indicator);

      const els = indSlot1.assignedElements();
      expect(els.length).to.equal(1);
      expect(els[0].tagName).to.equal('SPAN');
      expect(els[0].textContent).to.equal('ind');
      expect(els[0]).to.have.attribute('slot', 'indicator');

      // verify the default indicator is displayed for other top item
      const indSlot2 = getSlot(topLevelItems[1], SLOTS.indicator);
      verifyIndicatorIcon(indSlot2, topLevelItems[1].expanded);
      expect(indSlot2.assignedElements().length).to.equal(0);
    });

    it('Should accept custom slot for the tree item indentation area', async () => {
      tree = await createTreeElement(expandCollapseTree);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const indentationSlot11 = getSlot(
        topLevelItems[0].getChildren()[0],
        SLOTS.indentation
      );

      const els = indentationSlot11.assignedElements();
      expect(els.length).to.equal(1);
      expect(els[0].tagName).to.equal('SPAN');
      expect(els[0].textContent).to.equal('-');
      expect(els[0]).to.have.attribute('slot', 'indentation');

      // verify the default indentation span is displayed for other child item
      const indentationSlot12 = getSlot(
        topLevelItems[0].getChildren()[1],
        SLOTS.indentation
      );
      expect(indentationSlot12).lightDom.to.equal(
        `<span part="spacer"></span>`,
        DIFF_OPTIONS
      );
      expect(indentationSlot12.assignedElements().length).to.equal(0);
    });

    it('Should accept custom slot for the tree item label', async () => {
      tree = await createTreeElement(expandCollapseTree);

      const item11 = tree.items[0].getChildren()[0];
      const labelSlot11 = getSlot(item11, SLOTS.label);

      const els = labelSlot11.assignedElements();
      expect(els.length).to.equal(1);
      expect(els[0].tagName).to.equal('SPAN');
      expect(els[0].textContent).to.equal('Label via slot');
      expect(els[0]).to.have.attribute('slot', 'label');
      // verify default label span not being displayed
      expect(item11).dom.not.to.have.descendants('span[part="text"]');
    });

    it('Should accept custom slot for the tree item loading indicator', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);

      const item21 = topLevelItems[1].getChildren()[0];
      let loadingSlot21 = getSlot(item21, SLOTS.loading);
      let indSlot21 = getSlot(item21, SLOTS.indicator);
      expect(indSlot21).not.to.be.null;
      expect(loadingSlot21).to.be.null;
      expect(item21.loading).to.be.false;

      item21.loading = true;
      await elementUpdated(tree);

      loadingSlot21 = getSlot(item21, SLOTS.loading);
      expect(item21.loading).to.be.true;

      const els = loadingSlot21.assignedElements();
      expect(els.length).to.equal(1);
      expect(els[0].tagName).to.equal('SPAN');
      expect(els[0].textContent).to.equal('*');
      expect(els[0]).to.have.attribute('slot', 'loading');
      // verify default loading icon //TODO: this will be changed
      expect(item21).dom.not.to.have.descendants('igc-icon');

      //don't display indicator slot when item is loading
      indSlot21 = getSlot(item21, SLOTS.indicator);
      expect(indSlot21).to.be.null;
    });

    it('Should emit igcActiveItem event when the active item changes', async () => {
      tree = await createTreeElement(simpleHierarchyTree);

      const eventSpy = sinon.spy(tree, 'emitEvent');
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        const selectionPart = item.shadowRoot!.querySelector(PARTS.select);
        expect(selectionPart).to.be.null;
      });

      tree.items[0].dispatchEvent(new PointerEvent('pointerdown'));
      await elementUpdated(tree);
      expect(tree.navService.activeItem).to.equal(tree.items[0]);
      expect(eventSpy).calledOnceWithExactly('igcActiveItem', {
        detail: tree.items[0],
      });

      eventSpy.resetHistory();

      tree.navService.setActiveItem(tree.items[1], true);
      await elementUpdated(tree);
      expect(tree.navService.activeItem).to.equal(tree.items[1]);
      expect(eventSpy).calledOnceWithExactly('igcActiveItem', {
        detail: tree.items[1],
      });

      eventSpy.resetHistory();

      tree.navService.setActiveItem(tree.items[2], false);
      await elementUpdated(tree);
      expect(tree.navService.activeItem).to.equal(tree.items[2]);
      expect(eventSpy).not.called;
    });

    it('Should activate the last tree item set as active if there are multiple', async () => {
      tree = await createTreeElement(activeItemsTree);

      tree.items.forEach(async (item) => {
        //expect(item.wrapper).not.to.be.null;
        if (item.label === 'Tree Node 2.1') {
          await expect(item.active).to.be.true;
          await expect(tree.navService.activeItem).to.equal(item);
        } else {
          await expect(item.active).to.be.false;
          await expect(tree.navService.activeItem).not.to.equal(item);
        }
      });
    });

    it('When an item is added/deleted the visible tree items collection should be calculated properly', async () => {
      tree = await createTreeElement(simpleTree);

      expect(tree.items.length).to.equal(3);

      const child = tree.ownerDocument.createElement('igc-tree-item');
      child.innerHTML = `<p slot="label">Added Child 11</p>`;
      tree.items[0].appendChild(child);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(4);
      expect(tree.items[0]).dom.to.have.descendants('igc-tree-item');

      const child2 = tree.ownerDocument.createElement('igc-tree-item');
      child.innerHTML = `<p slot="label">Added Child 111</p>`;
      tree.items[0].getChildren()[0].appendChild(child2);
      await elementUpdated(tree);
      expect(tree.items[0].getChildren()[0]).dom.to.have.descendants(
        'igc-tree-item'
      );
      expect(tree.items.length).to.equal(5);

      const child4 = tree.items[3];
      child4.parentNode?.removeChild(child4);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(4);

      const child1 = tree.items[0];
      child1.parentNode?.removeChild(child1);
      await elementUpdated(tree);
      // child1 has a child item - it and its children (2) should also have been removed
      expect(tree.items.length).to.equal(1);
    });
  });

  describe('Expand/Collapse', async () => {
    beforeEach(async () => {
      tree = await createTreeElement();
    });

    it('Should expand all collapsed (including the disabled) items w/ tree.expand()', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      tree.expand();
      await elementUpdated(tree);

      expect(eventSpy.notCalled).to.be.true; // event is not emitted when expanding through API
      tree.items.forEach((item) => {
        expect(item.expanded).to.be.true;
      });
    });

    it('Should expand only specified items w/ tree.expand(item: IgcTreeItemComponent[])', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const eventSpy = sinon.spy(tree, 'emitEvent');
      const items = [tree.items[0], ...tree.items[0].getChildren()];

      tree.expand(items);
      await elementUpdated(tree);

      expect(eventSpy.notCalled).to.be.true; // event is not emitted when expanding through API
      items.forEach((item) => {
        expect(item.expanded).to.be.true;
      });
    });

    it('Should collapse all expanded (including the disabled) items w/ tree.collapse()', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      tree.collapse();
      await elementUpdated(tree);

      expect(eventSpy.notCalled).to.be.true; // event is not emitted when collapsing through API
      tree.items.forEach((item) => {
        expect(item.expanded).to.be.false;
      });
    });

    it('Should collapse only specified items w/ tree.collapse(item: IgcTreeItemComponent[])', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const items = [topLevelItems[1], topLevelItems[1].getChildren()[0]];
      const eventSpy = sinon.spy(tree, 'emitEvent');

      tree.collapse(items);
      await elementUpdated(tree);

      expect(eventSpy.notCalled).to.be.true; // event is not emitted when collapsing through API
      items.forEach((item) => {
        expect(item.expanded).to.be.false;
      });
    });

    it('Should collapse items when user interacts w/ indicator and item.expanded === false', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);

      expect(topLevelItems[1].expanded).to.be.true;
      const childItem21 = topLevelItems[1].getChildren()[0];
      expect(childItem21.expanded).to.be.true;

      const eventSpy = sinon.spy(tree, 'emitEvent');

      const item2IndSlot = getSlot(topLevelItems[1], SLOTS.indicator);

      item2IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], false);

      // Should emit ing and ed events when item state is toggled through UI
      const collapsingArgs = {
        detail: {
          node: topLevelItems[1],
        },
        cancelable: true,
      };
      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith(
        'igcItemCollapsing',
        collapsingArgs
      );
      expect(eventSpy.secondCall).calledWith('igcItemCollapsed', {
        detail: topLevelItems[1],
      });

      eventSpy.resetHistory();

      const item21IndSlot = getSlot(childItem21, SLOTS.indicator);

      item21IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      // Should not collapse disabled item
      expect(childItem21.disabled).to.be.true;
      verifyExpansionState(childItem21, true);
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should expand items when user interacts w/ indicator and item.expanded === true', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(topLevelItems[0].expanded).to.be.false;
      const childItem11 = topLevelItems[0].getChildren()[0];
      expect(childItem11.expanded).to.be.false;

      const eventSpy = sinon.spy(tree, 'emitEvent');

      const item1IndSlot = getSlot(topLevelItems[0], SLOTS.indicator);

      item1IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[0], true);

      // Should emit ing and ed events when item state is toggled through UI
      const expandingArgs = {
        detail: {
          node: topLevelItems[0],
        },
        cancelable: true,
      };
      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcItemExpanding', expandingArgs);
      expect(eventSpy.secondCall).calledWith('igcItemExpanded', {
        detail: topLevelItems[0],
      });

      eventSpy.resetHistory();

      const item11IndSlot = getSlot(childItem11, SLOTS.indicator);

      item11IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      // Should not expand disabled item
      expect(childItem11.disabled).to.be.true;
      verifyExpansionState(childItem11, false);
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should collapse items when item.expanded is set to false', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      expect(topLevelItems[1].expanded).to.be.true;

      topLevelItems[1].expanded = false;
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], false);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should expand items when item.expanded is set to true', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      expect(topLevelItems[0].expanded).to.be.false;

      topLevelItems[0].expanded = true;
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[0], true);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should expand items when item.expand() is called', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      expect(topLevelItems[0].expanded).to.be.false;

      topLevelItems[0].expand();
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[0], true);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should collapse items when item.collapse() is called', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      expect(topLevelItems[1].expanded).to.be.true;

      topLevelItems[1].collapse();
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], false);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should toggle item state when item.toggle() is called', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const eventSpy = sinon.spy(tree, 'emitEvent');

      expect(topLevelItems[1].expanded).to.be.true;

      topLevelItems[1].toggle();
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], false);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;

      topLevelItems[1].toggle();
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], true);
      // Should not emit event when collapsed through API
      expect(eventSpy.notCalled).to.be.true;
    });

    it('Should be able to prevent the expansion/collapsing through the ing events.', async () => {
      tree = await createTreeElement(expandCollapseTree);
      const topLevelItems = tree.items.filter((i) => i.level === 0);

      const eventSpy = sinon.spy(tree, 'emitEvent');

      const item1IndSlot = getSlot(topLevelItems[0], SLOTS.indicator);

      tree.addEventListener('igcItemExpanding', (ev) => {
        ev.preventDefault();
      });

      item1IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[0], false);

      const expandingArgs = {
        detail: {
          node: topLevelItems[0],
        },
        cancelable: true,
      };
      expect(eventSpy.callCount).to.equal(1);
      expect(eventSpy.firstCall).calledWith('igcItemExpanding', expandingArgs);
      eventSpy.resetHistory();

      const item2IndSlot = getSlot(topLevelItems[1], SLOTS.indicator);

      tree.addEventListener('igcItemCollapsing', (ev) => {
        ev.preventDefault();
      });

      item2IndSlot?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      verifyExpansionState(topLevelItems[1], true);

      const collapsingArgs = {
        detail: {
          node: topLevelItems[1],
        },
        cancelable: true,
      };
      expect(eventSpy.callCount).to.equal(1);
      expect(eventSpy.firstCall).calledWith(
        'igcItemCollapsing',
        collapsingArgs
      );
    });

    describe('singleBranchExpand', async () => {
      beforeEach(async () => {
        tree = await createTreeElement();
      });

      it('If singleBranchExpand === true, should support only one expanded tree item per level.', async () => {
        tree = await createTreeElement(simpleHierarchyTree);
        tree.singleBranchExpand = true;
        await elementUpdated(tree);

        //Level 0
        const topLevelItems = tree.items.filter((i) => i.level === 0);
        const item1IndSlot = getSlot(topLevelItems[0], SLOTS.indicator);
        const item2IndSlot = getSlot(topLevelItems[1], SLOTS.indicator);

        item1IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(topLevelItems[0], true);
        verifyExpansionState(topLevelItems[1], false);

        item2IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(topLevelItems[0], false);
        verifyExpansionState(topLevelItems[1], true);

        // Level 1
        const item2Children = topLevelItems[1].getChildren();
        // topLevelItems[1] is currenlty expanded
        const item21IndSlot = getSlot(item2Children[0], SLOTS.indicator);
        const item22IndSlot = getSlot(item2Children[1], SLOTS.indicator);

        item21IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(item2Children[0], true);
        verifyExpansionState(item2Children[1], false);

        item22IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(item2Children[0], false);
        verifyExpansionState(item2Children[1], true);
      });

      it('If singleBranchExpand === true and item.active is set to true, should expand all item to the active one and collapse the other branches.', async () => {
        tree = await createTreeElement(simpleHierarchyTree);

        tree.expand();
        await elementUpdated(tree);

        tree.singleBranchExpand = true;
        await elementUpdated(tree);

        //Should collapse all items when setting singleBranchExpand to true and there is no active tree item.
        tree.items.forEach((item) => {
          expect(item.expanded).to.be.false;
          expect(item.active).to.be.false;
        });

        const topLevelItems = tree.items.filter((i) => i.level === 0);
        const item11 = topLevelItems[0].getChildren()[0];

        item11.active = true;
        await elementUpdated(tree);

        expect(topLevelItems[0].expanded).to.be.true;
        expect(item11.expanded).to.be.false;
        tree.items.forEach((item) => {
          if (item !== item11 && item !== topLevelItems[0]) {
            expect(item.expanded, item.label).to.be.false;
          }
        });
      });

      it('If singleBranchExpand === true and the item is expanded through API, should not collapse the currently expanded items.', async () => {
        tree = await createTreeElement(simpleHierarchyTree);
        tree.singleBranchExpand = true;
        await elementUpdated(tree);

        //Level 0
        const topLevelItems = tree.items.filter((i) => i.level === 0);
        const item2IndSlot = getSlot(topLevelItems[1], SLOTS.indicator);

        item2IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(topLevelItems[1], true);

        const item2Children = topLevelItems[1].getChildren();
        const item21IndSlot = getSlot(item2Children[0], SLOTS.indicator);

        item21IndSlot?.dispatchEvent(new MouseEvent('click'));
        await elementUpdated(tree);

        verifyExpansionState(item2Children[0], true);
        verifyExpansionState(item2Children[1], false);

        tree.expand([item2Children[1]]); // expand item22 through API
        await elementUpdated(tree);

        verifyExpansionState(item2Children[0], true); // verify the other item on the same level is still expanded
        verifyExpansionState(item2Children[1], true);
      });

      it("When enabling singleBranchExpand and there is an active item, should collapse all tree items except the active item's ancestors.", async () => {
        tree = await createTreeElement(simpleHierarchyTree);

        tree.expand();
        await elementUpdated(tree);

        const topLevelItems = tree.items.filter((i) => i.level === 0);
        const item11 = topLevelItems[0].getChildren()[0];
        const item111 = item11.getChildren()[0];

        item111.active = true;
        await elementUpdated(tree);

        tree.singleBranchExpand = true;
        await elementUpdated(tree);

        expect(topLevelItems[0].expanded).to.be.true;
        expect(item11.expanded).to.be.true;
        tree.items.forEach((item) => {
          if (item !== item11 && item !== topLevelItems[0]) {
            expect(item.expanded, item.label).to.be.false;
          }
        });
      });
    });
  });
});

const createTreeElement = (template = '<igc-tree></igc-tree>') => {
  return fixture<IgcTreeComponent>(html`${unsafeStatic(template)}`);
};

const simpleTree = `<igc-tree>
                      <igc-tree-item label="Tree Node 1" value="val1"></igc-tree-item>
                      <igc-tree-item label="Tree Node 2"></igc-tree-item>
                      <igc-tree-item label="Tree Node 3"></igc-tree-item>
                    </igc-tree>`;

const simpleHierarchyTree = `<igc-tree>
                              <igc-tree-item label="Tree Node 1">
                                  <igc-tree-item label="Tree Node 1.1">
                                    <igc-tree-item label="Tree Node 1.1.1"></igc-tree-item>
                                    <igc-tree-item label="Tree Node 1.1.2"></igc-tree-item>
                                  </igc-tree-item>
                                  <igc-tree-item label="Tree Node 1.2">
                                    <igc-tree-item label="Tree Node 1.2.1"></igc-tree-item>
                                    <igc-tree-item label="Tree Node 1.2.2"></igc-tree-item>
                                  </igc-tree-item>
                                </igc-tree-item>
                              <igc-tree-item label="Tree Node 2">
                                  <igc-tree-item label="Tree Node 2.1">
                                      <igc-tree-item label="Tree Node 2.1.1"></igc-tree-item>
                                      <igc-tree-item label="Tree Node 2.1.2"></igc-tree-item>
                                  </igc-tree-item>
                                  <igc-tree-item label="Tree Node 2.2">
                                    <igc-tree-item label="Tree Node 2.2.1"></igc-tree-item>
                                    <igc-tree-item label="Tree Node 2.2.2"></igc-tree-item>
                                  </igc-tree-item>
                              </igc-tree-item>
                          </igc-tree>`;

const expandCollapseTree = `<igc-tree>
                              <igc-tree-item label="Tree Node 1">
                                <span slot="indicator">ind</span>
                                <igc-tree-item label="Tree Node 1.1" disabled>
                                  <span slot="indentation">-</span>
                                  <span slot="label">Label via slot</span>
                                  <igc-tree-item label="Tree Node 1.1.1"></igc-tree-item>
                                  </igc-tree-item>
                                  <igc-tree-item label="Tree Node 1.2"></igc-tree-item>
                                </igc-tree-item>
                                <igc-tree-item expanded label="Tree Node 2">
                                  <igc-tree-item label="Tree Node 2.1" expanded disabled>
                                    <span slot="loading">*</span>
                                    <igc-tree-item label="Tree Node 2.1.1"></igc-tree-item>
                                  </igc-tree-item>
                              </igc-tree-item>
                            </igc-tree>`;

const activeItemsTree = `<igc-tree>
                           <igc-tree-item expanded label="Tree Node 1" active>
                              <igc-tree-item label="Tree Node 1.1" expanded active></igc-tree-item>
                              <igc-tree-item label="Tree Node 1.2" expanded active></igc-tree-item>
                            </igc-tree-item>
                              <igc-tree-item expanded label="Tree Node 2" >
                                <igc-tree-item label="Tree Node 2.1" expanded active>
                                <igc-tree-item label="Tree Node 2.1.1"></igc-tree-item>
                            </igc-tree-item>
                          </igc-tree-item>
                        </igc-tree>`;

const verifyExpansionState = (
  item: IgcTreeItemComponent,
  expectedState: boolean
): void => {
  const indSlot = getSlot(item, SLOTS.indicator);
  expect(item.expanded).to.equal(expectedState);
  verifyIndicatorIcon(indSlot, expectedState);
};

const verifyIndicatorIcon = (
  slot: HTMLSlotElement,
  expanded: boolean
): void => {
  expect(slot).lightDom.to.equal(
    `<igc-icon name=${
      expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
    } collection="internal"></igc-icon>`,
    DIFF_OPTIONS
  );
};

const getSlot = (
  item: IgcTreeItemComponent,
  selector: string
): HTMLSlotElement => {
  return item.shadowRoot!.querySelector(selector) as HTMLSlotElement;
};
