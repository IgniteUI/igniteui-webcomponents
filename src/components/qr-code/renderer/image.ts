import { nothing, svg } from 'lit';

type RenderQrMaskAndImageProperties = {
  hasLogo: boolean;
  src: string;
  aspectRatio: number;
  area: number;
  size: number;
  margin?: number;
  svgSize: number;
  maskId: string;
};

/**
 * Renders an SVG mask and image element for the QR code's logo, based on the presence of a logo,
 * its source, aspect ratio, desired area, QR code size, margin, overall SVG size, and a unique mask ID.
 *
 * The mask is a white rectangle with a black cutout where the logo will be placed, ensuring the QR code
 * remains scannable while accommodating the logo.
 */
export function renderQrMaskAndImage({
  hasLogo,
  src,
  aspectRatio,
  area,
  size,
  margin,
  svgSize,
  maskId,
}: RenderQrMaskAndImageProperties) {
  const clamped = area * svgSize * svgSize;
  const boxWidth = Math.sqrt(clamped * aspectRatio);
  const boxHeight = Math.sqrt(clamped / aspectRatio);
  const boxMargin = (margin ?? 0) * (svgSize / size);
  const boxX = (svgSize - boxWidth) / 2;
  const boxY = (svgSize - boxHeight) / 2;
  const x = boxX + boxMargin;
  const y = boxY + boxMargin;
  const width = Math.max(0, boxWidth - boxMargin * 2);
  const height = Math.max(0, boxHeight - boxMargin * 2);

  const shouldApplyMask = hasLogo && width > 0 && height > 0;

  const mask = shouldApplyMask
    ? svg`
      <defs>
        <mask id=${maskId}>
          <rect width=${svgSize} height=${svgSize} fill="white" />
          <rect x=${boxX} y=${boxY} width=${boxWidth} height=${boxHeight} fill="black" />
        </mask>
      </defs>
  `
    : nothing;

  const image =
    hasLogo && width > 0 && height > 0
      ? svg`<image href=${src} x=${x} y=${y} width=${width} height=${height} />`
      : nothing;

  return { mask, image, shouldApplyMask };
}
