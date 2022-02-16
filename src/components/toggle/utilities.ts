import {
  BasePlacement,
  Boundary,
  RootBoundary,
  VariationPlacement,
} from '@popperjs/core/lib/enums';
import { Padding } from '@popperjs/core/lib/popper-lite';

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
 * Interface describing the options for toggle components' overflow configuration.
 * Further details at https://popper.js.org/docs/v2/utils/detect-overflow/
 */
export interface IOverflowOptions {
  /** For top and bottom placements, this is the x-axis. For left and right placements, it is the y-axis.
   * By default, only this axis checked.
   */
  mainAxis?: boolean; // true
  /** Determines whether the alternative axis should be checked. This may cause the popper to overlap its reference element. */
  altAxis?: boolean; // false
  /**
   * Applies virtual padding to the boundary. A single number, which will apply equal padding on all four sides, or an object
   * containing side properties each with their own padding value.
   */
  padding?: IgcPadding; // 0
  /**
   * Describes the area that the element will be checked for overflow relative to.
   * By default, it is "clippingParents", which are the scrolling containers that may cause the element to be partially or fully cut off.
   */
  boundary?: IgcBoundary; // "clippingParents"
  /** Describes whether to use the alt element's boundary. */
  altBoundary?: boolean; // false
  /**
   * Describes the root boundary that will be checked for overflow. The two available options are
   * 'viewport' and 'document', 'viewport' being the default one.
   */
  rootBoundary?: IgcRootBoundary; // "viewport"
}

/**
 * Describes the preferred placement of a toggle component.
 */
export type IgcPlacement = BasePlacement | VariationPlacement;

/**
 * Describes the area that the element will be checked for overflow relative to.
 */
export type IgcBoundary = Boundary;

/**
 * Describes the root boundary that will be checked for overflow.
 */
export type IgcRootBoundary = RootBoundary;

/** Describes the virtual padding applied to the boundary. */
export type IgcPadding = Padding;
