export interface IgcActiveStepChangingEventArgs {
  oldIndex: number;
  newIndex: number;
}

export interface IgcActiveStepChangedEventArgs {
  index: number;
}

/** @deprecated use IgcActiveStepChangingEventArgs instead */
export type IgcActiveStepChangingArgs = IgcActiveStepChangingEventArgs;
/** @deprecated use IgcActiveStepChangedEventArgs instead */
export type IgcActiveStepChangedArgs = IgcActiveStepChangedEventArgs;

export interface IgcStepperComponentEventMap {
  igcActiveStepChanging: CustomEvent<IgcActiveStepChangingEventArgs>;
  igcActiveStepChanged: CustomEvent<IgcActiveStepChangedEventArgs>;
}
