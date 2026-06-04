import { svg, type TemplateResult } from 'lit';
import type { QrCornerProperties } from '../types.js';
import { cornerDotPath, cornerSquarePath } from './svg.js';

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
        <path d=${squarePath} fill="var(--qr-corner-square-fill, black)" fill-rule="evenodd"></path>
        <path d=${dotPath} fill="var(--qr-corner-dot-fill, black)"></path>
      </g>
    `;
}
