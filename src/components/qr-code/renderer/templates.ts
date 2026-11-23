import { nothing, svg, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';
import {
  alignmentPath,
  getFinderPatterns,
  moduleToPx,
  patternPaths,
  renderDataModules,
} from './helpers.js';
import type { LogoLayout } from './logo.js';

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
  moduleSize: number;
  marginPx: number;
  dotStyle: QrDotStyle;
  dotScale: number;
};

/** The last path of each matrix, keyed by geometry; an unchanged render reuses it. */
const paths = new WeakMap<boolean[][], { key: string; path: string }>();

/** Renders the data modules as a single SVG path. */
export function renderQrDots({
  matrix,
  moduleSize,
  marginPx,
  dotStyle,
  dotScale,
}: RenderQrDotsProperties): TemplateResult {
  const key = `${moduleSize}:${marginPx}:${dotStyle}:${dotScale}`;
  let cached = paths.get(matrix);

  if (cached?.key !== key) {
    const modules = renderDataModules(
      matrix,
      moduleSize,
      marginPx,
      dotStyle,
      dotScale
    );
    cached = { key, path: modules.join(' ') };
    paths.set(matrix, cached);
  }

  return svg`<path part="dots" d=${cached.path} />`;
}

type RenderPatternsProperties = {
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
}: RenderPatternsProperties): TemplateResult[] {
  return getFinderPatterns(size, moduleSize, marginPx).map(
    ({ x, y, antiDiagonal }) => {
      const [squarePath, dotPath] = patternPaths(
        x,
        y,
        7,
        moduleSize,
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
    }
  );
}

/** Renders the alignment patterns as a single SVG path, or nothing for version 1. */
export function renderQrAlignment({
  size,
  moduleSize,
  marginPx,
  dotStyle,
  squareStyle,
}: RenderPatternsProperties): TemplateResult | typeof nothing {
  const path = alignmentPath(size, moduleSize, marginPx, squareStyle, dotStyle);

  return path
    ? svg`<path part="alignment" d=${path} fill-rule="evenodd"></path>`
    : nothing;
}

type RenderQrMaskAndImageProperties = {
  src: string;
  layout?: LogoLayout;
  /** The CSS pixels of one SVG unit, which convert `margin` to units. */
  unitSize: number;
  margin?: number;
  svgSize: number;
  moduleSize: number;
  marginPx: number;
  maskId: string;
  transform?: string;
};

/**
 * Renders the logo image and its mask: a white rectangle with a black cutout of the modules of
 * `layout`. The image fills the logo box, less `margin` pixels on each side, and takes the
 * `transform` of the masked group.
 */
export function renderQrMaskAndImage({
  src,
  layout,
  unitSize,
  margin,
  svgSize,
  moduleSize,
  marginPx,
  maskId,
  transform,
}: RenderQrMaskAndImageProperties) {
  if (!layout) {
    return { mask: nothing, image: nothing, shouldApplyMask: false };
  }

  const toSvg = (modules: number) => moduleToPx(modules, moduleSize, marginPx);
  const boxMargin = (margin ?? 0) / unitSize;

  const cutX = toSvg(layout.left);
  const cutY = toSvg(layout.top);
  const cutRight = toSvg(layout.right + 1);
  const cutBottom = toSvg(layout.bottom + 1);

  const x = toSvg(layout.x) + boxMargin;
  const y = toSvg(layout.y) + boxMargin;
  const width = Math.max(0, layout.width * moduleSize - boxMargin * 2);
  const height = Math.max(0, layout.height * moduleSize - boxMargin * 2);

  const shouldApplyMask = width > 0 && height > 0;

  const mask = shouldApplyMask
    ? svg`
      <defs>
        <mask id=${maskId}>
          <rect width=${svgSize} height=${svgSize} fill="white" />
          <rect
            x=${cutX}
            y=${cutY}
            width=${cutRight - cutX}
            height=${cutBottom - cutY}
            fill="black"
          />
        </mask>
      </defs>
  `
    : nothing;

  const image = shouldApplyMask
    ? svg`<image href=${src} x=${x} y=${y} width=${width} height=${height} transform=${ifDefined(transform)} />`
    : nothing;

  return { mask, image, shouldApplyMask };
}

//#endregion

export { DEFAULT_SIZE_RATIO, MAX_SAFE_AREA, SAFE_AREAS };
