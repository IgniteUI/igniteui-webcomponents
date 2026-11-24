import { expect } from '@open-wc/testing';

import { roundPrecise } from '#internals/utils/math.js';
import { converter, type RGB } from './converters.js';
import {
  cusp,
  cuspHsvHue,
  gamutChroma,
  gamutRuns,
  isAchromatic,
  OKLCH_AREA_CHROMA,
  oklchHueTrack,
  paintOklchArea,
  pureHueOklch,
} from './oklch.js';

const BLUE = converter.rgb.oklch([0, 0, 255]);

function round(values: readonly (readonly number[])[], digits = 4) {
  return values.map((run) => run.map((value) => roundPrecise(value, digits)));
}

describe('OKLCH gamut', () => {
  it('gives one range from gray to the gamut edge for most rows', () => {
    const red = converter.rgb.oklch([255, 0, 0]);

    expect(round(gamutRuns(red[0], red[2]))).to.eql([[0, 0.2577]]);
    expect(round(gamutRuns(50, 140))).to.eql([[0, 0.161]]);
  });

  it('gives the black-to-blue edge as a spike apart from the rest', () => {
    const [lightness, chroma, hue] = BLUE;
    const runs = gamutRuns(lightness, hue);

    expect(runs).to.have.length(2);
    expect(runs[1][0]).to.be.closeTo(chroma, 1e-6);
    expect(runs[1][1]).to.be.closeTo(chroma, 1e-6);
  });

  it('gives only a gray at black and at white', () => {
    for (const lightness of [0, 100]) {
      const runs = gamutRuns(lightness, 120);

      expect(runs).to.have.length(1);
      expect(runs[0][0]).to.equal(0);
      expect(runs[0][1]).to.be.below(1e-6);
    }
  });

  it('keeps a chroma in the gamut, and cuts one beyond it back to the nearest range below', () => {
    const [lightness, chroma, hue] = BLUE;
    const [[, bodyEnd]] = gamutRuns(lightness, hue);

    expect(gamutChroma([50, 0.1, 140])).to.equal(0.1);
    expect(gamutChroma([50, 0.3, 140])).to.be.closeTo(0.161, 1e-3);
    // Between the body and the spike, and past the spike.
    expect(gamutChroma([lightness, chroma - 0.01, hue])).to.equal(bodyEnd);
    expect(gamutChroma([lightness, 0.33, hue])).to.be.closeTo(chroma, 1e-6);
    expect(gamutChroma([lightness, chroma, hue])).to.equal(chroma);
  });

  it('keeps every 8-bit primary and secondary color', () => {
    const colors: RGB[] = [
      [255, 0, 0],
      [255, 255, 0],
      [0, 255, 0],
      [0, 255, 255],
      [0, 0, 255],
      [255, 0, 255],
      [0, 0, 128],
    ];

    for (const rgb of colors) {
      const [l, c, h] = converter.rgb.oklch(rgb);
      expect(gamutChroma([l, c, h]), `${rgb}`).to.be.closeTo(c, 1e-9);
    }
  });

  it('treats a chroma that rounds to 0 at 5 decimals as a gray', () => {
    expect(isAchromatic(0.000004)).to.be.true;
    expect(isAchromatic(0.00001)).to.be.false;
  });
});

describe('OKLCH cusps', () => {
  it('maps an OKLCH hue to the HSV hue of its cusp and back', () => {
    for (const hsvHue of [0, 60, 120, 200, 300]) {
      const oklchHue = pureHueOklch(hsvHue)[2];
      expect(cuspHsvHue(oklchHue)).to.be.closeTo(hsvHue, 1e-4);
    }
  });

  it('gives the most chromatic sRGB color of a hue', () => {
    const cyan = pureHueOklch(200);
    const [lightness, chroma] = cusp(cyan[2]);

    // The cache holds half degrees.
    expect(lightness).to.be.closeTo(cyan[0], 0.5);
    expect(chroma).to.be.closeTo(cyan[1], 5e-3);
  });

  it('builds the hue slider track from 37 cusp colors in the slider direction', () => {
    const track = oklchHueTrack();

    expect(track).to.match(
      /^linear-gradient\(var\(--_slider-track-direction\), rgb\([^)]+\) var\(--_slider-track-inset\), /
    );
    expect(track).to.match(
      /, rgb\([^)]+\) calc\(100% - var\(--_slider-track-inset\)\)\)$/
    );
    expect(track.match(/rgb\(/g)).to.have.length(37);
  });
});

describe('OKLCH area paint', () => {
  const width = 100;
  const height = 80;

  function paint(hue: number): ImageData {
    const image = new ImageData(width, height);
    paintOklchArea(image, hue);
    return image;
  }

  /** The row of a lightness: the lightness at its center, and its pixels. */
  function rowAt(image: ImageData, y: number) {
    const lightness = (1 - (y + 0.5) / height) * 100;
    const pixels = Array.from({ length: width }, (_, x) =>
      Array.from(image.data.slice((y * width + x) * 4, (y * width + x + 1) * 4))
    );

    return { lightness, pixels };
  }

  /** The pixel of a row at a chroma. */
  function at(pixels: number[][], chroma: number): number[] {
    return pixels[Math.floor((chroma / OKLCH_AREA_CHROMA) * width)];
  }

  it('paints the gamut and leaves the rest transparent', () => {
    const { pixels } = rowAt(paint(140), 40);
    const [r, g, b, a] = pixels[0];

    expect(at(pixels, 0.05)[3]).to.equal(255);
    expect(at(pixels, 0.3)[3]).to.equal(0);
    // A gray at the left edge.
    expect(a).to.equal(255);
    expect(Math.max(r, g, b) - Math.min(r, g, b)).to.be.at.most(2);
  });

  it('gives the pixels at the gamut edge a share of the alpha', () => {
    const { lightness, pixels } = rowAt(paint(140), 40);
    const [[, end]] = gamutRuns(lightness, 140);
    const alphas = pixels.map(([, , , a]) => a);
    const edge = Math.floor((end / OKLCH_AREA_CHROMA) * width);

    expect(alphas.slice(0, edge - 1).every((a) => a === 255)).to.be.true;
    expect(alphas.slice(edge + 2).every((a) => a === 0)).to.be.true;
    expect(alphas.some((a) => a > 0 && a < 255)).to.be.true;
  });

  it('paints the blue spike as a line apart from the rest of the row', () => {
    const hue = BLUE[2];
    const { lightness, pixels } = rowAt(paint(hue), 50);
    const [[, bodyEnd], [spike]] = gamutRuns(lightness, hue);

    expect(at(pixels, spike)[3]).to.be.above(127);
    expect(at(pixels, (bodyEnd + spike) / 2)[3]).to.equal(0);
  });
});
