import type { ColorPanelView } from '../types.js';

/**
 * Moves the canvas marker to the saturation and value of the color.
 *
 * @internal
 */
export const syncMarker = Symbol('syncMarker');

/**
 * A copy of the color model of the panel. It keeps the hue of a gray, which a
 * color string does not carry.
 *
 * @internal
 */
export const panelColor = Symbol('panelColor');

/**
 * Reads the color of a swatch again. A color with `var()` resolves from the
 * computed style of the swatch.
 *
 * @internal
 */
export const resolveSwatch = Symbol('resolveSwatch');

/**
 * The resolved color of a swatch as a color key: an empty key for the
 * no-color swatch, `null` for a color that does not resolve.
 *
 * @internal
 */
export const swatchKey = Symbol('swatchKey');

/** The custom state of the selected swatch. */
export const SWATCH_SELECTED_STATE = 'ig-selected';

/**
 * The parts of the panel that the color picker exposes as its own. All parts
 * except `base`, which the popup of the picker replaces.
 */
export const panelParts = [
  'picker-canvas',
  'marker',
  'dragging',
  'main-row',
  'alpha-row',
  'inputs-row',
  'buttons',
  'hue',
  'alpha',
  'alpha-input',
  'copy',
  'eye-dropper',
  'format-select',
  'swatches',
  'swatch',
  'selected',
  'view-switcher',
  'view-button',
  'active',
] as const;

/** The views of the panel, in the order of the view switcher. */
export const VIEWS: readonly ColorPanelView[] = ['gradient', 'swatches'];

/**
 * The views in a `views` token list, in the order of the switcher. Unknown
 * tokens drop out. A list without a known view gives the gradient view.
 */
export function parseViews(views: string | null | undefined): ColorPanelView[] {
  const tokens = new Set(views?.split(/\s+/));
  const known = VIEWS.filter((view) => tokens.has(view));

  return known.length ? known : ['gradient'];
}

/** The view that shows: `active` when `views` has it, else the first view. */
export function resolveView(
  views: string | null | undefined,
  active: ColorPanelView
): ColorPanelView {
  const list = parseViews(views);
  return list.includes(active) ? active : list[0];
}
