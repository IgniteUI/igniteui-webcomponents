import { setOrRemoveAttribute } from '#internals/utils/dom.js';
import type { SvgIcon } from './types.js';

/** ARIA attributes that can reference the IDs of stripped elements. */
const ARIA_ID_REF_ATTRS = ['aria-labelledby', 'aria-describedby'] as const;

/* blazorSuppress */
export class SvgIconParser {
  private _parser?: DOMParser;

  /**
   * Parses an SVG string into a {@link SvgIcon} descriptor.
   *
   * @param stripMeta - Removes `<title>` and `<desc>` from the stored markup.
   *   {@link SvgIcon.title} still holds the title for the host `aria-label`.
   */
  public parse(svgString: string, stripMeta = false): SvgIcon {
    // Created on first use so the registry can be constructed without a DOM.
    this._parser ??= new DOMParser();

    const root = this._parser.parseFromString(svgString, 'image/svg+xml');
    const svg = root.querySelector('svg');
    const error = root.querySelector('parsererror');

    if (error || !svg) {
      throw new Error('SVG element not found or malformed SVG string.');
    }

    // Read only a direct child. Icon packs also put <title> on single shapes.
    const title = svg.querySelector(':scope > title')?.textContent ?? undefined;

    if (stripMeta) {
      this._stripMetaElements(svg);
    }

    return { svg: svg.outerHTML, title };
  }

  /** Removes `<title>` and `<desc>` and the ARIA ID references to them. */
  private _stripMetaElements(svg: SVGElement): void {
    const strippedIds = new Set<string>();

    for (const element of svg.querySelectorAll('title, desc')) {
      if (element.id) {
        strippedIds.add(element.id);
      }
      element.remove();
    }

    if (strippedIds.size === 0) {
      return;
    }

    for (const attr of ARIA_ID_REF_ATTRS) {
      const value = svg.getAttribute(attr);

      if (!value) continue;

      const cleaned = value
        .trim()
        .split(/\s+/)
        .filter((id) => !strippedIds.has(id))
        .join(' ');

      setOrRemoveAttribute(svg, attr, cleaned || null);
    }
  }
}
