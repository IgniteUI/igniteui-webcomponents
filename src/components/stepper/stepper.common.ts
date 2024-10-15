export interface IgcActiveStepChangingArgs {
  oldIndex: number;
  newIndex: number;
}

export interface IgcActiveStepChangedArgs {
  index: number;
}

export interface IgcStepperComponentEventMap {
  igcActiveStepChanging: CustomEvent<IgcActiveStepChangingArgs>;
  igcActiveStepChanged: CustomEvent<IgcActiveStepChangedArgs>;
}
