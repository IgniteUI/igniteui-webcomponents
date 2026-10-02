import { svg, type TemplateResult } from 'lit';
import type { QrCornerDotStyle, QrCornerSquareStyle } from '../types.js';
import {
  cornerDotPath,
  cornerSquarePath,
  getFinderPatterns,
} from './helpers.js';

type RenderFindersProperties = {
  size: number;
  moduleSize: number;
  marginPx: number;
  dotStyle: QrCornerDotStyle;
  squareStyle: QrCornerSquareStyle;
};

/** Renders the three finder-pattern corners. */
export function renderQrFinders({
  size,
  moduleSize,
  marginPx,
  dotStyle,
  squareStyle,
}: RenderFindersProperties): TemplateResult[] {
  return getFinderPatterns(size, moduleSize, marginPx).map(({ x, y }) => {
    const squarePath = cornerSquarePath(x, y, 7 * moduleSize, squareStyle);
    const dotPath = cornerDotPath(
      x + 2 * moduleSize,
      y + 2 * moduleSize,
      3 * moduleSize,
      dotStyle
    );

    return svg`
      <g>
        <path part="corner-square" d=${squarePath} fill-rule="evenodd"></path>
        <path part="corner-dot" d=${dotPath}></path>
      </g>
    `;
  });
}
