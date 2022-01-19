import { BasePlacement, VariationPlacement } from '@popperjs/core/lib/enums';

/**
 * Common interface for components with show and hide functionality.
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
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}
/**
 * Interface describing the options for toggle components' configuration.
 */
export interface IToggleOptions {
  /** The preferred placement of the toggle element around the target element. */
  placement: IgcPlacement;
  /** The positioning strategy to use.
   * Use the `fixed` strategy when the target element is in a fixed container, otherwise - use `absolute`.
   */
  positionStrategy: 'absolute' | 'fixed';
  /**
   * Whether the element should be flipped to the opposite side once it's about to overflow the visible area.
   * Once enough space is detected on its preferred side, it will flip back.
   */
  flip?: boolean;
  /**
   * Whether the element should be hidden on clicking outside of it.
   */
  closeOnOutsideClick?: boolean;
  /**
   * The amount of offset in horizontal and/or vertical direction.
   */
  offset?: { x: number; y: number };
}

/**
 * Describes the preferred placement of a toggle component.
 */
export type IgcPlacement = BasePlacement | VariationPlacement;
