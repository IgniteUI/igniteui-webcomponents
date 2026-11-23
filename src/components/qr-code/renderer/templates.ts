import { nothing, svg, type TemplateResult } from 'lit';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';
import {
  cornerDotPath,
  cornerSquarePath,
  getFinderPatterns,
  moduleToPx,
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

type RenderQrMaskAndImageProperties = {
  src: string;
  layout?: LogoLayout;
  size: number;
  margin?: number;
  svgSize: number;
  moduleSize: number;
  marginPx: number;
  maskId: string;
};

/**
 * Renders the logo image and its mask: a white rectangle with a black cutout of the modules of
 * `layout`. The image fills the logo box, less `margin` on each side.
 */
export function renderQrMaskAndImage({
  src,
  layout,
  size,
  margin,
  svgSize,
  moduleSize,
  marginPx,
  maskId,
}: RenderQrMaskAndImageProperties) {
  if (!layout) {
    return { mask: nothing, image: nothing, shouldApplyMask: false };
  }

  const toSvg = (modules: number) => moduleToPx(modules, moduleSize, marginPx);
  const boxMargin = (margin ?? 0) * (svgSize / size);

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
    ? svg`<image href=${src} x=${x} y=${y} width=${width} height=${height} />`
    : nothing;

  return { mask, image, shouldApplyMask };
}

//#endregion

export { DEFAULT_SIZE_RATIO, MAX_SAFE_AREA, SAFE_AREAS };
