/**
 * The largest share of the code area that a logo can cover, per error correction level,
 * while the code stays scannable.
 */
const SAFE_AREAS = { L: 0.0225, M: 0.04, Q: 0.0625, H: 0.09 } as const;

/** The largest safe logo area, at level H. */
const MAX_SAFE_AREA = SAFE_AREAS.H;

/** The default logo size, as a ratio of `MAX_SAFE_AREA`. */
const DEFAULT_SIZE_RATIO = 0.4;

export { DEFAULT_SIZE_RATIO, MAX_SAFE_AREA, SAFE_AREAS };
