import { svg, type TemplateResult } from 'lit';
import type { QrCornerDotStyle, QrCornerSquareStyle } from '../types.js';
import { CORNER_DOT_COLOR, CORNER_SQUARE_COLOR } from './constants.js';
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

/** Renders a finder-pattern corner as a Lit SVG template, composing the outer square and inner dot paths. */
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
        <path d=${squarePath} fill=${CORNER_SQUARE_COLOR} fill-rule="evenodd"></path>
        <path d=${dotPath} fill=${CORNER_DOT_COLOR}></path>
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

/**
 * Renders all three finder-pattern corners as an array of Lit SVG templates, given the QR code size, module size, margin, and styles.
 */
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
