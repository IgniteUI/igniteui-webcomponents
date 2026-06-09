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
 * - `numeric` — digits only; `alphanumeric` — digits + uppercase letters + a few symbols; `byte` — arbitrary UTF-8.
 */
export type QrEncodingMode = 'numeric' | 'alphanumeric' | 'byte';
