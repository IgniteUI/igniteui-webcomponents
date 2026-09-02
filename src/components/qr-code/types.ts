/** Shape of individual data modules in the QR code body. */
export type QrDotStyle = 'square' | 'circle' | 'rounded';

/** Shape of the inner dot inside each finder-pattern corner. */
export type QrCornerDotStyle = 'square' | 'circle' | 'rounded';

/** Shape of the outer square of each finder-pattern corner. */
export type QrCornerSquareStyle = 'square' | 'circle' | 'rounded';

/**
 * QR error correction level. Higher levels recover more data but reduce capacity.
 * - `L` ~7%, `M` ~15%, `Q` ~25%, `H` ~30%.
 */
export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * QR data encoding mode, selected automatically based on the input string.
 * - `numeric` - digits only; `alphanumeric` - digits + uppercase letters + a few symbols; `byte` - arbitrary UTF-8.
 */
export type QrEncodingMode = 'numeric' | 'alphanumeric' | 'byte';

/** Output format of an exported QR code. */
export type QrCodeExportFormat = 'svg' | 'png' | 'jpeg' | 'webp';

/** Options for exporting the QR code to a file. */
export interface QrCodeExportOptions {
  /**
   * The name of the exported file. The extension of the format is appended when the name does not end with it.
   * @default 'qr-code'
   */
  fileName?: string;
  /**
   * The output format.
   * @default 'png'
   */
  format?: QrCodeExportFormat;
  /**
   * Multiplier applied to the `size` of the component. A 256px QR code with a `scale` of 2 exports as a 512x512 image.
   * For `svg`, the multiplier applies to the `width` and `height` attributes while the `viewBox` is unchanged.
   * @default 1
   */
  scale?: number;
  /**
   * Whether to open the browser download dialog for the exported file.
   * @default false
   */
  download?: boolean;
}
