import { fixture, html, unsafeStatic } from '@open-wc/testing';
import IgcStepperComponent from './stepper.js';
import IgcStepComponent from './step.js';

export const DIFF_OPTIONS = {
  ignoreAttributes: ['id', 'part', 'tabindex', 'role', 'size', 'style'],
};

export const SLOTS = {
  indicator: 'slot[name="indicator"]',
  title: 'slot[name="title"]',
  subTitle: 'slot[name="sub-title"]',
};

export const PARTS = {
  header: 'div[part="header"]',
  headerContainer: 'div[part~="header-container"]',
  body: 'div[part~="body"]',
  indentation: 'div[part="indentation"]',
  indicator: 'div[part="indicator"]',
  title: 'div[part="title"]',
  subtitle: 'div[part="subtitle"]',
  select: 'div[part="select"]',
  label: 'div[part="label"]',
};

export class StepperTestFunctions {
  public static createStepperElement = (
    template = '<igc-stepper></igc-stepper>'
  ) => {
    return fixture<IgcStepperComponent>(html`${unsafeStatic(template)}`);
  };

  // public static verifyIndicatorIcon = (
  //   slot: HTMLSlotElement,
  //   state: string,
  //   index?: number,
  //   customTemplate?: string,
  // ): void => {
  //   // expect(slot).lightDom.to.equal(
  //   //   `<igc-icon name=${
  //   //     index ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
  //   //   } collection="internal"></igc-icon>`,
  //   //   DIFF_OPTIONS
  //   // );
  // };

  public static getSlot = (
    step: IgcStepComponent,
    selector: string
  ): HTMLSlotElement => {
    return step.shadowRoot!.querySelector(selector) as HTMLSlotElement;
  };

  public static getElementByPart = (
    step: IgcStepComponent,
    selector: string
  ): HTMLElement => {
    return step.shadowRoot!.querySelector(selector) as HTMLSlotElement;
  };

  // public static verifyState = (
  //   step: IgcStepComponent,
  //   expectedState: string
  // ): void => {
  //   const indSlot = this.getSlot(step, SLOTS.indicator);
  //   expect(step.active).to.equal(expectedState);
  //   this.verifyIndicatorIcon(indSlot, expectedState);
  // };

  // public static setFocusAndTriggerKeydown = (
  //   item: IgcTreeItemComponent,
  //   tree: IgcTreeComponent,
  //   eventKey: string,
  //   ctrlKeyFlag = false,
  //   shiftKeyFlag = false
  // ): void => {
  //   item.dispatchEvent(new Event('focus'));
  //   expect(tree.navService.focusedItem).to.equal(item);
  //   item.dispatchEvent(
  //     new KeyboardEvent('keydown', {
  //       key: eventKey,
  //       bubbles: true,
  //       ctrlKey: ctrlKeyFlag,
  //       shiftKey: shiftKeyFlag,
  //       cancelable: true,
  //     })
  //   );
  // };

  //   public static checkKeydownDefaultPrevented = (
  //     tree: IgcTreeComponent
  //   ): void => {
  //     tree.addEventListener('keydown', (ev: KeyboardEvent) => {
  //       if (ev.key.toLowerCase() === 'enter') {
  //         expect(ev.defaultPrevented).to.be.false;
  //       } else {
  //         expect(ev.defaultPrevented).to.be.true;
  //       }
  //     });
  //   };
}

// Templates

export const simpleStepper = `<igc-stepper>
                                        <igc-step>
                                          <span slot="title">Step 1</span>
                                          <span>STEP 1 CONTENT</span>
                                        </igc-step>
                                        <igc-step>
                                          <span slot="title">Step 2</span>
                                          <span>STEP 2 CONTENT</span>
                                        </igc-step>
                                        <igc-step>
                                          <span slot="title">Step 3</span>
                                          <span>STEP 3 CONTENT</span>
                                        </igc-step>
                                      </igc-stepper>`;

// export const simpleHierarchyTree = `<igc-tree>
//                                          <igc-tree-item label="Tree Item 1">
//                                            <igc-tree-item label="Tree Item 1.1">
//                                              <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2">
//                                              <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 2">
//                                            <igc-tree-item label="Tree Item 2.1">
//                                              <igc-tree-item label="Tree Item 2.1.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2">
//                                              <igc-tree-item label="Tree Item 2.2.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                        </igc-tree>`;

// export const expandCollapseTree = `<igc-tree>
//                                         <igc-tree-item label="Tree Item 1">
//                                           <span slot="indicator">ind</span>
//                                           <igc-tree-item label="Tree Item 1.1" disabled>
//                                             <span slot="indentation">-</span>
//                                             <span slot="label">Label via slot</span>
//                                             <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
//                                           </igc-tree-item>
//                                           <igc-tree-item label="Tree Item 1.2"></igc-tree-item>
//                                         </igc-tree-item>
//                                         <igc-tree-item expanded label="Tree Item 2">
//                                           <igc-tree-item label="Tree Item 2.1" expanded disabled>
//                                             <span slot="loading">*</span>
//                                             <igc-tree-item label="Tree Item 2.1.1">
//                                               <p slot="label">
//                                                 <a href="http://infragistics.com">Infragistics</a>
//                                               </p>
//                                             </igc-tree-item>
//                                           </igc-tree-item>
//                                         </igc-tree-item>
//                                       </igc-tree>`;

// export const activeItemsTree = `<igc-tree>
//                                          <igc-tree-item expanded label="Tree Item 1" active>
//                                            <igc-tree-item label="Tree Item 1.1" expanded active></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2" expanded active></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 2">
//                                            <igc-tree-item label="Tree Item 2.1" expanded active></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                       </igc-tree>`;

// export const selectedItemsTree = `<igc-tree selection='multiple' style="height: 400px;">
//                                          <igc-tree-item expanded label="Tree Item 1" selected>
//                                            <igc-tree-item label="Tree Item 1.1" expanded selected>
//                                             <igc-tree-item label="Tree Item 1.1.1" expanded></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2" expanded></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 2" selected>
//                                            <igc-tree-item label="Tree Item 2.1" expanded></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.3"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 3">
//                                            <igc-tree-item label="Tree Item 3.1" expanded></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 3.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 4">
//                                            <igc-tree-item label="Tree Item 4.1" expanded></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 4.2" active></igc-tree-item>
//                                          </igc-tree-item>
//                                       </igc-tree>`;

// export const cascadeSelectionTree = `<igc-tree selection='cascade'>
//                                          <igc-tree-item expanded label="Tree Item 1" selected>
//                                            <igc-tree-item label="Tree Item 1.1" expanded>
//                                             <igc-tree-item label="Tree Item 1.1.1" expanded></igc-tree-item>
//                                             <igc-tree-item label="Tree Item 1.1.2" expanded></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2" expanded></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 2">
//                                            <igc-tree-item label="Tree Item 2.1" expanded>
//                                             <igc-tree-item label="Tree Item 2.1.1" expanded></igc-tree-item>
//                                             <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.3"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 3">
//                                            <igc-tree-item label="Tree Item 3.1" expanded>
//                                             <igc-tree-item label="Tree Item 3.1.1" expanded selected>
//                                               <igc-tree-item label="Tree Item 3.1.1.1" expanded></igc-tree-item>
//                                               <igc-tree-item label="Tree Item 3.1.1.2" expanded></igc-tree-item>
//                                             </igc-tree-item>
//                                             <igc-tree-item label="Tree Item 3.1.2" expanded>
//                                               <igc-tree-item label="Tree Item 3.1.2.1" expanded>
//                                             </igc-tree-item></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 3.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item expanded label="Tree Item 4">
//                                            <igc-tree-item label="Tree Item 4.1" expanded>
//                                             <igc-tree-item label="Tree Item 4.1.1" selected expanded></igc-tree-item>
//                                             <igc-tree-item label="Tree Item 4.1.2" expanded></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 4.2">
//                                             <igc-tree-item label="Tree Item 4.2.1" selected expanded></igc-tree-item>
//                                             <igc-tree-item label="Tree Item 4.2.2" expanded></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                       </igc-tree>`;

// export const disabledItemsTree = `<igc-tree selection='multiple'>
//                                          <igc-tree-item label="Tree Item 1" disabled expanded>
//                                            <igc-tree-item label="Tree Item 1.1" disabled expanded>
//                                              <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2" disabled>
//                                              <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 2" expanded>
//                                            <igc-tree-item label="Tree Item 2.1" active expanded>
//                                              <igc-tree-item label="Tree Item 2.1.1" expanded disabled></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 2.1.2" expanded disabled></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2" expanded>
//                                              <igc-tree-item label="Tree Item 2.2.1" disabled></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 3">
//                                            <igc-tree-item label="Tree Item 3.1">
//                                              <igc-tree-item label="Tree Item 3.1.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 3.1.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                            <igc-tree-item label="Tree Item 3.2">
//                                              <igc-tree-item label="Tree Item 3.2.1"></igc-tree-item>
//                                              <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
//                                            </igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 4"></igc-tree-item>
//                                        </igc-tree>`;

// export const navigationTree = `<igc-tree selection='none' style="height: 400px;">
//                                        <igc-tree-item label="Tree Item 1">
//                                          <igc-tree-item label="Tree Item 1.1" expanded>
//                                            <igc-tree-item label="Tree Item 1.1.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.1.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 1.2">
//                                            <igc-tree-item label="Tree Item 1.2.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 1.2.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                        </igc-tree-item>
//                                        <igc-tree-item label="Tree Item 2" expanded>
//                                          <igc-tree-item label="Tree Item 2.1" expanded>
//                                            <p slot="label">
//                                             <input />
//                                             <input />
//                                            </p>
//                                            <igc-tree-item label="Tree Item 2.1.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.1.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 2.2" expanded>
//                                               <button slot="label">asd</button>
//                                            <igc-tree-item label="Tree Item 2.2.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                        </igc-tree-item>
//                                        <igc-tree-item label="Tree Item 3">
//                                          <igc-tree-item label="Tree Item 3.1">
//                                            <igc-tree-item label="Tree Item 3.1.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 3.1.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                          <igc-tree-item label="Tree Item 3.2">
//                                            <igc-tree-item label="Tree Item 3.2.1"></igc-tree-item>
//                                            <igc-tree-item label="Tree Item 2.2.2"></igc-tree-item>
//                                          </igc-tree-item>
//                                        </igc-tree-item>
//                                        <igc-tree-item label="Tree Item 4"></igc-tree-item>
//                                      </igc-tree>`;
