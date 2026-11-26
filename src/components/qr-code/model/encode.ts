import { numberInRangeInclusive } from '#internals/utils/math.js';
import type { QrEncodingMode, QrErrorCorrectionLevel } from '../types.js';
import { getDataCodewordsCount, interleaveBlocks } from './error-correction.js';

export const EC_LEVEL_INDEX = { L: 0, M: 1, Q: 2, H: 3 } as const;
const ALPHANUMERIC_MAP = new Map<string, number>(
  [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'].map((char, index) => [
    char,
    index,
  ])
);
const PAD_BYTES = [0xec, 0x11];
const TEXT_ENCODER = new TextEncoder();

type Mode = {
  name: QrEncodingMode;
  indicator: number;
  /** The count field widths for versions 1-9, 10-26 and 27-40. */
  countBits: readonly number[];
  /** The cost of `char` in sixths of a bit (10/3 and 11/2 are whole), or `Infinity`. */
  cost(char: string): number;
  /** Writes the count field of `text`, `width` bits wide, and its data. */
  write(bits: number[], text: string, width: number): void;
};

/** Each mode encodes all the characters of the modes before it. */
const MODES: readonly Mode[] = [
  {
    name: 'numeric',
    indicator: 0b0001,
    countBits: [10, 12, 14],
    cost: (char) =>
      char >= '0' && char <= '9' ? 20 : Number.POSITIVE_INFINITY,
    write(bits, text, width) {
      pushBits(bits, text.length, width);
      for (let i = 0; i < text.length; i += 3) {
        const chunk = text.slice(i, i + 3);
        pushBits(bits, Number.parseInt(chunk, 10), chunk.length * 3 + 1);
      }
    },
  },
  {
    name: 'alphanumeric',
    indicator: 0b0010,
    countBits: [9, 11, 13],
    cost: (char) =>
      ALPHANUMERIC_MAP.has(char) ? 33 : Number.POSITIVE_INFINITY,
    write(bits, text, width) {
      pushBits(bits, text.length, width);
      for (let i = 0; i < text.length; i += 2) {
        const value = ALPHANUMERIC_MAP.get(text[i])!;

        if (i + 1 < text.length) {
          pushBits(bits, value * 45 + ALPHANUMERIC_MAP.get(text[i + 1])!, 11);
        } else {
          pushBits(bits, value, 6);
        }
      }
    },
  },
  {
    name: 'byte',
    indicator: 0b0100,
    countBits: [8, 16, 16],
    cost(char) {
      // The UTF-8 length; `TextEncoder` writes a lone surrogate as 3 bytes.
      const code = char.codePointAt(0)!;
      return 48 * (code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4);
    },
    write(bits, text, width) {
      const bytes = TEXT_ENCODER.encode(text);
      pushBits(bits, bytes.length, width);
      for (const byte of bytes) {
        pushBits(bits, byte, 8);
      }
    },
  },
];

/** The last version of each count field group. */
const GROUP_LAST_VERSIONS = [9, 26, 40];

/** A run of characters in one mode, by its index in `MODES`. */
type Segment = { mode: number; text: string };

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >> i) & 1);
  }
}

/** The bits of the mode indicator and the count field of a segment in `mode`. */
function getHeaderBits(mode: Mode, group: number): number {
  return 4 + mode.countBits[group];
}

function getSegmentBits({ mode, text }: Segment, group: number): number {
  let cost = 0;
  for (const char of text) {
    cost += MODES[mode].cost(char);
  }
  return getHeaderBits(MODES[mode], group) + Math.ceil(cost / 6);
}

/** Returns the wider of two modes. `MODES` goes from the narrowest character set to the widest. */
function widerMode(a: number, b: number): number {
  return Math.max(a, b);
}

/**
 * Splits `chars` into the segments with the fewest bits for the count fields of `group`, by a
 * shortest path over the characters. Then neighbors merge when that costs no bits.
 */
function splitSegments(chars: string[], group: number): Segment[] {
  const modeCount = MODES.length;
  const headers = MODES.map((mode) => getHeaderBits(mode, group) * 6);
  // The cheapest path whose next character is in each mode.
  const costs = headers.slice();
  const stayCosts = headers.map(() => 0);
  // At `i * modeCount + m`, the mode of character `i` on the path in `costs[m]`.
  const steps = new Int8Array(chars.length * modeCount);

  for (let i = 0; i < chars.length; i++) {
    for (let m = 0; m < modeCount; m++) {
      stayCosts[m] = costs[m] + MODES[m].cost(chars[i]);
    }

    for (let to = 0; to < modeCount; to++) {
      costs[to] = stayCosts[to];
      steps[i * modeCount + to] = to;

      for (let from = 0; from < modeCount; from++) {
        // A segment ends on a whole bit.
        const switched = Math.ceil(stayCosts[from] / 6) * 6 + headers[to];
        if (switched < costs[to]) {
          costs[to] = switched;
          steps[i * modeCount + to] = from;
        }
      }
    }
  }

  const modes = new Int8Array(chars.length);
  let mode = costs.indexOf(Math.min(...costs));

  for (let i = chars.length - 1; i >= 0; i--) {
    mode = steps[i * modeCount + mode];
    modes[i] = mode;
  }

  const segments: Segment[] = [];

  for (let start = 0, end = 1; end <= chars.length; end++) {
    if (end < chars.length && modes[end] === modes[start]) continue;

    let segment: Segment = {
      mode: modes[start],
      text: chars.slice(start, end).join(''),
    };
    start = end;

    while (segments.length > 0) {
      const last = segments.at(-1)!;
      const merged: Segment = {
        mode: widerMode(last.mode, segment.mode),
        text: last.text + segment.text,
      };

      if (
        getSegmentBits(merged, group) >
        getSegmentBits(last, group) + getSegmentBits(segment, group)
      ) {
        break;
      }

      segments.pop();
      segment = merged;
    }

    segments.push(segment);
  }

  return segments;
}

function encodeSegments(segments: Segment[], group: number): number[] {
  const bits: number[] = [];

  for (const { mode, text } of segments) {
    pushBits(bits, MODES[mode].indicator, 4);
    MODES[mode].write(bits, text, MODES[mode].countBits[group]);
  }

  return bits;
}

/**
 * Returns the smallest version from `first` to `last` that holds `chars`, with the segments
 * and the bits for it, or `null`.
 */
function fitVersion(
  chars: string[],
  ecIndex: number,
  first: number,
  last: number
): { version: number; segments: Segment[]; bits: number[] } | null {
  for (const [group, groupLast] of GROUP_LAST_VERSIONS.entries()) {
    const start = Math.max(first, (GROUP_LAST_VERSIONS[group - 1] ?? 0) + 1);
    const end = Math.min(last, groupLast);

    // Skip a group too small even for all-digit data.
    if (
      start > end ||
      chars.length * 10 > getDataCodewordsCount(end, ecIndex) * 24
    ) {
      continue;
    }

    const segments = splitSegments(chars, group);
    const bits = encodeSegments(segments, group);

    // Only the segments must fit: the terminator may shrink (ISO/IEC 18004).
    for (let version = start; version <= end; version++) {
      if (bits.length <= getDataCodewordsCount(version, ecIndex) * 8) {
        return { version, segments, bits };
      }
    }
  }

  return null;
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }
  return bytes;
}

function padData(data: number[], totalBytes: number): number[] {
  const result = data.slice();
  let padIndex = 0;
  while (result.length < totalBytes) {
    result.push(PAD_BYTES[padIndex % 2]);
    padIndex++;
  }
  return result;
}

/** Result produced by `encodeQR`. */
export type EncodeResult = {
  /** Interleaved data + ECC codewords ready for matrix placement. */
  codewords: number[];
  /** The mode of the single segment of the data, or `'mixed'`. */
  mode: QrEncodingMode | 'mixed';
  /** The length of the segments in bits, without the terminator and the padding. */
  dataBits: number;
  /** QR version (1–40) used for this code. */
  version: number;
  /** Numeric index of the error correction level (L=0, M=1, Q=2, H=3). */
  ecLevelIndex: number;
};

/** Whether `version` is a QR code version: an integer from 1 to 40. */
export function isValidVersion(version: unknown): version is number {
  return (
    Number.isInteger(version) &&
    numberInRangeInclusive(version as number, 1, 40)
  );
}

/**
 * Encodes a string into QR codewords (data + error correction), selecting the
 * smallest version that fits unless `requestedVersion` is specified. The data is split
 * into the numeric, alphanumeric and byte segments with the fewest bits.
 *
 * @throws When `data` is empty, the requested version is out of range, or the
 * data exceeds the capacity of the requested version.
 */
export function encodeQR(
  data: string,
  ecLevel: QrErrorCorrectionLevel = 'M',
  requestedVersion?: number
): EncodeResult {
  if (data.length === 0) {
    throw new Error('Data cannot be empty');
  }
  if (requestedVersion != null && !isValidVersion(requestedVersion)) {
    throw new Error('Requested version must be an integer between 1 and 40');
  }

  const ecIndex = EC_LEVEL_INDEX[ecLevel];
  const fit = fitVersion(
    Array.from(data),
    ecIndex,
    requestedVersion ?? 1,
    requestedVersion ?? 40
  );

  if (!fit) {
    throw new Error(
      requestedVersion == null
        ? `Data too long to fit in any QR version (1-40) at error correction level '${ecLevel}'`
        : `Data too long for version ${requestedVersion} and error correction level ${ecLevel}`
    );
  }

  const { version, segments, bits } = fit;
  const dataBits = bits.length;
  const capacity = getDataCodewordsCount(version, ecIndex);

  const maxBits = capacity * 8;
  const terminatorLength = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < terminatorLength; i++) {
    bits.push(0);
  }

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const dataBytes = bitsToBytes(bits);
  const paddedData = padData(dataBytes, capacity);
  const codewords = interleaveBlocks(paddedData, version, ecIndex);

  return {
    codewords,
    mode: segments.length === 1 ? MODES[segments[0].mode].name : 'mixed',
    dataBits,
    version,
    ecLevelIndex: ecIndex,
  };
}
