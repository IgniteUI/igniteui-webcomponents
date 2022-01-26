import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { defineComponents, IgcCheckboxComponent } from '../..';
import IgcTreeComponent from './tree';
import IgcTreeItemComponent from './tree-item';

const DIFF_OPTIONS = {
  ignoreAttributes: ['id', 'part', 'tabindex', 'role', 'size'],
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
      tree = await createTreeElement(simpleTreeTemplate);

      expect(tree.children.length).to.equal(3);
      expect(tree).to.contain('igc-tree-item');
    });

    it('Should support multiple levels of nesting', async () => {
      tree = await createTreeElement(simpleHierarchyTreeTemplate);

      expect(tree.children.length).to.equals(2);
      expect(tree).dom.to.have.descendant('igc-tree-item');

      const treeItem0 = tree.children[0];
      expect(treeItem0.children.length).to.equal(2);
      expect(treeItem0).dom.to.have.descendants('igc-tree-item');

      const treeItem1 = tree.children[1];
      expect(treeItem1.children.length).to.equal(1);
      expect(treeItem1).dom.to.have.descendants('igc-tree-item');

      const treeItem10 = treeItem1.children[0];
      expect(treeItem10.children.length).to.equal(1);
      expect(treeItem10).dom.to.have.descendant('igc-tree-item');
    });

    it("Should calculate items' path and level correctly, depending on data hierarchy", async () => {
      tree = await createTreeElement(simpleHierarchyTreeTemplate);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(topLevelItems.length).to.equal(2);
      expect(topLevelItems[0].path)
        .to.have.lengthOf(1)
        .and.to.contain(topLevelItems[0]);
      expect(topLevelItems[0].path)
        .to.lengthOf(1)
        .and.to.contain(topLevelItems[0]);

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

      const item2Children = topLevelItems[1].getChildren();
      expect(item2Children.length).to.equal(1);
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
      expect(item2GrandChildren.length).to.equal(1);
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
    });

    it("Should not render collapsed item's children", async () => {
      tree = await createTreeElement(expandCollapseTreeTemplate);

      const topLevelItems = tree.items.filter((i) => i.level === 0);
      expect(topLevelItems[0].expanded).to.be.false; // collapsed by default
      expect(topLevelItems[1].expanded).to.be.true;

      const slots1 = topLevelItems[0].shadowRoot!.querySelectorAll('slot');
      const childrenSlot1 = Array.from(slots1).filter((s) => s.name === ''); // the last slot is unnamed and is where child tree items are rendered
      expect((childrenSlot1[0] as HTMLSlotElement).hidden).to.be.true;

      const slots2 = topLevelItems[1].shadowRoot!.querySelectorAll('slot');
      const childrenSlot2 = Array.from(slots2).filter((s) => s.name === '');
      expect((childrenSlot2[0] as HTMLSlotElement).hidden).to.be.false;
    });

    it('Should not render expand indicator if an item has no children', async () => {
      tree = await createTreeElement(simpleHierarchyTreeTemplate);

      const item0IndSlot = tree.items[0].shadowRoot!.querySelector(
        'slot[name="indicator"]'
      );
      expect(item0IndSlot).to.exist;
      expect(item0IndSlot).shadowDom.to.have.descendant('igc-icon');

      const item01 = tree.items[0].getChildren()[0];
      expect(item01.getChildren()).to.have.lengthOf(0);

      const item01IndSlot = item01.shadowRoot!.querySelector(
        'slot[name="indicator"]'
      );
      expect(item01IndSlot).to.exist;
      expect(item01IndSlot).shadowDom.not.to.have.descendants;
    });

    it("Should not render default select indicator if selection mode is 'None'", async () => {
      tree = await createTreeElement(simpleTreeTemplate);
      expect(tree.selection).to.equal('none'); // by default

      tree.items.forEach((item) => {
        const selectionSection = item.shadowRoot!.querySelector(
          'section[part="selectIndicator"]'
        );
        expect(selectionSection).to.be.null;
      });

      tree.selection = 'multiple';
      await elementUpdated(tree);

      tree.items.forEach((item) => {
        const selectionSection = item.shadowRoot!.querySelector(
          'section[part="selectIndicator"]'
        );
        expect(selectionSection).dom.to.equal(
          `<section part="selectIndicator" class="tree-node__select">
                        <igc-checkbox></igc-checkbox>
                    </section>`,
          DIFF_OPTIONS
        );
      });
    });

    it('Should render default indicator for expansion properly depending on item state', async () => {
      tree = await createTreeElement(expandCollapseTreeTemplate);
      const topLevelItems = tree.items.filter((i) => i.level === 0);

      const item0IndSlot = topLevelItems[0].shadowRoot!.querySelector(
        'slot[name="indicator"]'
      );
      expect(item0IndSlot).to.exist;
      expect(topLevelItems[0].expanded).to.be.false;
      expect(item0IndSlot).lightDom.to.equal(
        `<igc-icon name='keyboard_arrow_right' collection="internal">
                </igc-icon>`,
        DIFF_OPTIONS
      );

      const item1IndSlot = topLevelItems[1].shadowRoot!.querySelector(
        'slot[name="indicator"]'
      );
      expect(item1IndSlot).to.exist;
      expect(topLevelItems[1].expanded).to.be.true;
      expect(item1IndSlot).lightDom.to.equal(
        `<igc-icon name='keyboard_arrow_down' collection="internal">
                </igc-icon>`,
        DIFF_OPTIONS
      );
    });

    it('Should render default select marker properly depending on item state', async () => {
      tree = await createTreeElement(expandCollapseTreeTemplate);

      tree.selection = 'multiple';
      await elementUpdated(tree);

      expect(tree.items[0].selected).to.be.false;
      let selectionSection = tree.items[0].shadowRoot!.querySelector(
        'section[part="selectIndicator"]'
      );
      expect(selectionSection).dom.to.equal(
        `<section part="selectIndicator" class="tree-node__select">
                    <igc-checkbox></igc-checkbox>
                </section>`,
        DIFF_OPTIONS
      );

      let cb = selectionSection?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.false;

      tree.items[0].selected = true;
      await elementUpdated(tree);

      selectionSection = tree.items[0].shadowRoot!.querySelector(
        'section[part="selectIndicator"]'
      );
      cb = selectionSection?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.true;
      expect(cb.indeterminate).to.be.false;

      tree.selection = 'cascade';
      tree.items[0].selected = false;
      tree.items[0].getChildren()[0].selected = true;
      await elementUpdated(tree);

      expect(tree.items[0].getChildren()[0].selected).to.be.true;
      expect(tree.items[0].getChildren()[1].selected).to.be.false;

      cb = selectionSection?.children[0] as IgcCheckboxComponent;
      expect(cb.checked).to.be.false;
      expect(cb.indeterminate).to.be.true;
    });
  });
});

const createTreeElement = (template = '<igc-tree></igc-tree>') => {
  return fixture<IgcTreeComponent>(html`${unsafeStatic(template)}`);
};

const simpleTreeTemplate = `<igc-tree>
                                <igc-tree-item></igc-tree-item>
                                <igc-tree-item></igc-tree-item>
                                <igc-tree-item></igc-tree-item>
                            </igc-tree>`;

const simpleHierarchyTreeTemplate = `<igc-tree>
                                        <igc-tree-item expanded>
                                            <igc-tree-item></igc-tree-item>
                                            <igc-tree-item></igc-tree-item>
                                        </igc-tree-item>
                                        <igc-tree-item expanded>
                                            <igc-tree-item>
                                                <igc-tree-item></igc-tree-item>
                                            </igc-tree-item>
                                        </igc-tree-item>
                                    </igc-tree>`;

const expandCollapseTreeTemplate = `<igc-tree>
                                        <igc-tree-item>
                                            <igc-tree-item></igc-tree-item>
                                            <igc-tree-item></igc-tree-item>
                                        </igc-tree-item>
                                        <igc-tree-item expanded>
                                            <igc-tree-item>
                                                <igc-tree-item></igc-tree-item>
                                            </igc-tree-item>
                                        </igc-tree-item>
                                    </igc-tree>`;
