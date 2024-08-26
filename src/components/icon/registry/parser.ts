import type { SvgIcon } from './types.js';

/* blazorSuppress */
export class SvgIconParser {
  private _parser: DOMParser;

  constructor() {
    this._parser = new DOMParser();
  }

  public parse(svgString: string): SvgIcon {
    const root = this._parser.parseFromString(svgString, 'image/svg+xml');
    const svg = root.querySelector('svg');
    const error = root.querySelector('parsererror');

    if (error || !svg) {
      throw new Error('SVG element not found or malformed SVG string.');
    }

    const title = svg.querySelector('title')?.textContent ?? '';

    svg.setAttribute('fit', '');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    return {
      svg: svg.outerHTML,
      title,
    };
  }
}
