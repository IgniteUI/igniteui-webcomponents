import { expect } from '@open-wc/testing';

import {
  type ColorNameParts,
  colorNameParts,
  formatOklchAreaValue,
  pureHueWord,
} from './color-name.js';
import type { RGB } from './converters.js';
import { type ColorPickerStrings, colorPickerI18nConfig } from './i18n.js';
import { ColorModel } from './model.js';

function hex(value: string): RGB {
  return ColorModel.parse(value).toRGB();
}

function words({ lightness, chroma, hue }: ColorNameParts): string {
  return [lightness, chroma, hue].filter(Boolean).join(' ');
}

describe('Color names', () => {
  it('names the colors with no hue by lightness', () => {
    const names = [
      '#000000',
      '#222222',
      '#696969',
      '#808080',
      '#c0c0c0',
      '#dcdcdc',
      '#ffffff',
    ].map((color) => words(colorNameParts(hex(color))));

    expect(names).to.eql([
      'black',
      'very_dark gray',
      'dark gray',
      'gray',
      'light gray',
      'very_light gray',
      'white',
    ]);
  });

  it('gives the pure colors no lightness word', () => {
    const names = [
      '#ff0000',
      '#ffff00',
      '#00ff00',
      '#00ffff',
      '#0000ff',
      '#ff00ff',
    ].map((color) => words(colorNameParts(hex(color))));

    expect(names).to.eql([
      'vibrant red',
      'vibrant yellow',
      'vibrant green',
      'vibrant cyan',
      'vibrant blue',
      'vibrant magenta',
    ]);
  });

  it('compares the lightness with the most chromatic color of the hue', () => {
    // Pure yellow is far lighter than pure blue, and neither is "light".
    expect(words(colorNameParts(hex('#000080')))).to.equal('dark blue');
    expect(words(colorNameParts(hex('#0000aa')))).to.equal('dark vibrant blue');
    expect(words(colorNameParts(hex('#808000')))).to.equal('dark yellow');
    expect(words(colorNameParts(hex('#6495ed')))).to.equal('light blue');
    expect(words(colorNameParts(hex('#e6e6fa')))).to.equal('very_light blue');
  });

  it('names a color with little chroma grayish', () => {
    expect(words(colorNameParts(hex('#708090')))).to.equal('grayish blue');
    expect(words(colorNameParts(hex('#8fbc8f')))).to.equal('grayish green');
  });

  it('names a dark orange brown and a very light red pink', () => {
    expect(words(colorNameParts(hex('#d2691e')))).to.equal('brown');
    expect(words(colorNameParts(hex('#8b4513')))).to.equal('dark brown');
    expect(words(colorNameParts(hex('#ffa500')))).to.equal('vibrant orange');
    expect(words(colorNameParts(hex('#ffe4e1')))).to.equal('very_light pink');
    expect(words(colorNameParts(hex('#ff69b4')))).to.equal('vibrant pink');
  });

  it('names the hue of the pure color of an HSV hue', () => {
    const hues = [0, 30, 60, 90, 120, 180, 210, 240, 270, 300, 330, 360];

    expect(hues.map(pureHueWord)).to.eql([
      'red',
      'orange',
      'yellow',
      'yellow_green',
      'green',
      'cyan',
      'blue',
      'blue',
      'purple',
      'magenta',
      'pink',
      'red',
    ]);
  });
});

describe('OKLCH area value text', () => {
  const resourceStrings = colorPickerI18nConfig.defaultEN as ColorPickerStrings;

  it('gives the lightness and the chroma in the number format of the locale', () => {
    expect(
      formatOklchAreaValue(70.4, 0.32162, { resourceStrings, locale: 'en' })
    ).to.equal('Lightness 70%, chroma 0.322');
    expect(
      formatOklchAreaValue(70.4, 0.32162, { resourceStrings, locale: 'ar-EG' })
    ).to.equal('Lightness ٧٠%, chroma ٠٫٣٢٢');
  });
});
