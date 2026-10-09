import { svg, type TemplateResult } from 'lit';
import type { QrDotStyle } from '../types.js';
import { renderDataModules } from './helpers.js';

type RenderQrDotsProperties = {
  matrix: boolean[][];
  moduleSize: number;
  marginPx: number;
  dotStyle: QrDotStyle;
};

/** The last path of each matrix, keyed by geometry; an unchanged render reuses it. */
const paths = new WeakMap<boolean[][], { key: string; path: string }>();

/** Renders the data modules as a single SVG path. */
export function renderQrDots({
  matrix,
  moduleSize,
  marginPx,
  dotStyle,
}: RenderQrDotsProperties): TemplateResult {
  const key = `${moduleSize}:${marginPx}:${dotStyle}`;
  let cached = paths.get(matrix);

  if (cached?.key !== key) {
    const modules = renderDataModules(matrix, moduleSize, marginPx, dotStyle);
    cached = { key, path: modules.join(' ') };
    paths.set(matrix, cached);
  }

  return svg`<path part="dots" d=${cached.path} />`;
}
