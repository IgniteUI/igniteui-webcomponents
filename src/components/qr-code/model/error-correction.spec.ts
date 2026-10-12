import { expect } from '@open-wc/testing';
import { EC_BLOCKS_FIXTURE } from '#internals/testing/qr-ec-blocks.spec.js';
import { EC_BLOCKS_TABLE, getDataCodewordsCount } from './error-correction.js';
import { getFormatInfo, getVersionInfo } from './matrix.js';

describe('QR error correction blocks', () => {
  it('derives the block table of ISO/IEC 18004 for every version and level', () => {
    expect(EC_BLOCKS_TABLE).to.deep.equal(EC_BLOCKS_FIXTURE);
  });

  it('counts the data codewords of every version and level', () => {
    for (const [index, levels] of EC_BLOCKS_FIXTURE.entries()) {
      for (const [level, { groups }] of levels.entries()) {
        const expected = groups.reduce(
          (sum, group) => sum + group.numBlocks * group.dataCW,
          0
        );

        expect(getDataCodewordsCount(index + 1, level)).to.equal(expected);
      }
    }
  });
});

describe('QR format and version information', () => {
  // ISO/IEC 18004, tables C.1 and D.1.
  const FORMAT_INFO = [
    [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976], // L
    [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0], // M
    [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed], // Q
    [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b], // H
  ];
  const VERSION_INFO = [
    0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d,
    0x0f928, 0x10b78, 0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9,
    0x177ec, 0x18ec4, 0x191e1, 0x1afab, 0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75,
    0x1f250, 0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b, 0x2542e, 0x26a64,
    0x27541, 0x28c69,
  ];

  it('encodes the format information of every level and mask', () => {
    for (const [level, masks] of FORMAT_INFO.entries()) {
      for (const [mask, bits] of masks.entries()) {
        expect(getFormatInfo(level, mask)).to.equal(bits);
      }
    }
  });

  it('encodes the version information of versions 7 to 40', () => {
    for (const [index, bits] of VERSION_INFO.entries()) {
      expect(getVersionInfo(index + 7)).to.equal(bits);
    }
  });
});
