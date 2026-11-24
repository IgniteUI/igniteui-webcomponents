import { expect } from '@open-wc/testing';

import { contrastRatio, formatContrastRatio } from './contrast.js';
import { type ColorPickerStrings, colorPickerI18nConfig } from './i18n.js';
import { ColorModel } from './model.js';

const resourceStrings = colorPickerI18nConfig.defaultEN as ColorPickerStrings;

function ratio(color: string, background: string): number {
  return contrastRatio(ColorModel.parse(color), ColorModel.parse(background));
}

describe('Contrast ratio', () => {
  it('gives the WCAG 2 ratio of two opaque colors', () => {
    expect(ratio('#000', '#fff')).to.be.closeTo(21, 1e-9);
    expect(ratio('#808080', '#808080')).to.equal(1);
    expect(ratio('#767676', '#fff')).to.be.closeTo(4.5422, 1e-4);
    expect(ratio('#777777', '#fff')).to.be.closeTo(4.4781, 1e-4);
    expect(ratio('#595959', '#fff')).to.be.closeTo(7.0047, 1e-4);
  });

  it('puts the color over the background with its alpha', () => {
    // Half black over white is #808080 with a channel of 127.5.
    expect(ratio('rgb(0 0 0 / 0.5)', '#fff')).to.be.closeTo(3.9767, 1e-4);
    expect(ratio('rgb(0 0 0 / 0)', '#fff')).to.equal(1);
  });

  it('puts the background over white with its alpha', () => {
    expect(ratio('#000', 'transparent')).to.be.closeTo(21, 1e-9);
    expect(ratio('#fff', 'rgb(0 0 0 / 0.5)')).to.be.closeTo(3.9767, 1e-4);
  });

  it('formats the ratio with two decimals at most, cut and not rounded', () => {
    const i18n = { resourceStrings, locale: 'en' };

    expect(formatContrastRatio(4.4999, i18n)).to.equal('Contrast 4.49:1');
    expect(formatContrastRatio(4.5422, i18n)).to.equal('Contrast 4.54:1');
    expect(formatContrastRatio(21, i18n)).to.equal('Contrast 21:1');
  });
});
