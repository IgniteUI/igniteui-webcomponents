import type IgcStepperComponent from './stepper.js';

export interface IgcActiveStepChangingArgs {
  oldIndex: number;
  newIndex: number;
  owner: IgcStepperComponent;
}

export interface IgcActiveStepChangedArgs {
  index: number;
  owner: IgcStepperComponent;
}

export interface IgcStepperEventMap {
  igcActiveStepChanging: CustomEvent<IgcActiveStepChangingArgs>;
  igcActiveStepChanged: CustomEvent<IgcActiveStepChangedArgs>;
}
