const DOT_COLOR = 'var(--igc-qr-dark, #000)';
const DOT_BACKGROUND = 'var(--igc-qr-background, #fff)';
const CORNER_SQUARE_COLOR = 'var(--qr-corner-square-fill, #000)';
const CORNER_DOT_COLOR = 'var(--qr-corner-dot-fill, #000)';

/**
 * Safe area ratios for different error correction levels in QR codes.
 * These values represent the maximum proportion of the QR code area that can be obscured (e.g., by a logo) while still maintaining scannability.
 *
 * - `L` (Low) allows for up to 2.25% of the area to be obscured.
 * - `M` (Medium) allows for up to 4% of the area to be obscured.
 * - `Q` (Quartile) allows for up to 6.25% of the area to be obscured.
 * - `H` (High) allows for up to 9% of the area to be obscured.
 */
const SAFE_AREAS = { L: 0.0225, M: 0.04, Q: 0.0625, H: 0.09 } as const;

/**
 * Maximum safe area for a logo in the QR code, based on the highest error correction level (H).
 * This means that if the logo covers more than 9% of the QR code area, it may not be scannable.
 */
const MAX_SAFE_AREA = SAFE_AREAS.H;

/**
 * Default size ratio for the logo relative to the QR code. This means that by default, the logo will occupy 40% of the QR code area.
 * This is a conservative default that allows for a reasonably sized logo while maintaining good scannability.
 */
const DEFAULT_SIZE_RATIO = 0.4;

export {
  CORNER_DOT_COLOR,
  CORNER_SQUARE_COLOR,
  DEFAULT_SIZE_RATIO,
  DOT_BACKGROUND,
  DOT_COLOR,
  MAX_SAFE_AREA,
  SAFE_AREAS,
};
