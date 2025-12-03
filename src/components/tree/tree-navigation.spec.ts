import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, waitUntil } from '../common/helpers.spec.js';
import { eventMatch } from '../common/utils.spec.js';
import type { TreeSelectionEventInit } from './tree.common.js';
import IgcTreeComponent from './tree.js';
import type { IgcTreeNavigationService } from './tree.navigation.js';
import IgcTreeItemComponent from './tree-item.js';
import { navigationTree, SLOTS, TreeTestFunctions } from './tree-utils.spec.js';

describe('Tree Navigation', () => {
  beforeAll(() => {
    defineComponents(IgcTreeItemComponent, IgcTreeComponent);
  });

  let tree: IgcTreeComponent;
  let treeNavService: IgcTreeNavigationService;
  let topLevelItems: IgcTreeItemComponent[];
  let spy: MockInstance;

  beforeEach(async () => {
    tree = await TreeTestFunctions.createTreeElement(navigationTree);
    treeNavService = tree.navService;
    topLevelItems = tree.items.filter((i) => i.level === 0);
    spy = vi.spyOn(tree, 'emitEvent');
  });

  it('Should focus and activate the first tree item on Home key press and the last tree item on End key press', async () => {
    expect(treeNavService.activeItem).to.be.null;

    topLevelItems[2].active = true;
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(topLevelItems[2], tree, 'Home');
    await elementUpdated(tree);

    expect(tree.items[0].active).to.be.true;
    expect(treeNavService.activeItem).to.equal(tree.items[0]);
    expect(treeNavService.focusedItem).to.equal(tree.items[0]);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: tree.items[0],
    });
    spy.mockClear();

    treeNavService.focusedItem?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    const itemsLength = tree.items.length;
    const lastItem = tree.items[itemsLength - 1];
    expect(lastItem.disabled).to.be.false;
    expect(lastItem.active).to.be.true;
    expect(treeNavService.activeItem).to.equal(lastItem);
    expect(treeNavService.focusedItem).to.equal(lastItem);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: lastItem,
    });
    spy.mockClear();
  });

  it('Should not navigate when a tree item has no parent and item is collapsed on Arrow Left key press', async () => {
    topLevelItems[0].active = true;
    await elementUpdated(tree);

    expect(topLevelItems[0].parent).to.be.null;
    expect(topLevelItems[0].expanded).to.be.false;
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]); // first non-disabled item is focused by default

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(topLevelItems[0].active).to.be.true;
    expect(topLevelItems[0].expanded).to.be.false;
    expect(treeNavService.activeItem).to.equal(topLevelItems[0]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('Should navigate to the parent item of a tree item w/ expanded === true on Arrow Left key press, moving focus and active', async () => {
    const item2 = topLevelItems[1];
    const item21 = item2.getChildren()[0];

    item21.active = true;
    item21.collapse();
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(item21, tree, 'ArrowLeft');
    await elementUpdated(tree);

    expect(item2.active).to.be.true;
    expect(item21.active).to.be.false;
    expect(item2.expanded).to.be.true;
    expect(treeNavService.activeItem).to.equal(item2);
    expect(treeNavService.focusedItem).to.equal(item2);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: item2,
    });
    spy.mockClear();

    // Should collapse expanded tree items on Arrow Left key press
    item2.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      })
    );
    await waitUntil(() => eventMatch(spy, 'igcItemCollapsed'));

    expect(item2.active).to.be.true;
    expect(item2.expanded).to.be.false;

    const collapsingArgs = {
      detail: item2,
      cancelable: true,
    };
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcItemCollapsing', collapsingArgs);
    expect(spy).toHaveBeenNthCalledWith(2, 'igcItemCollapsed', {
      detail: item2,
    });

    spy.mockClear();
  });

  it('Should not navigate when a tree item has no children on Arrow Right key press', async () => {
    const item4 = topLevelItems[3];
    expect(item4.getChildren().length).to.equal(0);

    item4.active = true;
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(item4, tree, 'ArrowRight');
    await elementUpdated(tree);

    expect(item4.active).to.be.true;
    expect(treeNavService.activeItem).to.equal(item4);
    expect(treeNavService.focusedItem).to.equal(item4);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('Should navigate to the first child of an expanded on Arrow Right key press, moving focus and active', async () => {
    const item2 = topLevelItems[1];
    const item2Children = item2.getChildren();

    item2.active = true;
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(item2, tree, 'ArrowRight');
    await elementUpdated(tree);

    expect(item2Children[0].active).to.be.true;
    expect(treeNavService.activeItem).to.equal(item2Children[0]);
    expect(treeNavService.focusedItem).to.equal(item2Children[0]);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: item2Children[0],
    });
    spy.mockClear();

    const item21Children = item2Children[0].getChildren();

    item2Children[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(item21Children[0].active).to.be.true;
    expect(treeNavService.activeItem).to.equal(item21Children[0]);
    expect(treeNavService.focusedItem).to.equal(item21Children[0]);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: item21Children[0],
    });
  });

  it('Should expand collapsed tree item w/ children on Arrow Right key press', async () => {
    const item1 = topLevelItems[0];

    expect(item1.expanded).to.be.false;
    expect(item1.getChildren().length).to.be.greaterThan(0);

    item1.active = true;
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(item1, tree, 'ArrowRight');
    await waitUntil(() => eventMatch(spy, 'igcItemExpanded'));

    expect(item1.expanded).to.be.true;

    const expandingArgs = {
      detail: item1,
      cancelable: true,
    };
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcItemExpanding', expandingArgs);
    expect(spy).toHaveBeenNthCalledWith(2, 'igcItemExpanded', {
      detail: item1,
    });
  });

  it('Should focus and activate the next visible tree item on Arrow Down key press', async () => {
    const item3 = topLevelItems[2];
    const item3Hierarchy = [item3, ...item3.getChildren({ flatten: true })];

    tree.expand(item3Hierarchy);
    await elementUpdated(tree);

    for (let i = 0; i < item3Hierarchy.length - 1; i++) {
      const item = item3Hierarchy[i];

      item.active = true;
      await elementUpdated(tree);
      TreeTestFunctions.setFocusAndTriggerKeydown(item, tree, 'ArrowDown');
      await elementUpdated(tree);

      expect(item3Hierarchy[i + 1].active).to.be.true;
      expect(treeNavService.activeItem).to.equal(item3Hierarchy[i + 1]);
      expect(treeNavService.focusedItem).to.equal(item3Hierarchy[i + 1]);

      expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
        detail: item3Hierarchy[i + 1],
      });
      spy.mockClear();
    }

    // Arrow Down on last tree item
    const item4 = topLevelItems[3];
    item4.active = true;
    await elementUpdated(tree);
    TreeTestFunctions.setFocusAndTriggerKeydown(item4, tree, 'ArrowDown');
    await elementUpdated(tree);

    expect(treeNavService.activeItem).to.equal(item4);
    expect(treeNavService.focusedItem).to.equal(item4);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('Should only focus the next visible tree item on Arrow Down + Ctrl key press', async () => {
    const item3 = topLevelItems[2];
    const item3Hierarchy = [item3, ...item3.getChildren({ flatten: true })];
    item3.active = true;
    await elementUpdated(tree);
    tree.expand(item3Hierarchy);
    await elementUpdated(tree);

    for (let i = 0; i < item3Hierarchy.length - 1; i++) {
      const item = item3Hierarchy[i];

      TreeTestFunctions.setFocusAndTriggerKeydown(
        item,
        tree,
        'ArrowDown',
        true
      );
      await elementUpdated(tree);

      expect(item3Hierarchy[i + 1].active).to.be.false;
      expect(treeNavService.activeItem).to.equal(item3Hierarchy[0]);
      expect(treeNavService.focusedItem).to.equal(item3Hierarchy[i + 1]);
      expect(spy).toHaveBeenCalledTimes(0);
    }
  });

  it('Should focus and activate the previous visible tree item on Arrow Up key press', async () => {
    const item3 = topLevelItems[2];
    const item3Hierarchy = [item3, ...item3.getChildren({ flatten: true })];

    tree.expand(item3Hierarchy);
    await elementUpdated(tree);

    for (let i = item3Hierarchy.length - 1; i > 1; i--) {
      const item = item3Hierarchy[i];

      item.active = true;
      await elementUpdated(tree);
      TreeTestFunctions.setFocusAndTriggerKeydown(item, tree, 'ArrowUp');
      await elementUpdated(tree);

      expect(item3Hierarchy[i - 1].active).to.be.true;
      expect(treeNavService.activeItem).to.equal(item3Hierarchy[i - 1]);
      expect(treeNavService.focusedItem).to.equal(item3Hierarchy[i - 1]);
      expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
        detail: item3Hierarchy[i - 1],
      });
      spy.mockClear();
    }

    // Arrow Up on first tree item
    const item1 = topLevelItems[0];
    item1.active = true;
    await elementUpdated(tree);
    TreeTestFunctions.setFocusAndTriggerKeydown(item1, tree, 'ArrowUp');
    await elementUpdated(tree);

    expect(treeNavService.activeItem).to.equal(item1);
    expect(treeNavService.focusedItem).to.equal(item1);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('Should only focus the previous visible tree item on Arrow Up + Ctrl key press', async () => {
    const item3 = topLevelItems[2];
    const item3Hierarchy = [item3, ...item3.getChildren({ flatten: true })];

    item3Hierarchy[item3Hierarchy.length - 1].active = true;
    await elementUpdated(tree);
    tree.expand(item3Hierarchy);
    await elementUpdated(tree);

    TreeTestFunctions.checkKeydownDefaultPrevented(tree);

    for (let i = item3Hierarchy.length - 1; i > 1; i--) {
      const item = item3Hierarchy[i];

      TreeTestFunctions.setFocusAndTriggerKeydown(item, tree, 'ArrowUp', true);
      await elementUpdated(tree);

      expect(item3Hierarchy[i - 1].active).to.be.false;
      expect(treeNavService.activeItem).to.equal(
        item3Hierarchy[item3Hierarchy.length - 1]
      );
      expect(treeNavService.focusedItem).to.equal(item3Hierarchy[i - 1]);
      expect(spy).toHaveBeenCalledTimes(0);
    }
  });

  it('Should expand all sibling tree items of the focused item on asterisk (*) key press', async () => {
    const item3 = topLevelItems[2];

    TreeTestFunctions.checkKeydownDefaultPrevented(tree);

    //Level 1
    item3.active = true;
    await elementUpdated(tree);
    TreeTestFunctions.setFocusAndTriggerKeydown(item3, tree, '*');
    await waitUntil(() => eventMatch(spy, 'igcItemExpanded'));

    expect(topLevelItems[3].expanded).to.be.false; // Item4 does not have children => not expanded
    topLevelItems.pop();

    topLevelItems.forEach((item) => {
      expect(item.expanded).to.be.true;

      // the child items marked as expanded will be in a expanded state when expanding the parent
      const expandableChildren = item
        .getChildren()
        .filter((i) => i.getChildren().length && !i.disabled && i.expanded);
      expandableChildren.forEach((child) => {
        expect(child.expanded, child.label).to.be.true;
      });

      // the child items not marked as expanded will be in a collapsed state when expanding the parent
      const expandableCollapsedChildren = item
        .getChildren()
        .filter((i) => i.getChildren().length && !i.disabled && !i.expanded);
      expandableCollapsedChildren.forEach((child) => {
        expect(child.expanded, child.label).to.be.false;
      });
    });

    const expandingArgs1 = {
      detail: topLevelItems[0],
      cancelable: true,
    };

    const expandingArgs2 = {
      detail: item3,
      cancelable: true,
    };
    // Item2 is already expanded, and Item4 has no children => no expanding events emitted for them
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcItemExpanding', expandingArgs1);
    expect(spy).toHaveBeenNthCalledWith(2, 'igcItemExpanding', expandingArgs2);
    expect(spy).toHaveBeenNthCalledWith(3, 'igcItemExpanded', {
      detail: topLevelItems[0],
    });
    expect(spy).toHaveBeenNthCalledWith(4, 'igcItemExpanded', {
      detail: item3,
    });
  });

  it('Should activate the focused tree item on Enter key press', async () => {
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    // Should not prevent event's default behavior on Enter key press
    TreeTestFunctions.checkKeydownDefaultPrevented(tree);

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(topLevelItems[0].active).to.be.true;
    expect(treeNavService.activeItem).to.equal(topLevelItems[0]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: topLevelItems[0],
    });
  });

  it('Should toggle item selection on Space key press', async () => {
    tree.selection = 'multiple';
    await elementUpdated(tree);

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(topLevelItems[0].active).to.be.true;
    expect(topLevelItems[0].selected).to.be.true;

    let args: TreeSelectionEventInit = {
      detail: {
        newSelection: [topLevelItems[0]],
      },
      cancelable: true,
    };
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcActiveItem', {
      detail: topLevelItems[0],
    });
    expect(spy).toHaveBeenNthCalledWith(2, 'igcSelection', args);
    spy.mockClear();

    const expectedSelection: IgcTreeItemComponent[] = [];

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
    );

    expect(topLevelItems[0].active).to.be.true;
    expect(topLevelItems[0].selected).to.be.false;
    expect(treeNavService.activeItem).to.equal(topLevelItems[0]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    args = {
      detail: {
        newSelection: expectedSelection,
      },
      cancelable: true,
    };

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcSelection', args);
  });

  it("Should only activate the tree item when tree.selection === 'None' on Space key press and also select it when tree.selection !== 'None'", async () => {
    expect(tree.selection).to.equal('none');
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(topLevelItems[0].active).to.be.true;
    expect(topLevelItems[0].selected).to.be.false;
    expect(treeNavService.activeItem).to.equal(topLevelItems[0]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    expect(spy).toHaveBeenCalledExactlyOnceWith('igcActiveItem', {
      detail: topLevelItems[0],
    });

    spy.mockClear();

    tree.selection = 'multiple';
    await elementUpdated(tree);

    TreeTestFunctions.setFocusAndTriggerKeydown(topLevelItems[1], tree, ' ');

    expect(topLevelItems[1].active).to.be.true;
    expect(topLevelItems[1].selected).to.be.true;
    expect(treeNavService.activeItem).to.equal(topLevelItems[1]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[1]);

    const args: TreeSelectionEventInit = {
      detail: {
        newSelection: [topLevelItems[1]],
      },
      cancelable: true,
    };
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcActiveItem', {
      detail: topLevelItems[1],
    });
    expect(spy).toHaveBeenNthCalledWith(2, 'igcSelection', args);
  });

  it("Should select item range when tree.selection !== 'None' on Space + Shift keys press, moving active", async () => {
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    tree.selection = 'multiple';
    await elementUpdated(tree);

    topLevelItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
    );
    await elementUpdated(tree);

    expect(topLevelItems[0].active).to.be.true;
    expect(topLevelItems[0].selected).to.be.true;
    expect(treeNavService.activeItem).to.equal(topLevelItems[0]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);

    let args: TreeSelectionEventInit = {
      detail: {
        newSelection: [topLevelItems[0]],
      },
      cancelable: true,
    };
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcActiveItem', {
      detail: topLevelItems[0],
    });
    expect(spy).toHaveBeenNthCalledWith(2, 'igcSelection', args);
    spy.mockClear();

    const expectedSelection = [
      topLevelItems[0],
      ...topLevelItems[0].getChildren({ flatten: true }),
      topLevelItems[1],
    ];

    TreeTestFunctions.setFocusAndTriggerKeydown(
      topLevelItems[1],
      tree,
      ' ',
      false,
      true
    );

    expect(topLevelItems[1].active).to.be.true;
    expect(topLevelItems[1].selected).to.be.true;
    expect(treeNavService.activeItem).to.equal(topLevelItems[1]);
    expect(treeNavService.focusedItem).to.equal(topLevelItems[1]);

    args = {
      detail: {
        newSelection: expectedSelection,
      },
      cancelable: true,
    };

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 'igcActiveItem', {
      detail: topLevelItems[1],
    });
    expect(spy).toHaveBeenNthCalledWith(2, 'igcSelection', args);
  });

  it('Should assign proper tabIndex for tree item labels containing tabbable elements on focus', async () => {
    const item2 = topLevelItems[1];
    const item21 = item2.getChildren()[0];

    let item21LabelSlot = TreeTestFunctions.getSlot(item21, SLOTS.label);
    let assignedEls = item21LabelSlot.assignedElements();
    expect(assignedEls[0].tagName).to.equal('P');
    expect(assignedEls[0]).not.to.have.attribute('tabIndex');

    let inputs = assignedEls[0].children;

    expect(treeNavService.focusedItem).to.equal(topLevelItems[0]);
    expect(inputs[0]).to.have.attribute('tabIndex', '-1');
    expect(inputs[1]).to.have.attribute('tabIndex', '-1');

    item21.dispatchEvent(new Event('focus'));
    await elementUpdated(tree);

    expect(treeNavService.focusedItem).to.equal(item21);
    expect(inputs[0]).to.have.attribute('tabIndex', '0');
    expect(inputs[1]).to.have.attribute('tabIndex', '0');

    const item22 = item2.getChildren()[1];

    const item22LabelSlot = TreeTestFunctions.getSlot(item22, SLOTS.label);
    const assignedEl = item22LabelSlot.assignedElements()[0] as HTMLElement;
    assignedEl.focus();
    await elementUpdated(tree);

    item21LabelSlot = TreeTestFunctions.getSlot(item21, SLOTS.label);
    assignedEls = item21LabelSlot.assignedElements();
    inputs = assignedEls[0].children;

    expect(inputs[0]).to.have.attribute('tabIndex', '-1');
    expect(inputs[1]).to.have.attribute('tabIndex', '-1');
  });
});
