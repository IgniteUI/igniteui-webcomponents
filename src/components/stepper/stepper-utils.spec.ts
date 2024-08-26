import { fixture, html, unsafeStatic } from '@open-wc/testing';

import type IgcStepComponent from './step.js';
import type IgcStepperComponent from './stepper.js';

export const DIFF_OPTIONS = {
  ignoreAttributes: ['id', 'part', 'tabindex', 'role'],
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
  text: 'div[part~="text"]',
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
                                  <igc-step>
                                    <span slot="title">Step 4</span>
                                    <span>STEP 4 CONTENT</span>
                                  </igc-step>
                                  <igc-step>
                                    <span slot="title">Step 5</span>
                                    <span>STEP 5 CONTENT</span>
                                  </igc-step>
                              </igc-stepper>`;

export const linearModeStepper = `<igc-stepper linear>
                                      <igc-step invalid optional>
                                        <span slot="title">Step 1</span>
                                        <span>STEP 1 CONTENT</span>
                                      </igc-step>
                                      <igc-step invalid>
                                        <span slot="title">Step 2</span>
                                        <span>STEP 2 CONTENT</span>
                                      </igc-step>
                                      <igc-step invalid>
                                        <igc-icon slot="indicator" name='home'></igc-icon>
                                        <span slot="title">Step 3</span>
                                        <span>STEP 3 CONTENT</span>
                                      </igc-step>
                                    </igc-stepper>`;

export const stepperActiveDisabledSteps = `<igc-stepper>
                                        <igc-step active>
                                          <span slot="title">Step 1</span>
                                          <span>STEP 1 CONTENT</span>
                                        </igc-step>
                                        <igc-step active disabled>
                                          <span slot="title">Step 2</span>
                                          <span>STEP 2 CONTENT</span>
                                        </igc-step>
                                        <igc-step>
                                          <igc-icon slot="indicator" name='home'></igc-icon>
                                        </igc-step>
                                        <igc-step>
                                          <span slot="title">Step 4</span>
                                          <span>STEP 4 CONTENT</span>
                                        </igc-step>
                                      </igc-stepper>`;
