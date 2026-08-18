import type { SvgIcon } from './types.js';

/** ARIA attributes that may reference stripped element IDs and need to be cleaned up. */
const ARIA_ID_REF_ATTRS = ['aria-labelledby', 'aria-describedby'] as const;

/* blazorSuppress */
export class SvgIconParser {
  private _parser?: DOMParser;

  /**
   * Parses an SVG string into a {@link SvgIcon} descriptor.
   *
   * @param stripMeta - Removes every `<title>` and `<desc>` element from the
   *   stored markup. The title text is still returned in {@link SvgIcon.title},
   *   so the host `<igc-icon>` can keep exposing it as its `aria-label`.
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

    // Only a direct child titles the icon as a whole - packs also put <title>
    // elements on individual shapes.
    const title = svg.querySelector(':scope > title')?.textContent ?? undefined;

    if (stripMeta) {
      this._stripMetaElements(svg);
    }

    return { svg: svg.outerHTML, title };
  }

  /**
   * Removes all `<title>` and `<desc>` elements, and with them any
   * `aria-labelledby` / `aria-describedby` id they were the target of -
   * a reference left dangling would be invalid markup.
   */
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

      if (cleaned) {
        svg.setAttribute(attr, cleaned);
      } else {
        svg.removeAttribute(attr);
      }
    }
  }
}
