import type { QrCodeExportFormat } from '../types.js';

type QrRasterFormat = Exclude<QrCodeExportFormat, 'svg'>;

/** MIME type of each export format. */
export const MIME_TYPES: Readonly<Record<QrCodeExportFormat, string>> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Maximum side length in pixels of an exported raster image.
 * Browsers fail to allocate or encode canvases past this bound.
 */
export const MAX_EXPORT_DIMENSION = 16384;

const EXTENSIONS: Readonly<Record<QrCodeExportFormat, RegExp>> = {
  svg: /\.svg$/i,
  png: /\.png$/i,
  jpeg: /\.jpe?g$/i,
  webp: /\.webp$/i,
};

/** Whether `format` is one of the supported export formats. */
export function isExportFormat(format: string): format is QrCodeExportFormat {
  return Object.hasOwn(MIME_TYPES, format);
}

/** Appends the extension of `format` to `fileName` unless it already ends with a matching one. */
export function ensureExtension(
  fileName: string,
  format: QrCodeExportFormat
): string {
  return EXTENSIONS[format].test(fileName) ? fileName : `${fileName}.${format}`;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), {
      once: true,
    });
    reader.addEventListener('error', () => reject(reader.error), {
      once: true,
    });
    reader.readAsDataURL(blob);
  });
}

/** Fetches an image URL and returns it as a data URI, or `null` when it cannot be fetched. */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = response.ok ? await response.blob() : null;
    return blob?.type.startsWith('image/') ? readBlobAsDataUrl(blob) : null;
  } catch {
    return null;
  }
}

/**
 * Copies the computed `fill` of every `part` element from the live SVG onto the
 * matching element of the clone as a presentation attribute, and strips the `part`
 * attributes. The clone renders identically outside the shadow root, where the
 * component stylesheet and its CSS custom properties are not available.
 *
 * `fill` is the only property the component theme sets on its parts; extend this
 * when `themes/shared/qr-code.common.scss` starts to style more.
 */
function resolveStyles(source: SVGSVGElement, clone: SVGSVGElement): void {
  const liveParts = source.querySelectorAll<SVGElement>('[part]');
  const cloneParts = clone.querySelectorAll<SVGElement>('[part]');

  for (const [index, element] of liveParts.entries()) {
    const target = cloneParts[index];
    const { fill } = getComputedStyle(element);

    if (fill) {
      target.setAttribute('fill', fill);
    }
    target.removeAttribute('part');
  }
}

/**
 * Replaces a non data-URI logo `href` with an inlined data URI. An SVG loaded as an image
 * cannot fetch external resources, so the logo must be embedded for the export to render it.
 *
 * When the logo cannot be fetched (for example, a cross-origin URL without CORS headers),
 * the logo, its mask and the mask definition are removed so the exported code has no hole.
 */
async function inlineLogo(clone: SVGSVGElement): Promise<void> {
  const image = clone.querySelector('image');
  const href = image?.getAttribute('href');

  if (!image || !href || href.startsWith('data:')) {
    return;
  }

  const dataUrl = await fetchImageAsDataUrl(href);

  if (dataUrl) {
    image.setAttribute('href', dataUrl);
  } else {
    image.remove();
    clone.querySelector('[mask]')?.removeAttribute('mask');
    clone.querySelector('defs')?.remove();
  }
}

/**
 * Creates a self-contained copy of the component SVG: theme colors are resolved
 * to presentation attributes and the logo is inlined as a data URI.
 */
export async function createSvgSnapshot(
  source: SVGSVGElement
): Promise<SVGSVGElement> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  resolveStyles(source, clone);
  await inlineLogo(clone);
  return clone;
}

/** Serializes an SVG element into an `image/svg+xml` blob. */
export function serializeSvg(svg: SVGSVGElement): Blob {
  const markup = new XMLSerializer().serializeToString(svg);
  return new Blob([markup], { type: `${MIME_TYPES.svg};charset=utf-8` });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error('Failed to load the QR code SVG for export.')),
      { once: true }
    );
    image.src = url;
  });
}

/**
 * Rasterize an SVG blob into a square bitmap of `dimension` pixels per side
 * and encodes it in the requested format.
 */
export async function rasterizeSvg(
  svgBlob: Blob,
  dimension: number,
  format: QrRasterFormat
): Promise<Blob> {
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = dimension;
    canvas.height = dimension;

    const context = canvas.getContext('2d')!;

    if (format === 'jpeg') {
      // JPEG has no alpha channel; paint white under transparent backgrounds.
      context.fillStyle = '#fff';
      context.fillRect(0, 0, dimension, dimension);
    }

    context.drawImage(image, 0, 0, dimension, dimension);

    const type = MIME_TYPES[format];
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type)
    );

    // Browsers that cannot encode a format silently fall back to PNG.
    if (!blob || blob.type !== type) {
      throw new Error(`The browser cannot encode ${type} images.`);
    }

    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Triggers the browser download dialog for the given file. */
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();

  // Revoke after the current task so the navigation has captured the URL.
  setTimeout(() => URL.revokeObjectURL(url));
}
