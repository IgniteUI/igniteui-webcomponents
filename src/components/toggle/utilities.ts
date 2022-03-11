import { Placement } from '@floating-ui/dom';

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
  positionStrategy?: 'absolute' | 'fixed';
  /**
   * Whether the element should be flipped to the opposite side once it's about to overflow the visible area.
   * Once enough space is detected on its preferred side, it will flip back.
   */
  flip?: boolean;
  /**
   * Whether to prevent the element from being cut off by moving it so it stays visible within its boundary area.
   */
  // preventOverflow?: IOverflowOptions;
  /**
   * Whether the element should be hidden on clicking outside of it.
   */
  closeOnOutsideClick?: boolean;
  /**
   * The amount of offset in horizontal and/or vertical direction.
   */
  offset?: { x: number; y: number };
  /**
   * Whether to make the toggle the same width as the target.
   */
  sameWidth?: boolean;
}

/**
 * Describes the preferred placement of a toggle component.
 */
export type IgcPlacement = Placement;
