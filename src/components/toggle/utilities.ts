import { BasePlacement, VariationPlacement } from '@popperjs/core/lib/enums';

/**
 * Common interface for Components with open and close functionality
 */
export interface IToggleView {
  element?: any;
  open?: boolean;

  show(...args: any): void;
  hide(...args: any): void;
  toggle(...args: any): void;
}

/**
 * Common events interface for toggle components
 */
export interface IgcToggleEventMap {
  igcOpening: CustomEvent<any>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<any>;
  igcClosed: CustomEvent<void>;
}

export interface IToggleOptions {
  placement: IgcPlacement;
  strategy: 'absolute' | 'fixed';
  flip?: boolean;
  closeOnOutsideClick?: boolean;
  offset?: number[];
}

export type IgcPlacement = BasePlacement | VariationPlacement;
