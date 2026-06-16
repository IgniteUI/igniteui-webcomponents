export interface IgcActiveStepChangingEventArgs {
  oldIndex: number;
  newIndex: number;
}

export interface IgcActiveStepChangedEventArgs {
  index: number;
}

export interface IgcStepperComponentEventMap {
  igcActiveStepChanging: CustomEvent<IgcActiveStepChangingEventArgs>;
  igcActiveStepChanged: CustomEvent<IgcActiveStepChangedEventArgs>;
}
