import { svg, type TemplateResult } from 'lit';
import type { QrDotStyle } from '../types.js';
import { renderDataModules } from './helpers.js';

type RenderQrDotsProperties = {
  matrix: boolean[][];
  moduleSize: number;
  marginPx: number;
  dotStyle: QrDotStyle;
};

/** Renders the data modules as a single SVG path. */
export function renderQrDots({
  matrix,
  moduleSize,
  marginPx,
  dotStyle,
}: RenderQrDotsProperties): TemplateResult {
  const modules = renderDataModules(matrix, moduleSize, marginPx, dotStyle);
  return svg`<path part="dots" d=${modules.join(' ')} />`;
}
