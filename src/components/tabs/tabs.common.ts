export interface IgcSelectedTabChangingArgs {
  oldIndex: number;
  newIndex: number;
}

export interface IgcSelectedTabChangedArgs {
  index: number;
}

export interface IgcTabsEventMap {
  igcSelectedTabChanging: CustomEvent<IgcSelectedTabChangingArgs>;
  igcSelectedTabChanged: CustomEvent<IgcSelectedTabChangedArgs>;
}
