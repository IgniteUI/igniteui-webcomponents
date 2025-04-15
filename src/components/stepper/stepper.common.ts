export interface IgcActiveStepChangingEventArgs {
  oldIndex: number;
  newIndex: number;
}

export interface IgcActiveStepChangedEventArgs {
  index: number;
}

/** @deprecated since 5.4.0. Use IgcActiveStepChangingEventArgs instead */
export type IgcActiveStepChangingArgs = IgcActiveStepChangingEventArgs;
/** @deprecated since 5.4.0. Use IgcActiveStepChangedEventArgs instead */
export type IgcActiveStepChangedArgs = IgcActiveStepChangedEventArgs;

export interface IgcStepperComponentEventMap {
  igcActiveStepChanging: CustomEvent<IgcActiveStepChangingEventArgs>;
  igcActiveStepChanged: CustomEvent<IgcActiveStepChangedEventArgs>;
}
