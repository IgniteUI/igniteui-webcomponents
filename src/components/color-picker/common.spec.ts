import { expect } from '@open-wc/testing';

import { type ParsedColor, parseColor } from './common.js';

function makeTestContext() {
  try {
    return new OffscreenCanvas(0, 0).getContext('2d');
  } catch {
    return null;
  }
}

describe('parseColor', () => {
  let ctx: OffscreenCanvasRenderingContext2D | null;

  before(() => {
    ctx = makeTestContext();
  });

  describe('null context handling', () => {
    it('should return default color when context is null', () => {
      const result = parseColor('#ff0000', null);

      expect(result.value).to.deep.equal([0, 0, 0]);
      expect(result.alpha).to.equal(1);
    });

    it('should return default color when color string is empty', () => {
      const result = parseColor('', ctx);

      expect(result.value).to.deep.equal([0, 0, 0]);
      expect(result.alpha).to.equal(1);
    });
  });

  describe('hex color parsing', () => {
    it('should parse 6-digit hex colors', () => {
      const result = parseColor('#ff8040', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse 3-digit hex colors', () => {
      const result = parseColor('#f80', ctx);

      expect(result.value[0]).to.equal(255);
      expect(result.value[1]).to.equal(136);
      expect(result.value[2]).to.equal(0);
      expect(result.alpha).to.equal(1);
    });

    it('should parse 8-digit hex colors with alpha', () => {
      const result = parseColor('#ff804080', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.be.closeTo(0.5, 0.01);
    });

    it('should parse hex colors without hash', () => {
      const result = parseColor('ff8040', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      // Note: Canvas may add alpha channel for some hex formats
      expect(result.alpha).to.be.oneOf([0.5, 1]);
    });
  });

  describe('rgb/rgba color parsing', () => {
    it('should parse rgb colors', () => {
      const result = parseColor('rgb(255, 128, 64)', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse rgba colors with alpha', () => {
      const result = parseColor('rgba(255, 128, 64, 0.75)', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.equal(0.75);
    });

    it('should parse rgb with spaces', () => {
      const result = parseColor('rgb(  255  ,  128  ,  64  )', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse rgba with zero alpha', () => {
      const result = parseColor('rgba(255, 128, 64, 0)', ctx);

      expect(result.value).to.deep.equal([255, 128, 64]);
      expect(result.alpha).to.equal(0);
    });
  });

  describe('named color parsing', () => {
    it('should parse red', () => {
      const result = parseColor('red', ctx);

      expect(result.value).to.deep.equal([255, 0, 0]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse white', () => {
      const result = parseColor('white', ctx);

      expect(result.value).to.deep.equal([255, 255, 255]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse black', () => {
      const result = parseColor('black', ctx);

      expect(result.value).to.deep.equal([0, 0, 0]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse transparent', () => {
      const result = parseColor('transparent', ctx);

      expect(result.value).to.deep.equal([0, 0, 0]);
      expect(result.alpha).to.equal(0);
    });
  });

  describe('hsl/hsla color parsing', () => {
    it('should parse hsl colors', () => {
      const result = parseColor('hsl(0, 100%, 50%)', ctx);

      expect(result.value).to.deep.equal([255, 0, 0]);
      expect(result.alpha).to.equal(1);
    });

    it('should parse hsla colors with alpha', () => {
      const result = parseColor('hsla(120, 100%, 50%, 0.5)', ctx);

      expect(result.value).to.deep.equal([0, 255, 0]);
      expect(result.alpha).to.equal(0.5);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid color strings gracefully', () => {
      // Invalid colors don't reset fillStyle, so result depends on previous state
      // Just verify it doesn't throw and returns a valid structure
      const result = parseColor('not-a-color', ctx);

      expect(result).to.have.property('value');
      expect(result).to.have.property('alpha');
      expect(Array.isArray(result.value)).to.be.true;
    });

    it('should handle malformed hex colors gracefully', () => {
      // Malformed hex colors behave like invalid colors
      const result = parseColor('#zzz', ctx);

      expect(result).to.have.property('value');
      expect(result).to.have.property('alpha');
      expect(Array.isArray(result.value)).to.be.true;
    });

    it('should return correct type', () => {
      const result: ParsedColor = parseColor('#ff0000', ctx);

      expect(result).to.have.property('value');
      expect(result).to.have.property('alpha');
      expect(Array.isArray(result.value)).to.be.true;
      expect(result.value.length).to.equal(3);
    });
  });
});
