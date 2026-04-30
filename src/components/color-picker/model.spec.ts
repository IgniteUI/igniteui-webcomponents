import { expect } from '@open-wc/testing';

import { ColorModel } from './model.js';

describe('ColorModel', () => {
  describe('constructor and factory methods', () => {
    it('should create a default black color', () => {
      const color = ColorModel.default();

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
      expect(color.alpha).to.equal(1);
      expect(color.asString('hex')).to.equal('#000000');
    });

    it('should create a color from RGB values', () => {
      const color = new ColorModel([255, 0, 0]);

      expect(color.r).to.equal(255);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
      expect(color.alpha).to.equal(1);
    });

    it('should create a color with alpha channel', () => {
      const color = new ColorModel([255, 0, 0], 0.5);

      expect(color.r).to.equal(255);
      expect(color.alpha).to.equal(0.5);
    });

    it('should clamp alpha values to 0-1 range', () => {
      const colorNegative = new ColorModel([255, 0, 0], -0.5);
      const colorOverOne = new ColorModel([255, 0, 0], 1.5);

      expect(colorNegative.alpha).to.equal(0);
      expect(colorOverOne.alpha).to.equal(1);
    });
  });

  describe('parse', () => {
    it('should parse hex colors', () => {
      const color = ColorModel.parse('#ff0000');

      expect(color.r).to.equal(255);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
    });

    it('should parse hex colors with alpha', () => {
      const color = ColorModel.parse('#ff000080');

      expect(color.r).to.equal(255);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
      expect(color.alpha).to.be.closeTo(0.5, 0.01);
    });

    it('should parse rgb colors', () => {
      const color = ColorModel.parse('rgb(0, 255, 0)');

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(255);
      expect(color.b).to.equal(0);
    });

    it('should parse rgba colors', () => {
      const color = ColorModel.parse('rgba(0, 0, 255, 0.75)');

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(255);
      expect(color.alpha).to.equal(0.75);
    });

    it('should parse named colors', () => {
      const color = ColorModel.parse('red');

      expect(color.r).to.equal(255);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
    });

    it('should handle empty string', () => {
      const color = ColorModel.parse('');

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
      expect(color.alpha).to.equal(1);
    });
  });

  describe('RGB property setters', () => {
    it('should update red component', () => {
      const color = ColorModel.default();
      color.r = 128;

      expect(color.r).to.equal(128);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
    });

    it('should update green component', () => {
      const color = ColorModel.default();
      color.g = 128;

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(128);
      expect(color.b).to.equal(0);
    });

    it('should update blue component', () => {
      const color = ColorModel.default();
      color.b = 128;

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(128);
    });

    it('should clamp RGB values to 0-255 range', () => {
      const color = ColorModel.default();

      color.r = -10;
      expect(color.r).to.equal(0);

      color.r = 300;
      expect(color.r).to.equal(255);

      color.g = -5;
      expect(color.g).to.equal(0);

      color.g = 260;
      expect(color.g).to.equal(255);

      color.b = -1;
      expect(color.b).to.equal(0);

      color.b = 256;
      expect(color.b).to.equal(255);
    });

    it('should update HSL values when RGB changes', () => {
      const color = ColorModel.default();
      color.r = 255;

      expect(color.h).to.equal(0);
      expect(color.s).to.equal(100);
      expect(color.l).to.equal(50);
    });

    it('should update HSV values when RGB changes', () => {
      const color = ColorModel.default();
      color.r = 255;

      expect(color.h).to.equal(0);
      expect(color.s).to.equal(100);
      expect(color.v).to.equal(100);
    });
  });

  describe('HSL property setters', () => {
    it('should update hue', () => {
      const color = new ColorModel([255, 0, 0]);
      color.h = 120;

      expect(color.h).to.equal(120);
      expect(color.g).to.be.greaterThan(250);
    });

    it('should clamp hue to 0-360 range', () => {
      const color = ColorModel.default();

      color.h = -10;
      expect(color.h).to.equal(0);

      color.h = 400;
      expect(color.h).to.equal(360);
    });

    it('should update saturation', () => {
      const color = new ColorModel([255, 0, 0]);
      color.s = 50;

      expect(color.s).to.equal(50);
    });

    it('should clamp saturation to 0-100 range', () => {
      const color = new ColorModel([255, 0, 0]);

      color.s = -10;
      expect(color.s).to.equal(0);

      color.s = 150;
      expect(color.s).to.equal(100);
    });

    it('should update lightness', () => {
      const color = new ColorModel([255, 0, 0]);
      color.l = 25;

      expect(color.l).to.equal(25);
    });

    it('should clamp lightness to 0-100 range', () => {
      const color = new ColorModel([255, 0, 0]);

      color.l = -10;
      expect(color.l).to.equal(0);

      color.l = 150;
      expect(color.l).to.equal(100);
    });

    it('should update RGB when HSL changes', () => {
      const color = ColorModel.default();
      color.h = 120;
      color.s = 100;
      color.l = 50;

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(255);
      expect(color.b).to.equal(0);
    });
  });

  describe('HSV property setters', () => {
    it('should update value', () => {
      const color = new ColorModel([255, 0, 0]);
      color.v = 50;

      expect(color.v).to.equal(50);
    });

    it('should clamp value to 0-100 range', () => {
      const color = new ColorModel([255, 0, 0]);

      color.v = -10;
      expect(color.v).to.equal(0);

      color.v = 150;
      expect(color.v).to.equal(100);
    });

    it('should update RGB when value changes', () => {
      const color = new ColorModel([255, 0, 0]);
      const originalR = color.r;
      color.v = 50;

      expect(color.r).to.be.lessThan(originalR);
    });

    it('should update HSL when value changes', () => {
      const color = new ColorModel([255, 0, 0]);
      color.v = 50;

      expect(color.l).to.equal(25);
    });
  });

  describe('alpha property', () => {
    it('should get and set alpha', () => {
      const color = ColorModel.default();
      color.alpha = 0.3;

      expect(color.alpha).to.equal(0.3);
    });

    it('should clamp alpha to 0-1 range', () => {
      const color = ColorModel.default();

      color.alpha = -0.5;
      expect(color.alpha).to.equal(0);

      color.alpha = 1.5;
      expect(color.alpha).to.equal(1);
    });
  });

  describe('asString', () => {
    describe('hex format', () => {
      it('should output hex without alpha when alpha is 1', () => {
        const color = new ColorModel([255, 128, 64]);

        expect(color.asString('hex')).to.equal('#ff8040');
      });

      it('should output hex with alpha when alpha < 1', () => {
        const color = new ColorModel([255, 128, 64], 0.5);

        expect(color.asString('hex')).to.equal('#ff804080');
      });

      it('should force alpha output when requested', () => {
        const color = new ColorModel([255, 128, 64], 1);

        expect(color.asString('hex', true)).to.equal('#ff8040ff');
      });

      it('should handle black color', () => {
        const color = ColorModel.default();

        expect(color.asString('hex')).to.equal('#000000');
      });

      it('should handle white color', () => {
        const color = new ColorModel([255, 255, 255]);

        expect(color.asString('hex')).to.equal('#ffffff');
      });
    });

    describe('rgb format', () => {
      it('should output rgb without alpha when alpha is 1', () => {
        const color = new ColorModel([255, 128, 64]);

        expect(color.asString('rgb')).to.equal('rgb(255, 128, 64)');
      });

      it('should output rgba with alpha when alpha < 1', () => {
        const color = new ColorModel([255, 128, 64], 0.75);

        expect(color.asString('rgb')).to.equal('rgba(255, 128, 64, 0.75)');
      });

      it('should force alpha output when requested', () => {
        const color = new ColorModel([255, 128, 64], 1);

        expect(color.asString('rgb', true)).to.equal('rgba(255, 128, 64, 1)');
      });

      it('should round RGB values', () => {
        const color = new ColorModel([255.7, 128.3, 64.9]);

        expect(color.asString('rgb')).to.equal('rgb(256, 128, 65)');
      });
    });

    describe('hsl format', () => {
      it('should output hsl without alpha when alpha is 1', () => {
        const color = new ColorModel([255, 0, 0]);

        expect(color.asString('hsl')).to.equal('hsl(0, 100%, 50%)');
      });

      it('should output hsla with alpha when alpha < 1', () => {
        const color = new ColorModel([255, 0, 0], 0.5);

        expect(color.asString('hsl')).to.equal('hsla(0, 100%, 50%, 0.5)');
      });

      it('should force alpha output when requested', () => {
        const color = new ColorModel([255, 0, 0], 1);

        expect(color.asString('hsl', true)).to.equal('hsla(0, 100%, 50%, 1)');
      });

      it('should round HSL values', () => {
        const color = new ColorModel([128, 64, 32]);

        const hslString = color.asString('hsl');
        expect(hslString).to.match(/^hsl\(\d+, \d+%, \d+%\)$/);
      });
    });
  });

  describe('color space conversions', () => {
    it('should maintain color when converting between spaces', () => {
      const originalRGB: [number, number, number] = [128, 64, 192];
      const color = new ColorModel(originalRGB);

      const { h, s, v } = color;
      const newColor = ColorModel.default();
      newColor.h = h;
      newColor.s = s;
      newColor.v = v;

      expect(newColor.r).to.be.closeTo(originalRGB[0], 2);
      expect(newColor.g).to.be.closeTo(originalRGB[1], 2);
      expect(newColor.b).to.be.closeTo(originalRGB[2], 2);
    });

    it('should handle grayscale colors correctly', () => {
      const color = new ColorModel([128, 128, 128]);

      expect(color.s).to.equal(0);
      expect(color.l).to.be.closeTo(50, 1);
    });

    it('should handle pure colors correctly', () => {
      const red = new ColorModel([255, 0, 0]);
      expect(red.h).to.equal(0);
      expect(red.s).to.equal(100);
      expect(red.l).to.equal(50);

      const green = new ColorModel([0, 255, 0]);
      expect(green.h).to.equal(120);
      expect(green.s).to.equal(100);
      expect(green.l).to.equal(50);

      const blue = new ColorModel([0, 0, 255]);
      expect(blue.h).to.equal(240);
      expect(blue.s).to.equal(100);
      expect(blue.l).to.equal(50);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      const color = ColorModel.default();

      expect(color.r).to.equal(0);
      expect(color.g).to.equal(0);
      expect(color.b).to.equal(0);
      expect(color.h).to.equal(0);
      expect(color.s).to.equal(0);
      expect(color.l).to.equal(0);
      expect(color.v).to.equal(0);
    });

    it('should handle maximum values', () => {
      const color = new ColorModel([255, 255, 255]);

      expect(color.r).to.equal(255);
      expect(color.g).to.equal(255);
      expect(color.b).to.equal(255);
      expect(color.s).to.equal(0);
      expect(color.l).to.equal(100);
      expect(color.v).to.equal(100);
    });

    it('should handle repeated conversions without drift', () => {
      const color = new ColorModel([123, 45, 67], 0.8);

      const hex1 = color.asString('hex');
      const rgb1 = color.asString('rgb');
      const hsl1 = color.asString('hsl');

      // Simulate multiple conversions
      const { h, s, l } = color;
      color.h = h;
      color.s = s;
      color.l = l;

      const hex2 = color.asString('hex');
      const rgb2 = color.asString('rgb');
      const hsl2 = color.asString('hsl');

      expect(hex1).to.equal(hex2);
      expect(rgb1).to.equal(rgb2);
      expect(hsl1).to.equal(hsl2);
    });
  });

  describe('factory methods', () => {
    it('should create color from HSL values', () => {
      const color = ColorModel.fromHSL(120, 100, 50);

      expect(color.h).to.equal(120);
      expect(color.s).to.equal(100);
      expect(color.l).to.equal(50);
      expect(color.g).to.be.greaterThan(250);
    });

    it('should create color from HSL with alpha', () => {
      const color = ColorModel.fromHSL(240, 100, 50, 0.7);

      expect(color.h).to.equal(240);
      expect(color.alpha).to.equal(0.7);
    });

    it('should create color from HSV values', () => {
      const color = ColorModel.fromHSV(180, 100, 100);

      expect(color.h).to.equal(180);
      expect(color.s).to.be.greaterThan(99);
      expect(color.v).to.equal(100);
    });

    it('should create color from HSV with alpha', () => {
      const color = ColorModel.fromHSV(60, 50, 75, 0.3);

      expect(color.h).to.equal(60);
      expect(color.v).to.equal(75);
      expect(color.alpha).to.equal(0.3);
    });
  });

  describe('utility methods', () => {
    it('should clone a color', () => {
      const original = new ColorModel([128, 64, 192], 0.5);
      const clone = original.clone();

      expect(clone.r).to.equal(original.r);
      expect(clone.g).to.equal(original.g);
      expect(clone.b).to.equal(original.b);
      expect(clone.alpha).to.equal(original.alpha);

      // Verify it's a different instance
      clone.r = 200;
      expect(original.r).to.equal(128);
    });

    it('should compare colors for equality', () => {
      const color1 = new ColorModel([255, 128, 64], 0.8);
      const color2 = new ColorModel([255, 128, 64], 0.8);
      const color3 = new ColorModel([255, 128, 65], 0.8);
      const color4 = new ColorModel([255, 128, 64], 0.7);

      expect(color1.equals(color2)).to.be.true;
      expect(color1.equals(color3)).to.be.false;
      expect(color1.equals(color4)).to.be.false;
    });

    it('should export RGB values as tuple', () => {
      const color = new ColorModel([100, 150, 200]);
      const rgb = color.toRGB();

      expect(rgb).to.deep.equal([100, 150, 200]);
      expect(Array.isArray(rgb)).to.be.true;
      expect(rgb.length).to.equal(3);
    });

    it('should export HSL values as tuple', () => {
      const color = new ColorModel([255, 0, 0]);
      const hsl = color.toHSL();

      expect(hsl[0]).to.equal(0);
      expect(hsl[1]).to.equal(100);
      expect(hsl[2]).to.equal(50);
    });

    it('should export HSV values as tuple', () => {
      const color = new ColorModel([255, 0, 0]);
      const hsv = color.toHSV();

      expect(hsv[0]).to.equal(0);
      expect(hsv[1]).to.equal(100);
      expect(hsv[2]).to.equal(100);
    });

    it('should protect internal RGB from external mutations', () => {
      const originalRGB: [number, number, number] = [128, 64, 192];
      const color = new ColorModel(originalRGB);

      // Mutate the original array
      originalRGB[0] = 0;

      // Color should not be affected
      expect(color.r).to.equal(128);
    });
  });
});
