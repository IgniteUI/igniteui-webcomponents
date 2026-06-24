import { svg, type TemplateResult } from 'lit';
import type { QrDotStyle } from '../types.js';
import { DOT_COLOR } from './constants.js';
import { renderDataModules } from './helpers.js';

type RenderQrDotsProperties = {
  matrix: boolean[][];
  moduleSize: number;
  marginPx: number;
  dotStyle: QrDotStyle;
};

/**
 * Renders the data modules of the QR code as a single SVG path, given the QR code matrix, module size, margin, and dot style.
 * Returns a Lit SVG template.
 */
export function renderQrDots({
  matrix,
  moduleSize,
  marginPx,
  dotStyle,
}: RenderQrDotsProperties): TemplateResult {
  const modules = renderDataModules(matrix, moduleSize, marginPx, dotStyle);
  return svg`<path d=${modules.join(' ')} fill=${DOT_COLOR} />`;
}
