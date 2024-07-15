import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';

import type IgcTreeItemComponent from './tree-item.js';
import type IgcTreeComponent from './tree.js';

export const DIFF_OPTIONS = {
  ignoreAttributes: ['id', 'part', 'tabindex', 'role', 'size', 'style'],
};

export const SLOTS = {
  indentation: 'slot[name="indentation"]',
  indicator: 'slot[name="indicator"]',
  label: 'slot[name="label"]',
  loading: 'slot[name="loading"]',
};

export const PARTS = {
  indentation: 'div[part="indentation"]',
  indicator: 'div[part="indicator"]',
  select: 'div[part="select"]',
  label: 'div[part="label"]',
};

export class TreeTestFunctions {
  public static createTreeElement = (template = '<igc-tree></igc-tree>') => {
    return fixture<IgcTreeComponent>(html`${unsafeStatic(template)}`);
  };

  public static verifyIndicatorIcon = (
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

  public static getSlot = (
    item: IgcTreeItemComponent,
    selector: string
  ): HTMLSlotElement => {
    return item.shadowRoot!.querySelector(selector) as HTMLSlotElement;
  };

  public static verifyExpansionState = (
    item: IgcTreeItemComponent,
    expectedState: boolean
  ): void => {
    const indSlot = this.getSlot(item, SLOTS.indicator);
    expect(item.expanded).to.equal(expectedState);
    this.verifyIndicatorIcon(indSlot, expectedState);
  };

  public static verifyItemSelection = (
    item: IgcTreeItemComponent,
    selectedState: boolean
  ): void => {
    expect(item.selected).to.equal(selectedState);
    expect(item.tree?.selectionService.isItemSelected(item)).to.equal(
      selectedState
    );
  };

  public static setFocusAndTriggerKeydown = (
    item: IgcTreeItemComponent,
    tree: IgcTreeComponent,
    eventKey: string,
    ctrlKeyFlag = false,
    shiftKeyFlag = false
  ): void => {
    item.dispatchEvent(new Event('focus'));
    expect(tree.navService.focusedItem).to.equal(item);
    item.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: eventKey,
        bubbles: true,
        ctrlKey: ctrlKeyFlag,
        shiftKey: shiftKeyFlag,
        cancelable: true,
      })
    );
  };

  public static checkKeydownDefaultPrevented = (
    tree: IgcTreeComponent
  ): void => {
    tree.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key.toLowerCase() === 'enter') {
        expect(ev.defaultPrevented).to.be.false;
      } else {
        expect(ev.defaultPrevented).to.be.true;
      }
    });
  };
}

// Templates

export const simpleTree = `<igc-tree>
                                        <igc-tree-item label="Tree Item 1" value="val1"></igc-tree-item>
                                        <igc-tree-item label="Tree Item 2"></igc-tree-item>
                                        <igc-tree-item label="Tree Item 3"></igc-tree-item>
                                      </igc-tree>`;

export const simpleHierarchyTree = `<igc-tree>
                                         <igc-tree-item label="Tree Item 1">
                                           <igc-tree-item label="Tree Item 1.1">
                                             <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2">
                                             <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 2">
                                           <igc-tree-item label="Tree Item 2.1">
                                             <igc-tree-item label="Tree Item 2.1.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2">
                                             <igc-tree-item label="Tree Item 2.2.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                       </igc-tree>`;

export const expandCollapseTree = `<igc-tree>
                                        <igc-tree-item label="Tree Item 1">
                                          <span slot="indicator">ind</span>
                                          <igc-tree-item label="Tree Item 1.1" disabled>
                                            <span slot="indentation">-</span>
                                            <span slot="label">Label via slot</span>
                                            <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
                                          </igc-tree-item>
                                          <igc-tree-item label="Tree Item 1.2"></igc-tree-item>
                                        </igc-tree-item>
                                        <igc-tree-item expanded label="Tree Item 2">
                                          <igc-tree-item label="Tree Item 2.1" expanded disabled>
                                            <span slot="loading">*</span>
                                            <igc-tree-item label="Tree Item 2.1.1">
                                              <p slot="label">
                                                <a href="http://infragistics.com">Infragistics</a>
                                              </p>
                                            </igc-tree-item>
                                          </igc-tree-item>
                                        </igc-tree-item>
                                      </igc-tree>`;

export const activeItemsTree = `<igc-tree>
                                         <igc-tree-item expanded label="Tree Item 1" active>
                                           <igc-tree-item label="Tree Item 1.1" expanded active></igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2" expanded active></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 2">
                                           <igc-tree-item label="Tree Item 2.1" expanded active></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
                                         </igc-tree-item>
                                      </igc-tree>`;

export const selectedItemsTree = `<igc-tree selection='multiple' style="height: 400px; --ig-size: 3;">
                                         <igc-tree-item expanded label="Tree Item 1" selected>
                                           <igc-tree-item label="Tree Item 1.1" expanded selected>
                                            <igc-tree-item label="Tree Item 1.1.1" expanded></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2" expanded></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 2" selected>
                                           <igc-tree-item label="Tree Item 2.1" expanded></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.3"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 3">
                                           <igc-tree-item label="Tree Item 3.1" expanded></igc-tree-item>
                                           <igc-tree-item label="Tree Item 3.2"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 4">
                                           <igc-tree-item label="Tree Item 4.1" expanded></igc-tree-item>
                                           <igc-tree-item label="Tree Item 4.2" active></igc-tree-item>
                                         </igc-tree-item>
                                      </igc-tree>`;

export const cascadeSelectionTree = `<igc-tree selection='cascade'>
                                         <igc-tree-item expanded label="Tree Item 1" selected>
                                           <igc-tree-item label="Tree Item 1.1" expanded>
                                            <igc-tree-item label="Tree Item 1.1.1" expanded></igc-tree-item>
                                            <igc-tree-item label="Tree Item 1.1.2" expanded></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2" expanded></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 2">
                                           <igc-tree-item label="Tree Item 2.1" expanded>
                                            <igc-tree-item label="Tree Item 2.1.1" expanded></igc-tree-item>
                                            <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.3"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 3">
                                           <igc-tree-item label="Tree Item 3.1" expanded>
                                            <igc-tree-item label="Tree Item 3.1.1" expanded selected>
                                              <igc-tree-item label="Tree Item 3.1.1.1" expanded></igc-tree-item>
                                              <igc-tree-item label="Tree Item 3.1.1.2" expanded></igc-tree-item>
                                            </igc-tree-item>
                                            <igc-tree-item label="Tree Item 3.1.2" expanded>
                                              <igc-tree-item label="Tree Item 3.1.2.1" expanded>
                                            </igc-tree-item></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 3.2"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item expanded label="Tree Item 4">
                                           <igc-tree-item label="Tree Item 4.1" expanded>
                                            <igc-tree-item label="Tree Item 4.1.1" selected expanded></igc-tree-item>
                                            <igc-tree-item label="Tree Item 4.1.2" expanded></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 4.2">
                                            <igc-tree-item label="Tree Item 4.2.1" selected expanded></igc-tree-item>
                                            <igc-tree-item label="Tree Item 4.2.2" expanded></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                      </igc-tree>`;

export const disabledItemsTree = `<igc-tree selection='multiple'>
                                         <igc-tree-item label="Tree Item 1" disabled expanded>
                                           <igc-tree-item label="Tree Item 1.1" disabled expanded>
                                             <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2" disabled>
                                             <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 2" expanded>
                                           <igc-tree-item label="Tree Item 2.1" active expanded>
                                             <igc-tree-item label="Tree Item 2.1.1" expanded disabled></igc-tree-item>
                                             <igc-tree-item label="Tree Item 2.1.2" expanded disabled></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2" expanded>
                                             <igc-tree-item label="Tree Item 2.2.1" disabled></igc-tree-item>
                                             <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 3">
                                           <igc-tree-item label="Tree Item 3.1">
                                             <igc-tree-item label="Tree Item 3.1.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 3.1.2"></igc-tree-item>
                                           </igc-tree-item>
                                           <igc-tree-item label="Tree Item 3.2">
                                             <igc-tree-item label="Tree Item 3.2.1"></igc-tree-item>
                                             <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
                                           </igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 4"></igc-tree-item>
                                       </igc-tree>`;

export const navigationTree = `<igc-tree selection='none' style="height: 400px; --ig-size: 3;">
                                       <igc-tree-item label="Tree Item 1">
                                         <igc-tree-item label="Tree Item 1.1" expanded>
                                           <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 1.2">
                                           <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
                                         </igc-tree-item>
                                       </igc-tree-item>
                                       <igc-tree-item label="Tree Item 2" expanded>
                                         <igc-tree-item label="Tree Item 2.1" expanded>
                                           <p slot="label">
                                            <input />
                                            <input />
                                           </p>
                                           <igc-tree-item label="Tree Item 2.1.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 2.2" expanded>
                                              <button slot="label">asd</button>
                                           <igc-tree-item label="Tree Item 2.2.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
                                         </igc-tree-item>
                                       </igc-tree-item>
                                       <igc-tree-item label="Tree Item 3">
                                         <igc-tree-item label="Tree Item 3.1">
                                           <igc-tree-item label="Tree Item 3.1.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 3.1.2"></igc-tree-item>
                                         </igc-tree-item>
                                         <igc-tree-item label="Tree Item 3.2">
                                           <igc-tree-item label="Tree Item 3.2.1"></igc-tree-item>
                                           <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
                                         </igc-tree-item>
                                       </igc-tree-item>
                                       <igc-tree-item label="Tree Item 4"></igc-tree-item>
                                     </igc-tree>`;

export const wrappedItemsTree = `<igc-tree selection='none' style="height: 400px;">
                                    <igc-tree-item label="Tree Item 1" expanded>
                                      <div>
                                        <igc-tree-item label="Tree Item 1.1" expanded>
                                          <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
                                        </igc-tree-item>
                                      </div>
                                    <igc-tree-item label="Tree Item 2"></igc-tree-item>
                                  </igc-tree>`;
