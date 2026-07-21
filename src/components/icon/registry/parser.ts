import type { SvgIcon } from './types.js';

/** ARIA attributes that may reference stripped element IDs and need to be cleaned up. */
const ARIA_ID_REF_ATTRS = ['aria-labelledby', 'aria-describedby'] as const;

/* blazorSuppress */
export class SvgIconParser {
  private _parser: DOMParser;

  constructor() {
    this._parser = new DOMParser();
  }

  /**
   * Parses an SVG string into a {@link SvgIcon} descriptor.
   *
   * @param svgString - Raw SVG markup to parse.
   * @param stripMeta - When `true`, removes `<title>` and `<desc>` child
   *   elements from the SVG and cleans up any `aria-labelledby` /
   *   `aria-describedby` references on the root element that pointed to the
   *   stripped nodes' IDs. The extracted title text is still returned in
   *   {@link SvgIcon.title} so the host `<igc-icon>` can use it as its
   *   `aria-label`. Defaults to `false`.
   */
  public parse(svgString: string, stripMeta = false): SvgIcon {
    const root = this._parser.parseFromString(svgString, 'image/svg+xml');
    const svg = root.querySelector('svg');
    const error = root.querySelector('parsererror');

    if (error || !svg) {
      throw new Error('SVG element not found or malformed SVG string.');
    }

    svg.setAttribute('fit', '');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const titleEl = svg.querySelector('title');
    const descEl = svg.querySelector('desc');
    const title = titleEl?.textContent ?? '';

    if (stripMeta) {
      this._stripMetaElements(svg, titleEl, descEl);
    }

    return { svg: svg.outerHTML, title };
  }

  /**
   * Removes `<title>` and `<desc>` from the SVG element and repairs any ARIA
   * ID-reference attributes (`aria-labelledby`, `aria-describedby`) that
   * pointed to the stripped nodes.
   *
   * @remarks
   * Leaving dangling ARIA ID references after removing their target elements
   * would produce invalid markup. Collect the IDs of both stripped elements
   * and rebuild each reference attribute by filtering out those IDs. When all
   * referenced IDs are stripped, the attribute is removed entirely.
   */
  private _stripMetaElements(
    svg: SVGElement,
    title: Element | null,
    desc: Element | null
  ): void {
    const strippedIds = new Set(
      [title?.id, desc?.id].filter((id): id is string => Boolean(id))
    );

    title?.remove();
    desc?.remove();

    if (strippedIds.size === 0) {
      return;
    }

    for (const attr of ARIA_ID_REF_ATTRS) {
      const value = svg.getAttribute(attr);

      if (!value) continue;

      const cleaned = value
        .split(/\s+/)
        .filter((id) => !strippedIds.has(id))
        .join(' ')
        .trim();

      if (cleaned) {
        svg.setAttribute(attr, cleaned);
      } else {
        svg.removeAttribute(attr);
      }
    }
  }
}
