import { elementUpdated, expect } from '@open-wc/testing';
import { spy } from 'sinon';

import { defineComponents, type IgcCheckboxComponent } from '../../index.js';
import IgcTreeItemComponent from './tree-item.js';
import {
  cascadeSelectionTree,
  PARTS,
  selectedItemsTree,
  simpleTree,
  TreeTestFunctions,
} from './tree-utils.spec.js';
import type { TreeSelectionEventInit } from './tree.common.js';
import IgcTreeComponent from './tree.js';
import type { IgcTreeSelectionService } from './tree.selection.js';

describe('Tree Selection', () => {
  before(() => {
    defineComponents(IgcTreeItemComponent, IgcTreeComponent);
  });

  let tree: IgcTreeComponent;
  let treeSelectionService: IgcTreeSelectionService;
  let initialSelection: IgcTreeItemComponent[];

  describe('Basic', () => {
    beforeEach(async () => {
      tree = await TreeTestFunctions.createTreeElement(selectedItemsTree);
      treeSelectionService = tree.selectionService;
      initialSelection = tree.items.filter((item) => item.selected === true);
    });

    it("Should be able to change selection type to all 3 options ('None' (default), 'Multiple', 'Cascade')", async () => {
      tree = await TreeTestFunctions.createTreeElement(simpleTree);
      treeSelectionService = tree.selectionService;
      expect(tree.selection).to.equal('none');

      // The API selects items even while the selection is 'none'.
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      tree.select([topLevelItems[0]]);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);

      topLevelItems[1].selected = true;
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[1], true);

      tree.selection = 'multiple';
      await elementUpdated(tree);
      expect(tree.selection).to.equal('multiple');

      tree.selection = 'cascade';
      await elementUpdated(tree);
      expect(tree.selection).to.equal('cascade');
    });

    it('Should deselect all selected items w/ tree.deselect())', async () => {
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const item1 = topLevelItems[0];
      const item11 = item1.getChildren()[0];
      const item2 = topLevelItems[1];
      const selectedItems = [item1, item11, item2];

      initialSelection.forEach((item) => {
        expect(selectedItems).to.contain(item);
        TreeTestFunctions.verifyItemSelection(item, true);
      });

      tree.items.forEach((item) => {
        if (selectedItems.indexOf(item) === -1) {
          TreeTestFunctions.verifyItemSelection(item, false);
        }
      });

      tree.deselect();
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        TreeTestFunctions.verifyItemSelection(item, false);
      });
    });

    it('Should deselect only specified items w/ tree.deselect(item: IgcTreeItemComponent[])', async () => {
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const item1 = topLevelItems[0];
      const item11 = item1.getChildren()[0];
      const item2 = topLevelItems[1];
      const selectedItems = [item1, item11, item2];

      tree.deselect([selectedItems[0], selectedItems[1]]);
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        if (item !== selectedItems[2]) {
          TreeTestFunctions.verifyItemSelection(item, false);
        }
      });
    });

    it('Should select all deselected items w/ tree.select()', async () => {
      expect(initialSelection.length).to.be.lessThan(tree.items.length);

      tree.select();
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        TreeTestFunctions.verifyItemSelection(item, true);
      });
    });

    it('Should select only specified items w/ tree.select(item: IgcTreeItemComponent[])', async () => {
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const item2 = topLevelItems[1];
      const itemsToSelect = [
        item2,
        item2.getChildren()[0],
        item2.getChildren()[1],
      ];

      tree.deselect();
      await elementUpdated(tree);
      tree.select(itemsToSelect);
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        if (itemsToSelect.indexOf(item) === -1) {
          TreeTestFunctions.verifyItemSelection(item, false);
        } else {
          TreeTestFunctions.verifyItemSelection(item, true);
        }
      });

      // A new selection adds to the selected items.
      itemsToSelect.push(topLevelItems[0]);
      tree.select([topLevelItems[0]]);
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        if (itemsToSelect.indexOf(item) === -1) {
          TreeTestFunctions.verifyItemSelection(item, false);
        } else {
          TreeTestFunctions.verifyItemSelection(item, true);
        }
      });
    });

    it('Deleting an item should keep its selection state', async () => {
      const topLevelItems = tree.items.filter((i) => i.level === 0);
      let item11 = topLevelItems[0].getChildren()[0];
      expect(item11.selected).to.be.true;
      expect(treeSelectionService.isItemSelected(item11)).to.be.true;

      expect(tree.items.length).to.equal(14);
      expect(topLevelItems[0].getChildren().length).to.equal(2);

      item11.parentNode?.removeChild(item11);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(12); // item11 has a child item, so it is also removed
      expect(topLevelItems[0].getChildren().length).to.equal(1);

      expect(item11.selected).to.be.true;

      tree.items[0].insertBefore(item11, topLevelItems[0].getChildren()[0]);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(14);
      expect(topLevelItems[0].getChildren().length).to.equal(2);

      item11 = topLevelItems[0].getChildren()[0];
      TreeTestFunctions.verifyItemSelection(item11, true);
    });
  });

  describe('Multiple', () => {
    let topLevelItems: IgcTreeItemComponent[];
    let eventSpy: any;

    beforeEach(async () => {
      tree = await TreeTestFunctions.createTreeElement(selectedItemsTree);
      treeSelectionService = tree.selectionService;
      initialSelection = tree.items.filter((item) => item.selected === true);
      topLevelItems = tree.items.filter((i) => i.level === 0);
      eventSpy = spy(tree, 'emitEvent');
    });

    it('Should be able to set item.selected correctly', async () => {
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      topLevelItems[0].selected = false;
      await elementUpdated(tree);
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], false);

      const item12 = topLevelItems[0].getChildren()[1];
      TreeTestFunctions.verifyItemSelection(item12, false);
      item12.selected = true;
      await elementUpdated(tree);
      TreeTestFunctions.verifyItemSelection(item12, true);
    });

    it('Should select/deselect an item by clicking on the checkbox and emit igcSelection event with proper arguments', async () => {
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);

      let selectionPart = topLevelItems[0].shadowRoot!.querySelector(
        PARTS.select
      );
      let cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], false);
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.false;
      expect(tree.selectionService.isItemIndeterminate(topLevelItems[0])).to.be
        .false;

      initialSelection.shift();

      let args: TreeSelectionEventInit = {
        detail: {
          newSelection: initialSelection,
        },
        cancelable: true,
      };
      expect(eventSpy).calledWith('igcSelection', args);
      eventSpy.resetHistory();

      const item12 = topLevelItems[0].getChildren()[1];
      TreeTestFunctions.verifyItemSelection(item12, false);

      selectionPart = item12.shadowRoot!.querySelector(PARTS.select);
      cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item12, true);
      expect(cb.checked).to.be.true;
      expect(cb.indeterminate).to.be.false;
      expect(tree.selectionService.isItemIndeterminate(item12)).to.be.false;

      args = {
        detail: {
          newSelection: [...initialSelection, item12],
        },
        cancelable: true,
      };
      expect(eventSpy).calledOnceWith('igcSelection', args);
      eventSpy.resetHistory();
    });

    it('Should be able to prevent the igcSelection event.', async () => {
      tree.addEventListener('igcSelection', (ev) => {
        ev.preventDefault();
      });

      const item12 = topLevelItems[0].getChildren()[1];
      TreeTestFunctions.verifyItemSelection(item12, false);

      const selectionPart = item12.shadowRoot!.querySelector(PARTS.select);
      const cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item12, false);
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.false;

      const args: TreeSelectionEventInit = {
        detail: {
          newSelection: [...initialSelection, item12],
        },
        cancelable: true,
      };

      expect(eventSpy).calledOnceWith('igcSelection', args);
      TreeTestFunctions.verifyItemSelection(item12, false);

      tree.items.forEach((item) => {
        if (initialSelection.indexOf(item) === -1) {
          TreeTestFunctions.verifyItemSelection(item, false);
        } else {
          TreeTestFunctions.verifyItemSelection(item, true);
        }
      });
    });

    it('When selecting a range of records using Shift + click key selection of parents should NOT select their children if they are not in the selected range', async () => {
      tree.deselect();
      await elementUpdated(tree);

      // Select items from "Tree Item 1" to "Tree Item 2.2"
      const expectedSelection = [
        topLevelItems[0],
        ...topLevelItems[0].getChildren({ flatten: true }),
        topLevelItems[1],
        topLevelItems[1].getChildren()[0],
        topLevelItems[1].getChildren()[1],
      ];

      let args: TreeSelectionEventInit = {
        detail: {
          newSelection: [topLevelItems[0]],
        },
        cancelable: true,
      };

      let selectionPart = topLevelItems[0].shadowRoot!.querySelector(
        PARTS.select
      );
      let cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      expect(eventSpy).calledOnceWith('igcSelection', args);
      eventSpy.resetHistory();

      const endOfSelectionRage = topLevelItems[1].getChildren()[1];

      selectionPart = endOfSelectionRage.shadowRoot!.querySelector(
        PARTS.select
      );
      cb = selectionPart?.children[0] as IgcCheckboxComponent;

      args = {
        detail: {
          newSelection: expectedSelection,
        },
        cancelable: true,
      };

      cb?.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        if (expectedSelection.indexOf(item) === -1) {
          // All items out of the selected range are deselected, including the last child of "Tree Item 2" - "Tree Item 2.3"
          TreeTestFunctions.verifyItemSelection(item, false);
        } else {
          TreeTestFunctions.verifyItemSelection(item, true);
        }
      });

      expect(eventSpy).calledOnceWith('igcSelection', args);
      eventSpy.resetHistory();

      // The same range again emits no event.
      selectionPart = expectedSelection[0].shadowRoot!.querySelector(
        PARTS.select
      );
      cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      await elementUpdated(tree);

      expect(eventSpy).not.to.be.called;
    });

    it('Should select a single item when there are no selected items and selction is performed with Shift + click', async () => {
      tree.deselect();
      await elementUpdated(tree);

      const args: TreeSelectionEventInit = {
        detail: {
          newSelection: [topLevelItems[2]],
        },
        cancelable: true,
      };

      const selectionPart = topLevelItems[2].shadowRoot!.querySelector(
        PARTS.select
      );
      const cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[2], true);
      expect(eventSpy).calledOnceWith('igcSelection', args);
      eventSpy.resetHistory();
    });
  });

  describe('Cascading', () => {
    let topLevelItems: IgcTreeItemComponent[];

    beforeEach(async () => {
      tree = await TreeTestFunctions.createTreeElement(cascadeSelectionTree);
      treeSelectionService = tree.selectionService;
      initialSelection = tree.items.filter((item) => item.selected === true);
      topLevelItems = tree.items.filter((i) => i.level === 0);
    });

    it('Selecting an item should select its not selected children', async () => {
      const item1Children = topLevelItems[0].getChildren({ flatten: true });

      expect(initialSelection).to.contain(topLevelItems[0]);

      // A selected parent selects all its children, also the ones marked as deselected.
      item1Children.forEach((child) => {
        expect(initialSelection).to.contain(child);
        TreeTestFunctions.verifyItemSelection(child, true);
      });

      const item2Children = topLevelItems[1].getChildren({ flatten: true });
      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);

      item2Children.forEach((child) => {
        TreeTestFunctions.verifyItemSelection(child, false);
      });

      topLevelItems[1].selected = true;
      await elementUpdated(tree);

      item2Children.forEach((child) => {
        TreeTestFunctions.verifyItemSelection(child, true);
      });

      topLevelItems[0].selected = false;
      await elementUpdated(tree);

      item1Children.forEach((child) => {
        TreeTestFunctions.verifyItemSelection(child, false);
      });
    });

    it('Changing the selection mode should clear the indeterminate state of the parents', async () => {
      const parent = topLevelItems[1].getChildren()[0];
      const child = parent.getChildren()[0];

      child.selected = true;
      await elementUpdated(tree);

      expect(parent.indeterminate).to.be.true;
      expect(topLevelItems[1].indeterminate).to.be.true;

      tree.selection = 'multiple';
      await elementUpdated(tree);

      expect(child.selected).to.be.false;
      expect(parent.indeterminate).to.be.false;
      expect(topLevelItems[1].indeterminate).to.be.false;
      expect(treeSelectionService.isItemIndeterminate(parent)).to.be.false;
    });

    it('Selecting all children of a parent should mark the parent as selected. All direct and non-direct parents should be affected correctly', async () => {
      const item2Children = topLevelItems[1].getChildren();
      const item211 = item2Children[0].getChildren()[0];
      const item212 = item2Children[0].getChildren()[1];

      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);

      item211.selected = true;
      await elementUpdated(tree);

      // One selected child makes the parent and its ancestors indeterminate.
      TreeTestFunctions.verifyItemSelection(item211, true);
      expect(item2Children[0].indeterminate).to.be.true;
      expect(tree.selectionService.isItemIndeterminate(item2Children[0])).to.be
        .true;
      TreeTestFunctions.verifyItemSelection(item2Children[1], false);
      TreeTestFunctions.verifyItemSelection(item2Children[2], false);
      expect(topLevelItems[1].indeterminate).to.be.true;
      expect(tree.selectionService.isItemIndeterminate(topLevelItems[1])).to.be
        .true;

      // The last child to be selected makes the parent selected, not indeterminate.
      tree.select([item212]);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item212, true);
      // all of item21's children are selected
      TreeTestFunctions.verifyItemSelection(item2Children[0], true);
      expect(item2Children[0].indeterminate).to.be.false;

      TreeTestFunctions.verifyItemSelection(item2Children[1], false);
      TreeTestFunctions.verifyItemSelection(item2Children[2], false);
      expect(topLevelItems[1].indeterminate).to.be.true;

      tree.select([item2Children[1], item2Children[2]]);
      await elementUpdated(tree);
      // all of item2's children are selected
      TreeTestFunctions.verifyItemSelection(topLevelItems[1], true);
      expect(topLevelItems[1].indeterminate).to.be.false;
    });

    it('Deselecting all children of a parent (through API) should mark the parent as deselected. All direct and non-direct parents should be affected correctly', async () => {
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      expect(topLevelItems[0].indeterminate).to.be.false; // all children and grand-children are selected

      const item1Children = topLevelItems[0].getChildren();
      const item11Children = item1Children[0].getChildren();

      // One deselected child makes the parent and its ancestors indeterminate.
      tree.deselect([item11Children[0]]);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item11Children[1], true);
      expect(item1Children[0].indeterminate).to.be.true;
      TreeTestFunctions.verifyItemSelection(item1Children[0], false);
      TreeTestFunctions.verifyItemSelection(item1Children[1], true);
      expect(topLevelItems[0].indeterminate).to.be.true;

      // The last child to be deselected makes the parent deselected, not indeterminate.
      item11Children[1].selected = false;
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item11Children[1], false);
      // All of item11's children are deselected
      expect(item1Children[0].indeterminate).to.be.false;
      TreeTestFunctions.verifyItemSelection(item1Children[0], false);
      TreeTestFunctions.verifyItemSelection(item1Children[1], true);
      expect(topLevelItems[0].indeterminate).to.be.true;

      item1Children[1].selected = false;
      await elementUpdated(tree);

      // all of item1's children are deselected
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], false);
      expect(topLevelItems[0].indeterminate).to.be.false;
    });

    it('Set nested child, that has its own children, as initially selected. Verify that direct and indirect parents have correct states', async () => {
      const item3Children = topLevelItems[2].getChildren();
      const item31Children = item3Children[0].getChildren();
      const item311Children = item31Children[0].getChildren();

      TreeTestFunctions.verifyItemSelection(item31Children[0], true);
      item311Children.forEach((child) => {
        TreeTestFunctions.verifyItemSelection(child, true);
      });

      // A partially selected parent is indeterminate.
      TreeTestFunctions.verifyItemSelection(item3Children[0], false);
      expect(item3Children[0].indeterminate).to.be.true;

      TreeTestFunctions.verifyItemSelection(topLevelItems[2], false);
      expect(topLevelItems[2].indeterminate).to.be.true;
    });

    it('Deleting a single selected child should mark the parent as deselected. All direct and non-direct parents should be affected correctly', async () => {
      const treeItemsLength = tree.items.length;
      const item4Children = topLevelItems[3].getChildren();
      const item41Children = item4Children[0].getChildren();
      const item411 = item41Children[0];

      TreeTestFunctions.verifyItemSelection(item411, true);
      TreeTestFunctions.verifyItemSelection(item4Children[0], false);
      TreeTestFunctions.verifyItemSelection(topLevelItems[3], false);
      expect(item4Children[0].indeterminate).to.be.true;
      expect(topLevelItems[3].indeterminate).to.be.true;

      item411.parentNode?.removeChild(item411);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(treeItemsLength - 1);

      TreeTestFunctions.verifyItemSelection(item4Children[0], false);
      TreeTestFunctions.verifyItemSelection(topLevelItems[3], false);
      expect(item4Children[0].indeterminate).to.be.false;
      expect(topLevelItems[3].indeterminate).to.be.true; // there is a selected child of item4
    });

    it('Deleting a single deselected child should mark the parent as selected. All direct and non-direct parents should be affected correctly', async () => {
      const treeItemsLength = tree.items.length;
      const item4Children = topLevelItems[3].getChildren();
      const item42Children = item4Children[1].getChildren();
      const item422 = item42Children[1];

      TreeTestFunctions.verifyItemSelection(item422, false);
      TreeTestFunctions.verifyItemSelection(item4Children[1], false);
      TreeTestFunctions.verifyItemSelection(topLevelItems[3], false);
      expect(item4Children[1].indeterminate).to.be.true;
      expect(topLevelItems[3].indeterminate).to.be.true;

      item422.parentNode?.removeChild(item422);
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(treeItemsLength - 1);

      TreeTestFunctions.verifyItemSelection(item4Children[1], true);
      expect(item4Children[1].indeterminate).to.be.false;
      expect(topLevelItems[3].indeterminate).to.be.true; // item41 is indeterminate, so parent also is
    });

    it('Deleting a child should from a selected/deselected parent should not affect its selection state', async () => {
      const treeItemsLength = tree.items.length;
      const item1Children = topLevelItems[0].getChildren();
      const item11 = item1Children[0];
      const item11Children = item11.getChildren();
      const item111 = item11Children[0];
      const item112 = item11Children[1];

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      TreeTestFunctions.verifyItemSelection(item11, true);
      TreeTestFunctions.verifyItemSelection(item111, true);

      item11.removeChild(item111); // delete item from selected parent
      await elementUpdated(tree);
      expect(tree.items.length).to.equal(treeItemsLength - 1);

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      TreeTestFunctions.verifyItemSelection(item11, true);

      item112.selected = true;
      await elementUpdated(tree);

      // Deleting the only child keeps the state of a selected parent.
      item11.removeChild(item112);
      TreeTestFunctions.verifyItemSelection(item11, true);
      expect(tree.items.length).to.equal(treeItemsLength - 2);

      const item2Children = topLevelItems[1].getChildren();
      const item21 = item2Children[0];
      const item21Children = item21.getChildren();
      const item211 = item21Children[0];
      const item212 = item21Children[1];

      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);
      TreeTestFunctions.verifyItemSelection(item21, false);
      TreeTestFunctions.verifyItemSelection(item211, false);

      item21.removeChild(item211); // delete item from deselected parent
      await elementUpdated(tree);

      expect(tree.items.length).to.equal(treeItemsLength - 3);
      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);
      TreeTestFunctions.verifyItemSelection(item21, false);

      // Deleting the only child keeps the state of a deselected parent.
      item21.removeChild(item212);
      TreeTestFunctions.verifyItemSelection(item21, false);
    });

    it('Adding a selected child to deselected parent should mark it as indeterminate. All direct and non-direct parents should be affected correctly', async () => {
      const item2Children = topLevelItems[1].getChildren();
      const item21 = item2Children[0];
      const item21ChildrenLength = item21.getChildren().length;

      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);
      TreeTestFunctions.verifyItemSelection(item21, false);
      expect(topLevelItems[1].indeterminate).to.be.false;
      expect(item21.indeterminate).to.be.false;

      const deselectedChild = tree.ownerDocument.createElement('igc-tree-item');
      deselectedChild.label = 'Tree Item 2.1.3';
      deselectedChild.selected = false;

      item21.appendChild(deselectedChild);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[1], false);
      TreeTestFunctions.verifyItemSelection(item21, false);
      expect(topLevelItems[1].indeterminate).to.be.false;
      expect(item21.indeterminate).to.be.false;

      const selectedChild = tree.ownerDocument.createElement('igc-tree-item');
      selectedChild.label = 'Tree Item 2.1.4';
      selectedChild.selected = true;

      item21.appendChild(selectedChild);
      await elementUpdated(tree);

      expect(item21.getChildren().length).to.equal(item21ChildrenLength + 2);
      expect(topLevelItems[1].indeterminate).to.be.true;
      expect(item21.indeterminate).to.be.true;
    });

    it('Adding a deselected child to selected parent should mark it as indeterminate. All direct and non-direct parents should be affected correctly', async () => {
      const item1Children = topLevelItems[0].getChildren();
      const item11 = item1Children[0];
      const item11ChildrenLength = item11.getChildren().length;

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      TreeTestFunctions.verifyItemSelection(item11, true);
      expect(topLevelItems[1].indeterminate).to.be.false;
      expect(item11.indeterminate).to.be.false;

      // A selected child keeps a selected parent selected.
      const selectedChild = tree.ownerDocument.createElement('igc-tree-item');
      selectedChild.label = 'Tree Item 1.1.3';
      selectedChild.selected = true;

      item11.appendChild(selectedChild);
      await elementUpdated(tree);

      expect(item11.getChildren().length).to.equal(item11ChildrenLength + 1);
      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);
      TreeTestFunctions.verifyItemSelection(item11, true);
      expect(topLevelItems[1].indeterminate).to.be.false;
      expect(topLevelItems[0].indeterminate).to.be.false;
      expect(item11.indeterminate).to.be.false;

      const deselectedChild = tree.ownerDocument.createElement('igc-tree-item');
      deselectedChild.label = 'Tree Item 1.1.4';
      deselectedChild.selected = false;

      item11.appendChild(deselectedChild);
      await elementUpdated(tree);

      expect(item11.getChildren().length).to.equal(item11ChildrenLength + 2);
      expect(topLevelItems[0].indeterminate).to.be.true;
      expect(item11.indeterminate).to.be.true;
    });

    it('Should be able to prevent the igcSelection event', async () => {
      const eventSpy = spy(tree, 'emitEvent');

      const item2Children = topLevelItems[1].getChildren();
      const item211 = item2Children[0].getChildren()[0];

      tree.addEventListener('igcSelection', (ev) => {
        ev.preventDefault();
      });

      const selectionPart = item211.shadowRoot!.querySelector(PARTS.select);
      const cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(item211, false);
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.false;

      const args: TreeSelectionEventInit = {
        detail: {
          newSelection: [...initialSelection, item211],
        },
        cancelable: true,
      };

      expect(eventSpy).calledOnceWith('igcSelection', args);

      tree.items.forEach((item) => {
        if (initialSelection.indexOf(item) === -1) {
          TreeTestFunctions.verifyItemSelection(item, false);
        } else {
          TreeTestFunctions.verifyItemSelection(item, true);
        }
      });
    });

    it('When selecting a range of records using Shift + click key selection of parents should select all their children even if they are not in the selected range', async () => {
      tree.deselect();
      await elementUpdated(tree);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      const item2Children = topLevelItems[1].getChildren();
      const item211 = item2Children[0].getChildren()[0];

      // Select items from "Tree Item 1" to "Tree Item 2.2"
      const expectedSelection = [
        topLevelItems[0],
        ...topLevelItems[0].getChildren({ flatten: true }),
        topLevelItems[1],
        item2Children[0],
        item211,
      ];

      let selectionPart = topLevelItems[0].shadowRoot!.querySelector(
        PARTS.select
      );
      let cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click'));
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(topLevelItems[0], true);

      const endOfSelectionRage = item211;

      selectionPart = endOfSelectionRage.shadowRoot!.querySelector(
        PARTS.select
      );
      cb = selectionPart?.children[0] as IgcCheckboxComponent;
      cb?.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
      await elementUpdated(tree);

      expectedSelection.forEach((item) => {
        TreeTestFunctions.verifyItemSelection(item, true);
      });

      // "Tree Item 2.1.2", "Tree Item 2.2" and "Tree Item 2.3" should also be selected
      const item212 = item2Children[0].getChildren()[1];
      TreeTestFunctions.verifyItemSelection(item212, true);
      TreeTestFunctions.verifyItemSelection(item2Children[1], true);
      TreeTestFunctions.verifyItemSelection(item2Children[2], true);
    });
  });

  describe('Removal', () => {
    beforeEach(async () => {
      tree = await TreeTestFunctions.createTreeElement(cascadeSelectionTree);
      treeSelectionService = tree.selectionService;
    });

    it('Should reconcile a removed subtree in a single pass', async () => {
      tree.select();
      await elementUpdated(tree);

      const target = tree.items.find(
        (item) => item.label === 'Tree Item 3.1.1'
      )!;
      const removed = [target, ...target.getChildren({ flatten: true })];
      expect(removed.length).to.be.greaterThan(1);

      const deselectSpy = spy(treeSelectionService, 'deselectItemsWithNoEvent');
      target.remove();
      await elementUpdated(tree);

      // The topmost removed item covers its whole subtree; each descendant
      // repeating the reconciliation would be redundant work.
      expect(deselectSpy.callCount).to.equal(1);
      expect(deselectSpy.firstCall.args[0]).to.have.members(removed);
    });

    it('Should update the ancestors of a removed subtree', async () => {
      const parent = tree.items.find((item) => item.label === 'Tree Item 3.1')!;
      const target = parent
        .getChildren()
        .find((item) => item.label === 'Tree Item 3.1.1')!;

      tree.select([target]);
      await elementUpdated(tree);

      expect(treeSelectionService.isItemIndeterminate(parent)).to.be.true;

      target.remove();
      await elementUpdated(tree);

      // With the only selected child gone, the parent is no longer partially
      // selected.
      expect(treeSelectionService.isItemIndeterminate(parent)).to.be.false;
      expect(treeSelectionService.isItemSelected(parent)).to.be.false;
    });

    it('Should keep the selection state of a moved subtree', async () => {
      const target = tree.items.find(
        (item) => item.label === 'Tree Item 3.1.1'
      )!;
      tree.select([target]);
      await elementUpdated(tree);

      const newParent = tree.items.find(
        (item) => item.label === 'Tree Item 2.2'
      )!;
      newParent.append(target);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(target, true);
      expect(treeSelectionService.isItemIndeterminate(newParent)).to.be.false;
      expect(treeSelectionService.isItemSelected(newParent)).to.be.true;
    });
  });

  describe('Cascade - items added after the first render', () => {
    const byLabel = (label: string) =>
      tree.items.find((item) => item.label === label)!;

    function createItem(label: string, selected = false): IgcTreeItemComponent {
      const item = tree.ownerDocument.createElement(
        IgcTreeItemComponent.tagName
      );
      item.label = label;
      item.selected = selected;
      return item;
    }

    beforeEach(async () => {
      tree = await TreeTestFunctions.createTreeElement(cascadeSelectionTree);
      treeSelectionService = tree.selectionService;
    });

    it('selects the unselected children of a selected subtree added at once', async () => {
      const parent = createItem('Added', true);
      const child = createItem('Added child');
      parent.append(child);

      byLabel('Tree Item 2.2').append(parent);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(parent, true);
      TreeTestFunctions.verifyItemSelection(child, true);
      expect(byLabel('Tree Item 2.2').indeterminate).to.be.false;
      TreeTestFunctions.verifyItemSelection(byLabel('Tree Item 2.2'), true);
      expect(byLabel('Tree Item 2').indeterminate).to.be.true;
    });

    it('reconciles the ancestors once for many children added at once', async () => {
      const parent = byLabel('Tree Item 1.2');
      const children = Array.from({ length: 50 }, (_, i) =>
        createItem(`Added ${i}`)
      );

      parent.append(...children);

      // A read resolves the pending ancestors first.
      expect(treeSelectionService.isItemSelected(parent)).to.be.false;
      expect(treeSelectionService.isItemIndeterminate(parent)).to.be.false;
      expect(treeSelectionService.isItemIndeterminate(byLabel('Tree Item 1')))
        .to.be.true;

      await elementUpdated(tree);

      expect(parent.selected).to.be.false;
      expect(byLabel('Tree Item 1').indeterminate).to.be.true;
      expect(children.every((child) => !child.selected)).to.be.true;
    });

    it('keeps a selection made right after items were added', async () => {
      const parent = byLabel('Tree Item 2.3');
      const added = createItem('Added');

      parent.append(added);
      tree.select([added]);
      await elementUpdated(tree);

      TreeTestFunctions.verifyItemSelection(added, true);
      TreeTestFunctions.verifyItemSelection(parent, true);
      expect(byLabel('Tree Item 2').indeterminate).to.be.true;
    });
  });
});
