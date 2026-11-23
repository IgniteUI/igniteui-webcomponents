import { nothing, svg, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { bindIf } from '#internals/utils/lit.js';
import type { ModuleRange } from '../model/cutout.js';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
  QrGradient,
} from '../types.js';
import {
  alignmentPath,
  type CodeGrid,
  getFinderPatterns,
  joinsModules,
  moduleToPx,
  patternPaths,
  renderDataModules,
} from './helpers.js';
import { insetBox, type LogoLayout, logoClipPath } from './logo.js';

//#region Logo areas

/**
 * The largest share of the code area that a logo can cover, per error correction level,
 * while the code stays scannable.
 */
const SAFE_AREAS = { L: 0.0225, M: 0.04, Q: 0.0625, H: 0.09 } as const;

/** The largest safe logo area, at level H. */
const MAX_SAFE_AREA = SAFE_AREAS.H;

/** The default logo size, as a ratio of `MAX_SAFE_AREA`. */
const DEFAULT_SIZE_RATIO = 0.4;

//#endregion

//#region Templates

type RenderQrDotsProperties = {
  matrix: boolean[][];
  grid: CodeGrid;
  dotStyle: QrDotStyle;
  dotScale: number;
  cutout?: ModuleRange[];
};

/** The last path of each matrix, keyed by geometry; an unchanged render reuses it. */
const paths = new WeakMap<boolean[][], { key: string; path: string }>();

/** Renders the data modules as a single SVG path. */
export function renderQrDots({
  matrix,
  grid: { moduleSize, marginPx },
  dotStyle,
  dotScale,
  cutout,
}: RenderQrDotsProperties): TemplateResult {
  // Only a joining style reads the cutout, so the others keep their cached path.
  const joinedCutout = joinsModules(dotStyle, dotScale) ? cutout : undefined;
  const key = `${moduleSize}:${marginPx}:${dotStyle}:${dotScale}:${JSON.stringify(joinedCutout)}`;
  let cached = paths.get(matrix);

  if (cached?.key !== key) {
    const modules = renderDataModules(
      matrix,
      moduleSize,
      marginPx,
      dotStyle,
      dotScale,
      joinedCutout
    );
    cached = { key, path: modules.join(' ') };
    paths.set(matrix, cached);
  }

  return svg`<path part="dots" d=${cached.path} />`;
}

export type RenderPatternsProperties = {
  grid: CodeGrid;
  dotStyle: QrCornerDotStyle;
  squareStyle: QrCornerSquareStyle;
};

/** Renders the three finder-pattern corners. */
export function renderQrFinders({
  grid,
  dotStyle,
  squareStyle,
}: RenderPatternsProperties): TemplateResult[] {
  return getFinderPatterns(grid).map(({ x, y, antiDiagonal }) => {
    const [squarePath, dotPath] = patternPaths(
      x,
      y,
      7,
      grid.moduleSize,
      squareStyle,
      dotStyle,
      antiDiagonal
    );

    return svg`
      <g>
        <path part="corner-square" d=${squarePath} fill-rule="evenodd"></path>
        <path part="corner-dot" d=${dotPath}></path>
      </g>
    `;
  });
}

/** Renders the alignment patterns as a single SVG path, or nothing for version 1. */
export function renderQrAlignment({
  grid,
  dotStyle,
  squareStyle,
}: RenderPatternsProperties): TemplateResult | typeof nothing {
  const path = alignmentPath(grid, squareStyle, dotStyle);

  return path
    ? svg`<path part="alignment" d=${path} fill-rule="evenodd"></path>`
    : nothing;
}

type QrMaskAndImage = {
  mask: TemplateResult | typeof nothing;
  image: TemplateResult | typeof nothing;
  shouldApplyMask: boolean;
};

const NO_LOGO: QrMaskAndImage = {
  mask: nothing,
  image: nothing,
  shouldApplyMask: false,
};

type RenderQrMaskAndImageProperties = {
  src: string;
  layout?: LogoLayout;
  /** The CSS pixels of one SVG unit, which convert `margin` to units. */
  unitSize: number;
  margin?: number;
  grid: CodeGrid;
  maskId: string;
  clipId: string;
  transform?: string;
};

/**
 * Renders the logo image and its mask: a white rectangle with a black rectangle for each range
 * of the cutout of `layout`. The image fills the logo box, less `margin` pixels on each side,
 * takes the `transform` of the masked group, and is clipped to the logo shape.
 */
export function renderQrMaskAndImage({
  src,
  layout,
  unitSize,
  margin,
  grid,
  maskId,
  clipId,
  transform,
}: RenderQrMaskAndImageProperties): QrMaskAndImage {
  if (!layout) return NO_LOGO;

  const toSvg = (modules: number) => moduleToPx(modules, grid);
  const boxMargin = (margin ?? 0) / unitSize;
  const box = {
    x: toSvg(layout.x),
    y: toSvg(layout.y),
    width: layout.width * grid.moduleSize,
    height: layout.height * grid.moduleSize,
  };
  const { x, y, width, height } = insetBox(box, boxMargin);

  if (width <= 0 || height <= 0) return NO_LOGO;

  const cuts = layout.cutout.map(({ top, left, bottom, right }) => {
    const cutX = toSvg(left);
    const cutY = toSvg(top);
    return svg`<rect x=${cutX} y=${cutY} width=${toSvg(right + 1) - cutX} height=${toSvg(bottom + 1) - cutY} fill="black" />`;
  });

  const clip = logoClipPath(layout.shape, box, boxMargin);

  const mask = svg`
      <defs>
        <mask id=${maskId}>
          <rect width=${grid.svgSize} height=${grid.svgSize} fill="white" />
          ${cuts}
        </mask>
        ${clip ? svg`<clipPath id=${clipId}><path d=${clip} /></clipPath>` : nothing}
      </defs>
  `;

  const image = svg`<image href=${src} x=${x} y=${y} width=${width} height=${height} clip-path=${bindIf(clip, `url(#${clipId})`)} transform=${ifDefined(transform)} />`;

  return { mask, image, shouldApplyMask: true };
}

type RenderQrGradientProperties = {
  id: string;
  gradient: QrGradient;
  angle: number;
  grid: CodeGrid;
};

/**
 * Renders the gradient of the dark modules over the matrix, without the quiet zone. A linear one
 * at `angle` and a radial one reach the corners of the matrix. The CSS sets the stop colors.
 */
export function renderQrGradient({
  id,
  gradient,
  angle,
  grid: { svgSize, marginPx },
}: RenderQrGradientProperties): TemplateResult {
  const center = svgSize / 2;
  const half = center - marginPx;
  const stops = svg`<stop offset="0" /><stop offset="1" />`;

  if (gradient === 'radial') {
    return svg`<defs><radialGradient id=${id} gradientUnits="userSpaceOnUse" cx=${center} cy=${center} r=${half * Math.SQRT2}>${stops}</radialGradient></defs>`;
  }

  const radians = (angle * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const reach = half * (Math.abs(dx) + Math.abs(dy));

  return svg`<defs><linearGradient id=${id} gradientUnits="userSpaceOnUse" x1=${center - dx * reach} y1=${center - dy * reach} x2=${center + dx * reach} y2=${center + dy * reach}>${stops}</linearGradient></defs>`;
}

//#endregion

export { DEFAULT_SIZE_RATIO, MAX_SAFE_AREA, SAFE_AREAS };
