import { svg, type TemplateResult } from 'lit';
import type { QrCornerDotStyle, QrCornerSquareStyle } from '../types.js';
import {
  cornerDotPath,
  cornerSquarePath,
  getFinderPatterns,
} from './helpers.js';

type QrCornerProperties = {
  x: number;
  y: number;
  size: number;
  dotStyle: QrCornerDotStyle;
  squareStyle: QrCornerSquareStyle;
};

/** Renders a finder-pattern corner: the outer square and the inner dot. */
export function renderQrCorner({
  x,
  y,
  size,
  dotStyle,
  squareStyle,
}: QrCornerProperties): TemplateResult {
  const outerSize = 7 * size;
  const innerSize = 3 * size;
  const innerOffset = 2 * size;

  const squarePath = cornerSquarePath(x, y, outerSize, squareStyle);
  const dotPath = cornerDotPath(
    x + innerOffset,
    y + innerOffset,
    innerSize,
    dotStyle
  );

  return svg`
      <g>
        <path part="corner-square" d=${squarePath} fill-rule="evenodd"></path>
        <path part="corner-dot" d=${dotPath}></path>
      </g>
    `;
}

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
  return getFinderPatterns(size, moduleSize, marginPx).map(({ x, y }) =>
    renderQrCorner({
      x,
      y,
      size: moduleSize,
      dotStyle,
      squareStyle,
    })
  );
}
