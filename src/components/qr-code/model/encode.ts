import type { QrEncodingMode, QrErrorCorrectionLevel } from '../types.js';
import { getDataCodewordsCount, interleaveBlocks } from './error-correction.js';

const EC_LEVEL_INDEX = { L: 0, M: 1, Q: 2, H: 3 } as const;
const ALPHANUMERIC_MAP = new Map<string, number>(
  [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'].map((char, index) => [
    char,
    index,
  ])
);
const PAD_BYTES = [0xec, 0x11];
const TEXT_ENCODER = new TextEncoder();

function getAlphanumericValue(char: string): number {
  return ALPHANUMERIC_MAP.get(char) ?? -1;
}

function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

function isAlphanumeric(str: string): boolean {
  for (const char of str) {
    if (!ALPHANUMERIC_MAP.has(char)) {
      return false;
    }
  }
  return true;
}

function detectEncodingMode(data: string): QrEncodingMode {
  if (isNumeric(data)) return 'numeric';
  if (isAlphanumeric(data)) return 'alphanumeric';
  return 'byte';
}

function getCharacterCountBits(mode: QrEncodingMode, version: number): number {
  switch (mode) {
    case 'numeric':
      return version < 10 ? 10 : version < 27 ? 12 : 14;
    case 'alphanumeric':
      return version < 10 ? 9 : version < 27 ? 11 : 13;
    case 'byte':
      return version < 10 ? 8 : version < 27 ? 16 : 16;
    default:
      throw new Error(`Unsupported encoding mode: ${mode}`);
  }
}

const MODE_INDICATORS: Record<QrEncodingMode, number> = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100,
};

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >> i) & 1);
  }
}

function encodeData(
  data: string,
  mode: QrEncodingMode,
  version: number
): number[] {
  const bits: number[] = [];
  const byteEncoded = mode === 'byte' ? TEXT_ENCODER.encode(data) : null;

  pushBits(bits, MODE_INDICATORS[mode], 4);

  const charCount = byteEncoded ? byteEncoded.length : data.length;
  pushBits(bits, charCount, getCharacterCountBits(mode, version));

  switch (mode) {
    case 'numeric':
      for (let i = 0; i < data.length; i += 3) {
        const chunk = data.slice(i, i + 3);
        const value = Number.parseInt(chunk, 10);

        if (chunk.length === 3) pushBits(bits, value, 10);
        else if (chunk.length === 2) pushBits(bits, value, 7);
        else pushBits(bits, value, 4);
      }
      break;
    case 'alphanumeric':
      for (let i = 0; i < data.length; i += 2) {
        if (i + 1 < data.length) {
          const value =
            getAlphanumericValue(data[i]) * 45 +
            getAlphanumericValue(data[i + 1]);
          pushBits(bits, value, 11);
        } else {
          pushBits(bits, getAlphanumericValue(data[i]), 6);
        }
      }
      break;
    default:
      for (const byte of byteEncoded!) {
        pushBits(bits, byte, 8);
      }
      break;
  }

  return bits;
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

  if (result.length > totalBytes) {
    throw new Error(
      'Data exceeds maximum capacity for this version and error correction level'
    );
  }

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
  /** Encoding mode that was applied to the input string. */
  mode: QrEncodingMode;
  /** QR version (1–40) used for this code. */
  version: number;
  /** Numeric index of the error correction level (L=0, M=1, Q=2, H=3). */
  ecLevelIndex: number;
};

/**
 * Encodes a string into QR codewords (data + error correction), selecting the
 * smallest version that fits unless `requestedVersion` is specified.
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

  const ecIndex = EC_LEVEL_INDEX[ecLevel];
  const mode = detectEncodingMode(data);

  let version = 1;
  let bits: number[];

  if (requestedVersion != null) {
    if (requestedVersion < 1 || requestedVersion > 40) {
      throw new Error('Requested version must be between 1 and 40');
    }
    version = requestedVersion;
    bits = encodeData(data, mode, version);
    if (
      Math.ceil((bits.length + 4) / 8) > getDataCodewordsCount(version, ecIndex)
    ) {
      throw new Error(
        `Data too long for version ${version} and error correction level ${ecLevel}`
      );
    }
  } else {
    bits = [];
    for (let v = 1; v <= 40; v++) {
      const candidateBits = encodeData(data, mode, v);
      if (
        Math.ceil((candidateBits.length + 4) / 8) <=
        getDataCodewordsCount(v, ecIndex)
      ) {
        version = v;
        bits = candidateBits;
        break;
      }
    }
  }

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
    mode,
    version,
    ecLevelIndex: ecIndex,
  };
}
