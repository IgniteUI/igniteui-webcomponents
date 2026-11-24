import { isServer } from 'lit';
import { readWithStyles } from '#internals/utils/dom.js';
import { ColorModel } from '../color-picker/model.js';
import type { ColorPanelView } from '../types.js';

/**
 * Moves the canvas marker to the position of the color on the area.
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

/** A `var()` reference, the only context that a swatch color resolves. */
export const VAR_REFERENCE = /\bvar\(/i;

/** The custom property that resolves a context color. */
const CONTEXT_PROPERTY = '--_context-color';

/**
 * Parses a color that depends on its context, such as `var()`,
 * `currentcolor`, `light-dark()` or a system color, from the computed style of
 * `element`. An invalid color, an undefined variable and a server render give
 * an empty color.
 */
export function parseContextColor(
  element: HTMLElement,
  value: string
): ColorModel {
  if (isServer || !CSS.supports('color', value)) {
    return ColorModel.empty();
  }

  const styles = {
    [CONTEXT_PROPERTY]: value,
    'outline-color': `var(${CONTEXT_PROPERTY})`,
  };

  return readWithStyles(element, styles, (style) => {
    // An undefined variable, or one that is not a color, leaves no color.
    const resolved = style.getPropertyValue(CONTEXT_PROPERTY).trim();

    return resolved && CSS.supports('color', resolved)
      ? ColorModel.parse(style.outlineColor)
      : ColorModel.empty();
  });
}

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
  'contrast',
  'contrast-ratio',
  'contrast-mark',
  'pass',
  'fail',
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
