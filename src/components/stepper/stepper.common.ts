import type IgcStepperComponent from './stepper.js';

export interface IgcStepperEventMap {
  /* alternateName: selectionChanged */
  igcActiveStepChanging: CustomEvent<{
    oldIndex: number;
    newIndex: number;
    owner: IgcStepperComponent;
  }>;
  igcActiveStepChanged: CustomEvent<{
    index: number;
    owner: IgcStepperComponent;
  }>;
}
