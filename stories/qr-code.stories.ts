import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcQrCodeComponent,
  IgcSelectComponent,
  IgcSwitchComponent,
  type QrCodeCopyFormat,
  type QrCodeExportFormat,
  type QrErrorCorrectionLevel,
} from 'igniteui-webcomponents';
import {
  createEpcPayload,
  createEventPayload,
  createVCardPayload,
  createWifiPayload,
} from 'igniteui-webcomponents/extras/qr-payloads';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcQrCodeComponent,
  IgcSelectComponent,
  IgcSwitchComponent
);

// region default
const metadata: Meta<IgcQrCodeComponent> = {
  title: 'QrCode',
  component: 'igc-qr-code',
  parameters: {
    docs: {
      description: {
        component:
          'Generates a QR code from a value and renders it as an SVG image.\nProperties set the size, the shapes, the error correction level and an optional logo.',
      },
    },
  },
  argTypes: {
    value: {
      type: 'string',
      description:
        'The value to encode in the QR code. This can be any string, such as a URL, text, or other data.\nWithout a value, the component renders nothing.',
      control: 'text',
    },
    version: {
      type: 'number',
      description:
        'The version of the QR code to generate, which determines the size and data capacity of the QR code.\nValid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.\n\nWhen it is not set, or it is not an integer from 1 to 40, the component selects the smallest\nversion that holds the value and that stays readable under the logo. When the value does not\nfit the version, the component renders nothing. On a version that is set, a logo gets smaller\nto keep the code readable.',
      control: 'number',
    },
    errorLevel: {
      type: { name: 'enum', value: ['L', 'M', 'Q', 'H'] },
      description:
        "The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.\nValid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.\n\nWhen the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'\nraises the level to the smallest level that holds the logo. To restore this behavior, set\n`undefined` or remove the attribute.",
      options: ['L', 'M', 'Q', 'H'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'M' } },
    },
    size: {
      type: 'number',
      description:
        'The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.\n\nEach module covers a whole number of pixels, so the edges stay sharp. The pixels that are\nleft over widen the quiet zone, and the code can be smaller than `size`. An exported image\ngets whole pixels at its own size.',
      control: 'number',
      table: { defaultValue: { summary: '128' } },
    },
    margin: {
      type: 'number',
      description:
        'The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather\nthan pixels. This is the blank border area surrounding the code, which helps ensure that it\ncan be properly scanned. It is a minimum: spare pixels make the quiet zone wider.',
      control: 'number',
      table: { defaultValue: { summary: '4' } },
    },
    logoSrc: {
      type: 'string',
      description:
        'The source URL of an optional logo image at the center of the QR code.\nThe component does not render a logo that fails to load, a `javascript:` or `vbscript:` URL,\nor a data URI that is not an image.',
      control: 'text',
    },
    logoSize: {
      type: 'number',
      description:
        "The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo\nwhile the QR code remains scannable (up to 9% of the code's area, at the highest error\ncorrection level). The value is a number from 0 to 1, where 0 means no logo and 1\nmeans the logo covers the full safe area (not the entire QR code). Other values are clamped.\nThe default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).\nThe area of the code leaves out the quiet zone, so `margin` does not change the logo.\n\nWhen `error-level` is not set and the logo is larger than the safe area of level 'M', the\ncomponent uses the smallest error correction level that holds the logo. When `error-level`\nis set, the logo does not grow past the safe area of that level.\n\nOn a small code, the logo can hide more codewords than the error correction recovers. The\ncomponent then uses a larger version, or, when `version` is set, a smaller logo.",
      control: 'number',
      table: { defaultValue: { summary: '0.4' } },
    },
    logoMargin: {
      type: 'number',
      description:
        "The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,\nwhich helps ensure that the logo does not interfere with the QR code's scannability.",
      control: 'number',
    },
    logoShape: {
      type: {
        name: 'enum',
        value: ['square', 'circle', 'rounded', 'squircle'],
      },
      description:
        "The shape of the logo: 'square', 'circle', 'rounded' or 'squircle'. The shape fills the logo\nbox, so a 'circle' logo with a wide image is an ellipse. The image is clipped to the shape,\nand the cutout holds only the modules that the shape covers, in part or in full.",
      options: ['square', 'circle', 'rounded', 'squircle'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'square' } },
    },
    dotStyle: {
      type: {
        name: 'enum',
        value: [
          'square',
          'circle',
          'rounded',
          'squircle',
          'diamond',
          'plus',
          'liquid',
          'horizontal-bars',
          'vertical-bars',
        ],
      },
      description:
        "The style of the data modules (dots) in the QR code. This can be 'square', 'circle',\n'rounded', 'squircle', 'diamond', 'plus', 'liquid', 'horizontal-bars' or 'vertical-bars'.\n'liquid' is 'rounded' with a smooth fill in the inside corners where modules join. The bar\nstyles draw each run of dark modules in a row or a column as one bar with round ends.\n\nThe inner dot of each finder-pattern corner uses the same style unless `cornerDotStyle` is\nset. It draws 'diamond' and 'plus' as 'square', and 'liquid' and the bar styles as\n'rounded'.",
      options: [
        'square',
        'circle',
        'rounded',
        'squircle',
        'diamond',
        'plus',
        'liquid',
        'horizontal-bars',
        'vertical-bars',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'square' } },
    },
    dotScale: {
      type: 'number',
      description:
        "The size of each data module, as a ratio of its cell in the module grid. The value is a\nnumber from 0.7 to 1. Other values are clamped. A value below 1 leaves a gap between the\nmodules, so 'rounded' modules do not join their neighbors, and 'liquid' draws as 'rounded'.\nFor the bar styles, it sets the thickness of the bars and shortens their ends. The\nfinder-pattern corners keep their full size. A smaller value can make the code harder to\nscan with a camera.",
      control: 'number',
      table: { defaultValue: { summary: '1' } },
    },
    squareStyle: {
      type: {
        name: 'enum',
        value: ['square', 'circle', 'rounded', 'squircle', 'leaf'],
      },
      description:
        "The style of the corner squares in the QR code. This can be 'square', 'circle', 'rounded',\n'squircle' or 'leaf'. A 'leaf' has two opposite round corners on the diagonal toward the\ncenter of the code. The rings of the alignment patterns use the same style, and a 'leaf'\nring there has the shape of the top-left corner square.",
      options: ['square', 'circle', 'rounded', 'squircle', 'leaf'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'square' } },
    },
    cornerDotStyle: {
      type: {
        name: 'enum',
        value: ['square', 'circle', 'rounded', 'squircle', 'leaf'],
      },
      description:
        "The style of the inner dot of each finder-pattern corner. This can be 'square', 'circle',\n'rounded', 'squircle' or 'leaf'. When it is not set, the inner dot uses `dotStyle`. The\ncenters of the alignment patterns use the same style.\n\nIn a 'circle' corner square, a 'square' or 'leaf' dot draws as 'circle', because scanners\ndo not find the pattern reliably with corners in a round ring.",
      options: ['square', 'circle', 'rounded', 'squircle', 'leaf'],
      control: { type: 'select' },
    },
    gradient: {
      type: { name: 'enum', value: ['linear', 'radial'] },
      description:
        "The gradient of the dark modules: 'linear' or 'radial'. When it is not set, or has another\nvalue, the modules have one color. The gradient goes from `--ig-qr-code-gradient-start` to\n`--ig-qr-code-gradient-end` over the code without its quiet zone. It also paints the corners,\nunless `--ig-qr-code-corner-square-color` or `--ig-qr-code-corner-dot-color` is set.\n\nKeep both colors much darker than the background.",
      options: ['linear', 'radial'],
      control: { type: 'inline-radio' },
    },
    gradientAngle: {
      type: 'number',
      description:
        "The angle of a 'linear' gradient in degrees, clockwise. At 0 the gradient goes from left to\nright, and at 90 from top to bottom.",
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: {
    errorLevel: 'M',
    size: 128,
    margin: 4,
    logoSize: 0.4,
    logoShape: 'square',
    dotStyle: 'square',
    dotScale: 1,
    squareStyle: 'square',
    gradientAngle: 0,
  },
};

export default metadata;

interface IgcQrCodeArgs {
  /**
   * The value to encode in the QR code. This can be any string, such as a URL, text, or other data.
   * Without a value, the component renders nothing.
   */
  value: string;
  /**
   * The version of the QR code to generate, which determines the size and data capacity of the QR code.
   * Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.
   *
   * When it is not set, or it is not an integer from 1 to 40, the component selects the smallest
   * version that holds the value and that stays readable under the logo. When the value does not
   * fit the version, the component renders nothing. On a version that is set, a logo gets smaller
   * to keep the code readable.
   */
  version: number;
  /**
   * The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
   * Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.
   *
   * When the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'
   * raises the level to the smallest level that holds the logo. To restore this behavior, set
   * `undefined` or remove the attribute.
   */
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  /**
   * The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.
   *
   * Each module covers a whole number of pixels, so the edges stay sharp. The pixels that are
   * left over widen the quiet zone, and the code can be smaller than `size`. An exported image
   * gets whole pixels at its own size.
   */
  size: number;
  /**
   * The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
   * than pixels. This is the blank border area surrounding the code, which helps ensure that it
   * can be properly scanned. It is a minimum: spare pixels make the quiet zone wider.
   */
  margin: number;
  /**
   * The source URL of an optional logo image at the center of the QR code.
   * The component does not render a logo that fails to load, a `javascript:` or `vbscript:` URL,
   * or a data URI that is not an image.
   */
  logoSrc: string;
  /**
   * The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo
   * while the QR code remains scannable (up to 9% of the code's area, at the highest error
   * correction level). The value is a number from 0 to 1, where 0 means no logo and 1
   * means the logo covers the full safe area (not the entire QR code). Other values are clamped.
   * The default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).
   * The area of the code leaves out the quiet zone, so `margin` does not change the logo.
   *
   * When `error-level` is not set and the logo is larger than the safe area of level 'M', the
   * component uses the smallest error correction level that holds the logo. When `error-level`
   * is set, the logo does not grow past the safe area of that level.
   *
   * On a small code, the logo can hide more codewords than the error correction recovers. The
   * component then uses a larger version, or, when `version` is set, a smaller logo.
   */
  logoSize: number;
  /**
   * The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,
   * which helps ensure that the logo does not interfere with the QR code's scannability.
   */
  logoMargin: number;
  /**
   * The shape of the logo: 'square', 'circle', 'rounded' or 'squircle'. The shape fills the logo
   * box, so a 'circle' logo with a wide image is an ellipse. The image is clipped to the shape,
   * and the cutout holds only the modules that the shape covers, in part or in full.
   */
  logoShape: 'square' | 'circle' | 'rounded' | 'squircle';
  /**
   * The style of the data modules (dots) in the QR code. This can be 'square', 'circle',
   * 'rounded', 'squircle', 'diamond', 'plus', 'liquid', 'horizontal-bars' or 'vertical-bars'.
   * 'liquid' is 'rounded' with a smooth fill in the inside corners where modules join. The bar
   * styles draw each run of dark modules in a row or a column as one bar with round ends.
   *
   * The inner dot of each finder-pattern corner uses the same style unless `cornerDotStyle` is
   * set. It draws 'diamond' and 'plus' as 'square', and 'liquid' and the bar styles as
   * 'rounded'.
   */
  dotStyle:
    | 'square'
    | 'circle'
    | 'rounded'
    | 'squircle'
    | 'diamond'
    | 'plus'
    | 'liquid'
    | 'horizontal-bars'
    | 'vertical-bars';
  /**
   * The size of each data module, as a ratio of its cell in the module grid. The value is a
   * number from 0.7 to 1. Other values are clamped. A value below 1 leaves a gap between the
   * modules, so 'rounded' modules do not join their neighbors, and 'liquid' draws as 'rounded'.
   * For the bar styles, it sets the thickness of the bars and shortens their ends. The
   * finder-pattern corners keep their full size. A smaller value can make the code harder to
   * scan with a camera.
   */
  dotScale: number;
  /**
   * The style of the corner squares in the QR code. This can be 'square', 'circle', 'rounded',
   * 'squircle' or 'leaf'. A 'leaf' has two opposite round corners on the diagonal toward the
   * center of the code. The rings of the alignment patterns use the same style, and a 'leaf'
   * ring there has the shape of the top-left corner square.
   */
  squareStyle: 'square' | 'circle' | 'rounded' | 'squircle' | 'leaf';
  /**
   * The style of the inner dot of each finder-pattern corner. This can be 'square', 'circle',
   * 'rounded', 'squircle' or 'leaf'. When it is not set, the inner dot uses `dotStyle`. The
   * centers of the alignment patterns use the same style.
   *
   * In a 'circle' corner square, a 'square' or 'leaf' dot draws as 'circle', because scanners
   * do not find the pattern reliably with corners in a round ring.
   */
  cornerDotStyle: 'square' | 'circle' | 'rounded' | 'squircle' | 'leaf';
  /**
   * The gradient of the dark modules: 'linear' or 'radial'. When it is not set, or has another
   * value, the modules have one color. The gradient goes from `--ig-qr-code-gradient-start` to
   * `--ig-qr-code-gradient-end` over the code without its quiet zone. It also paints the corners,
   * unless `--ig-qr-code-corner-square-color` or `--ig-qr-code-corner-dot-color` is set.
   *
   * Keep both colors much darker than the background.
   */
  gradient: 'linear' | 'radial';
  /**
   * The angle of a 'linear' gradient in degrees, clockwise. At 0 the gradient goes from left to
   * right, and at 90 from top to bottom.
   */
  gradientAngle: number;
}
type Story = StoryObj<IgcQrCodeArgs>;

// endregion

const productUrl =
  'https://www.infragistics.com/products/ignite-ui-web-components';

/** A short value: a code of 25 modules, so the modules are large enough to compare shapes. */
const shortUrl = 'https://infragistics.com';

const samples = html`
  <style>
    .qr-samples {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      gap: 2rem;
    }

    .qr-samples figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .qr-samples figcaption {
      max-width: 15rem;
      text-align: center;
    }

    .qr-samples code {
      overflow-wrap: anywhere;
    }

    .qr-section {
      margin-block: 2rem 1rem;
    }

    .qr-section:first-of-type {
      margin-block-start: 0;
    }
  </style>
`;

/** Makes a square logo with a short text as an SVG data URI. */
function logo(
  background: string,
  color: string,
  text: string,
  radius = 14
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${background}"/><text x="32" y="43" fill="${color}" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Makes a logo twice as wide as it is high, with a short text, as an SVG data URI. */
function wideLogo(background: string, color: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 128 64"><rect width="128" height="64" fill="${background}"/><text x="64" y="43" fill="${color}" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** A code with a caption. */
function sample(caption: unknown, code: unknown) {
  return html`<figure>
    ${code}
    <figcaption>${caption}</figcaption>
  </figure>`;
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive QR code. Use the controls panel to change the encoded `value`, the `size`, the quiet-zone `margin`, the error correction level, the shapes and the logo.',
      },
    },
  },
  args: {
    value: productUrl,
    size: 256,
  },
};

export const Shapes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`dot-style` sets the shape of the data modules. Without `corner-dot-style`, the inner corner dots follow it: `diamond` and `plus` give square dots, and `liquid` and the bars give rounded dots. `square-style` sets the shape of the outer corner squares and of the alignment rings. `corner-dot-style` sets the shape of the inner corner dots and of the alignment centers. In a `circle` corner square, a `square` or `leaf` corner dot draws as a circle, so that scanners find the corner. `dot-scale` makes the data modules smaller, with a gap between them. The samples encode a short value, so the modules are large.',
      },
    },
  },
  render: () => {
    const dotStyles = [
      'square',
      'circle',
      'rounded',
      'squircle',
      'diamond',
      'plus',
      'liquid',
      'horizontal-bars',
      'vertical-bars',
    ] as const;
    const cornerStyles = [
      'square',
      'circle',
      'rounded',
      'squircle',
      'leaf',
    ] as const;
    const scales = [
      { dot: 'circle', scale: 1 },
      { dot: 'circle', scale: 0.85 },
      { dot: 'circle', scale: 0.7 },
      { dot: 'rounded', scale: 0.85 },
      { dot: 'horizontal-bars', scale: 0.7 },
    ] as const;
    const combinations = [
      {
        caption: 'Squircle modules and corners with circle corner dots',
        dot: 'squircle',
        square: 'squircle',
        cornerDot: 'circle',
      },
      {
        caption: 'Liquid modules with rounded corners',
        dot: 'liquid',
        square: 'rounded',
      },
      {
        caption: 'Horizontal bars with leaf corners',
        dot: 'horizontal-bars',
        square: 'leaf',
        cornerDot: 'leaf',
      },
      {
        caption: 'Plus modules with circle corners',
        dot: 'plus',
        square: 'circle',
      },
      {
        caption: 'Diamond modules with squircle corners and square dots',
        dot: 'diamond',
        square: 'squircle',
        cornerDot: 'square',
      },
    ] as const;

    return html`
      ${samples}
      <h3 class="qr-section">dot-style</h3>
      <div class="qr-samples">
        ${dotStyles.map((dot) =>
          sample(
            html`<code>dot-style="${dot}"</code>`,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              dot-style=${dot}
            ></igc-qr-code>`
          )
        )}
      </div>

      <h3 class="qr-section">square-style</h3>
      <div class="qr-samples">
        ${cornerStyles.map((square) =>
          sample(
            html`<code>square-style="${square}"</code>`,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              square-style=${square}
            ></igc-qr-code>`
          )
        )}
      </div>

      <h3 class="qr-section">corner-dot-style</h3>
      <div class="qr-samples">
        ${cornerStyles.map((cornerDot) =>
          sample(
            html`<code>corner-dot-style="${cornerDot}"</code>`,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              square-style="rounded"
              corner-dot-style=${cornerDot}
            ></igc-qr-code>`
          )
        )}
      </div>

      <h3 class="qr-section">dot-scale</h3>
      <div class="qr-samples">
        ${scales.map(({ dot, scale }) =>
          sample(
            html`<code>dot-style="${dot}"</code><br /><code
                >dot-scale="${scale}"</code
              >`,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              dot-style=${dot}
              dot-scale=${scale}
            ></igc-qr-code>`
          )
        )}
      </div>

      <h3 class="qr-section">Combinations</h3>
      <div class="qr-samples">
        ${combinations.map((variant) =>
          sample(
            variant.caption,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              dot-style=${variant.dot}
              square-style=${variant.square}
              corner-dot-style=${ifDefined(
                'cornerDot' in variant ? variant.cornerDot : undefined
              )}
            ></igc-qr-code>`
          )
        )}
      </div>
    `;
  },
};

export const Colors: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'CSS custom properties set the colors. `--ig-qr-code-dark-color` colors the data modules and, by default, the corners. `--ig-qr-code-corner-square-color` and `--ig-qr-code-corner-dot-color` override the two parts of the corners. `gradient` paints the modules with a `linear` or `radial` gradient from `--ig-qr-code-gradient-start` to `--ig-qr-code-gradient-end`. `gradient-angle` turns a linear gradient. The colors do not follow the light and dark theme variants, because some readers cannot scan an inverted code. Keep the dark colors and both gradient colors much darker than the background. Most readers cannot scan a code with low contrast. Test the colors with the phones and the apps of your users.',
      },
    },
  },
  render: () => {
    const variants: {
      caption: string;
      style: string;
      gradient?: 'linear' | 'radial';
      angle?: number;
    }[] = [
      {
        caption: 'Brand colors',
        style:
          '--ig-qr-code-dark-color: #0b3d91; --ig-qr-code-background: #eaf2ff;',
      },
      {
        caption: 'Accent corners',
        style:
          '--ig-qr-code-dark-color: #1f2937; --ig-qr-code-corner-square-color: #e63946; --ig-qr-code-corner-dot-color: #457b9d;',
      },
      {
        caption: 'Linear gradient, left to right (gradient-angle 0)',
        style:
          '--ig-qr-code-gradient-start: #1a237e; --ig-qr-code-gradient-end: #880e4f;',
        gradient: 'linear',
      },
      {
        caption: 'Linear gradient, corner to corner (gradient-angle 45)',
        style:
          '--ig-qr-code-gradient-start: #0b3d91; --ig-qr-code-gradient-end: #2a7f62;',
        gradient: 'linear',
        angle: 45,
      },
      {
        caption: 'Linear gradient, top to bottom (gradient-angle 90)',
        style:
          '--ig-qr-code-gradient-start: #4a148c; --ig-qr-code-gradient-end: #b71c1c;',
        gradient: 'linear',
        angle: 90,
      },
      {
        caption: 'Radial gradient, center to corners',
        style:
          '--ig-qr-code-gradient-start: #6a1b9a; --ig-qr-code-gradient-end: #0d47a1;',
        gradient: 'radial',
      },
      {
        caption: 'Radial gradient with accent corner dots',
        style:
          '--ig-qr-code-gradient-start: #0b3d91; --ig-qr-code-gradient-end: #1d6f65; --ig-qr-code-corner-dot-color: #e63946;',
        gradient: 'radial',
      },
      {
        caption: 'Inverted, for a dark print',
        style:
          '--ig-qr-code-dark-color: #f8fafc; --ig-qr-code-background: #0f172a;',
      },
      {
        caption: 'Low contrast, hard to scan',
        style:
          '--ig-qr-code-dark-color: #c7ccd4; --ig-qr-code-background: #ffffff;',
      },
    ];

    return html`
      ${samples}
      <div class="qr-samples">
        ${variants.map(({ caption, style, gradient, angle }) =>
          sample(
            caption,
            html`<igc-qr-code
              value=${shortUrl}
              size="220"
              dot-style="rounded"
              square-style="rounded"
              gradient=${ifDefined(gradient)}
              gradient-angle=${ifDefined(angle)}
              style=${style}
            ></igc-qr-code>`
          )
        )}
      </div>
    `;
  },
};

/** The gradient colors are CSS custom properties, not attributes, so they are not in the generated args. */
type GradientStory = StoryObj<
  IgcQrCodeArgs & { gradientStart: string; gradientEnd: string }
>;

export const Gradient: GradientStory = {
  argTypes: {
    ...disableStoryControls(metadata),
    gradient: metadata.argTypes!.gradient,
    gradientAngle: {
      ...metadata.argTypes!.gradientAngle,
      control: { type: 'range', min: 0, max: 360, step: 15 },
    },
    gradientStart: {
      control: 'color',
      description: 'The value of `--ig-qr-code-gradient-start`.',
    },
    gradientEnd: {
      control: 'color',
      description: 'The value of `--ig-qr-code-gradient-end`.',
    },
    dotStyle: metadata.argTypes!.dotStyle,
    squareStyle: metadata.argTypes!.squareStyle,
  },
  args: {
    gradient: 'linear',
    gradientAngle: 45,
    gradientStart: '#1a237e',
    gradientEnd: '#880e4f',
    dotStyle: 'liquid',
    squareStyle: 'rounded',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the controls to change the gradient. `gradient` sets the type, `gradient-angle` turns a linear gradient clockwise, and the color pickers set `--ig-qr-code-gradient-start` and `--ig-qr-code-gradient-end`. The gradient spans the modules, not the quiet zone. Keep both colors much darker than the background.',
      },
    },
  },
  render: ({
    gradient,
    gradientAngle,
    gradientStart,
    gradientEnd,
    dotStyle,
    squareStyle,
  }) => html`
    <igc-qr-code
      value=${productUrl}
      size="320"
      gradient=${ifDefined(gradient)}
      gradient-angle=${gradientAngle}
      dot-style=${dotStyle}
      square-style=${squareStyle}
      style="--ig-qr-code-gradient-start: ${gradientStart}; --ig-qr-code-gradient-end: ${gradientEnd};"
    ></igc-qr-code>
  `,
};

export const ErrorCorrection: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`error-level` sets how much of the code a reader can restore when the code is dirty, torn or covered. A higher level adds modules, so the code of the same value becomes denser. Turn on the switch to put a sticker over each code, and then try to scan the codes with a phone. Levels `Q` and `H` usually still scan.',
      },
    },
  },
  render: () => {
    const levels = [
      ['L', 'about 7%'],
      ['M', 'about 15%'],
      ['Q', 'about 25%'],
      ['H', 'about 30%'],
    ] as const;

    const cover = (event: Event) => {
      const toggle = event.currentTarget as IgcSwitchComponent;
      toggle.nextElementSibling?.classList.toggle('covered', toggle.checked);
    };

    return html`
      ${samples}
      <style>
        .qr-code-frame {
          position: relative;
          line-height: 0;
        }

        .qr-code-frame::after {
          content: '';
          position: absolute;
          inset-block-start: 52%;
          inset-inline-start: 50%;
          width: 30%;
          aspect-ratio: 1;
          border-radius: 8px;
          background: #f9c74f;
          rotate: 8deg;
          visibility: hidden;
        }

        .covered .qr-code-frame::after {
          visibility: visible;
        }
      </style>

      <igc-switch @igcChange=${cover}>Cover part of each code</igc-switch>
      <div class="qr-samples" style="margin-block-start: 1.5rem">
        ${levels.map(
          ([level, recovery]) => html`
            <figure>
              <div class="qr-code-frame">
                <igc-qr-code
                  value=${productUrl}
                  size="160"
                  error-level=${level}
                ></igc-qr-code>
              </div>
              <figcaption>
                <strong>${level}</strong>: restores ${recovery} of the code
              </figcaption>
            </figure>
          `
        )}
      </div>
    `;
  },
};

export const WithLogo: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`logo-src` puts an image at the center of the code and removes the modules under it. `logo-size` is a ratio of the area that the error correction level can restore, not of the full code: `1` covers 9% of the code at level `H`. `logo-margin` adds whitespace around the logo, in pixels. Without `error-level`, the code uses level `M`, and a logo larger than the safe area of `M` raises the level to the smallest one that holds it, as in the first two codes. An explicit level caps the logo to the area of that level, so the logo in the fourth code shrinks. `logo-shape` clips the logo to a `circle`, `rounded` or `squircle` shape that fills the logo box, and the code removes only the modules under the shape. A wide image in a `circle` gives an ellipse. A `rounded` or `liquid` module and a bar end round at the edge of the removed area. A logo source must be an image: a `javascript:` URL or a data URI of another type is ignored.',
      },
    },
  },
  render: () => {
    const sizes: {
      caption: string;
      logo: string;
      size: number;
      level?: 'L' | 'H';
      margin?: number;
      style: string;
    }[] = [
      {
        caption: 'Default logo size, no error-level: level M',
        logo: logo('#6f4e37', '#fff8e7', 'BC'),
        size: 0.4,
        style:
          '--ig-qr-code-dark-color: #3b2a20; --ig-qr-code-background: #fff8e7;',
      },
      {
        caption: 'logo-size 0.75 and a 4px margin, no error-level: level H',
        logo: logo('#0b3d91', '#ffffff', 'GO'),
        size: 0.75,
        margin: 4,
        style: '--ig-qr-code-dark-color: #0b3d91;',
      },
      {
        caption: 'logo-size 1, level H: 9% of the code',
        logo: logo('#2a9d8f', '#ffffff', 'ECO'),
        size: 1,
        level: 'H',
        margin: 6,
        style: '--ig-qr-code-dark-color: #1d6f65;',
      },
      {
        caption: 'logo-size 1, level L: 2.25% of the code',
        logo: logo('#2a9d8f', '#ffffff', 'ECO'),
        size: 1,
        level: 'L',
        margin: 6,
        style: '--ig-qr-code-dark-color: #1d6f65;',
      },
    ];
    const shapes: {
      caption: unknown;
      logo: string;
      shape: 'square' | 'circle' | 'rounded' | 'squircle';
      dot: 'square' | 'rounded' | 'liquid' | 'horizontal-bars';
    }[] = [
      {
        caption: html`<code>logo-shape="square"</code>`,
        logo: logo('#e63946', '#ffffff', 'GO', 0),
        shape: 'square',
        dot: 'square',
      },
      {
        caption: html`<code>logo-shape="circle"</code>`,
        logo: logo('#e63946', '#ffffff', 'GO', 0),
        shape: 'circle',
        dot: 'square',
      },
      {
        caption: html`<code>logo-shape="rounded"</code>`,
        logo: logo('#e63946', '#ffffff', 'GO', 0),
        shape: 'rounded',
        dot: 'square',
      },
      {
        caption: html`<code>logo-shape="squircle"</code>`,
        logo: logo('#e63946', '#ffffff', 'GO', 0),
        shape: 'squircle',
        dot: 'square',
      },
      {
        caption: 'A wide image in a circle: an ellipse',
        logo: wideLogo('#0b3d91', '#ffffff', 'IGNITE'),
        shape: 'circle',
        dot: 'square',
      },
      {
        caption: 'Liquid modules end round at a circle logo',
        logo: logo('#0b3d91', '#ffffff', 'UI', 0),
        shape: 'circle',
        dot: 'liquid',
      },
      {
        caption: 'Bars end round at a squircle logo',
        logo: logo('#2a9d8f', '#ffffff', 'ECO', 0),
        shape: 'squircle',
        dot: 'horizontal-bars',
      },
    ];

    return html`
      ${samples}
      <h3 class="qr-section">logo-size and error-level</h3>
      <div class="qr-samples">
        ${sizes.map((variant) =>
          sample(
            variant.caption,
            html`<igc-qr-code
              value=${productUrl}
              size="240"
              dot-style="circle"
              square-style="rounded"
              error-level=${ifDefined(variant.level)}
              logo-src=${variant.logo}
              logo-size=${variant.size}
              .logoMargin=${variant.margin}
              style=${variant.style}
            ></igc-qr-code>`
          )
        )}
      </div>

      <h3 class="qr-section">logo-shape</h3>
      <div class="qr-samples">
        ${shapes.map((variant) =>
          sample(
            variant.caption,
            html`<igc-qr-code
              value=${shortUrl}
              size="240"
              dot-style=${variant.dot}
              square-style="rounded"
              logo-src=${variant.logo}
              logo-size="1"
              logo-shape=${variant.shape}
            ></igc-qr-code>`
          )
        )}
      </div>
    `;
  },
};

type Payload = 'url' | 'wifi' | 'contact' | 'payment' | 'event' | 'text';

const payloads: Record<
  Payload,
  {
    label: string;
    encode: (fields: Record<string, string>) => string;
    errorLevel?: QrErrorCorrectionLevel;
  }
> = {
  url: { label: 'Website link', encode: (f) => f.url },
  wifi: {
    label: 'Wi-Fi network',
    encode: (f) => createWifiPayload({ ssid: f.ssid, password: f.password }),
  },
  contact: {
    label: 'Contact card',
    encode: (f) =>
      createVCardPayload({
        name: { given: f.first, family: f.last },
        organization: f.organization,
        phones: f.phone ? [{ value: f.phone, type: 'cell' }] : [],
        emails: f.email ? [{ value: f.email, type: 'work' }] : [],
      }),
  },
  payment: {
    label: 'SEPA payment',
    errorLevel: 'M',
    encode: (f) =>
      createEpcPayload({
        name: f.beneficiary,
        iban: f.iban,
        amount: f.amount ? Number(f.amount) : undefined,
        text: f.remittance,
      }),
  },
  event: {
    label: 'Calendar event',
    encode: (f) =>
      createEventPayload({
        summary: f.summary,
        start: new Date(`${f.date}T${f.start}`),
        end: new Date(`${f.date}T${f.end}`),
        location: f.location,
      }),
  },
  text: { label: 'Plain text', encode: (f) => f.text },
};

export const Generator: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A QR code generator. The content type decides how the fields are encoded: a URL, a Wi-Fi login, a contact card, a SEPA payment, a calendar event or plain text. The helpers of `igniteui-webcomponents/extras/qr-payloads` build the formats and escape the text. A helper throws a `RangeError` for input that its format does not allow, such as an amount with 3 decimals, and the message shows under the fields. The SEPA payment keeps the default error correction level M, as the EPC guideline asks. The code updates on each keystroke, and `aria-label` gives the code a name that describes its content. The encoded payload shows under the code.',
      },
    },
  },
  render: () => {
    const update = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(
        '.qr-generator'
      )!;
      const type = root.querySelector('igc-select')!.value as Payload;
      const status = root.querySelector('[role="status"]')!;
      const qr = root.querySelector('igc-qr-code')!;
      const fields = Object.fromEntries(
        Array.from(root.querySelectorAll('igc-input'), (input) => [
          input.name,
          input.value,
        ])
      );

      for (const group of root.querySelectorAll<HTMLElement>('[data-type]')) {
        group.hidden = group.dataset.type !== type;
      }

      try {
        qr.value = payloads[type].encode(fields);
        qr.errorLevel = payloads[type].errorLevel ?? 'Q';
        qr.ariaLabel = `${payloads[type].label} QR code`;
        status.textContent = '';
      } catch (error) {
        status.textContent = (error as Error).message;
      }
      root.querySelector('pre')!.textContent = qr.value ?? '';
    };

    const download = async (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest(
        '.qr-generator'
      )!;
      const status = root.querySelector('[role="status"]')!;

      try {
        const file = await root
          .querySelector('igc-qr-code')!
          .toImage({ fileName: 'qr-code', scale: 2, download: true });
        status.textContent = `Downloaded ${file.name}.`;
      } catch (error) {
        status.textContent = `The download failed: ${(error as Error).message}`;
      }
    };

    return html`
      <style>
        .qr-generator {
          display: flex;
          flex-wrap: wrap;
          align-items: start;
          gap: 2rem 3rem;
        }

        .qr-generator .fields,
        .qr-generator [data-type] {
          display: grid;
          gap: 1rem;
          width: min(100%, 20rem);
        }

        .qr-generator [hidden] {
          display: none;
        }

        .qr-generator figure {
          display: grid;
          gap: 1rem;
          margin: 0;
        }

        .qr-generator pre {
          max-width: 20rem;
          margin: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
      </style>

      <div class="qr-generator">
        <div class="fields">
          <igc-select label="Content" value="url" @igcChange=${update}>
            ${Object.entries(payloads).map(
              ([value, { label }]) =>
                html`<igc-select-item value=${value}>${label}</igc-select-item>`
            )}
          </igc-select>

          <div data-type="url">
            <igc-input
              name="url"
              type="url"
              label="URL"
              value=${productUrl}
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="wifi" hidden>
            <igc-input
              name="ssid"
              label="Network name"
              value="Guest Wi-Fi"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="password"
              label="Password"
              value="welcome;2026"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="contact" hidden>
            <igc-input
              name="first"
              label="First name"
              value="Maria"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="last"
              label="Last name"
              value="Ivanova"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="organization"
              label="Company"
              value="Example Ltd."
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="phone"
              type="tel"
              label="Phone"
              value="+1 555 0100"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="email"
              type="email"
              label="Email"
              value="maria@example.com"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="payment" hidden>
            <igc-input
              name="beneficiary"
              label="Beneficiary"
              value="Example Charity e.V."
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="iban"
              label="IBAN"
              value="DE89 3704 0044 0532 0130 00"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="amount"
              type="number"
              label="Amount in euros"
              value="25.00"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="remittance"
              label="Remittance text"
              value="Donation 2026"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="event" hidden>
            <igc-input
              name="summary"
              label="Title"
              value="Team meetup"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="date"
              label="Date (YYYY-MM-DD)"
              value="2026-12-04"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="start"
              label="Start time (HH:MM)"
              value="18:00"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="end"
              label="End time (HH:MM)"
              value="21:00"
              @igcInput=${update}
            ></igc-input>
            <igc-input
              name="location"
              label="Location"
              value="Main hall"
              @igcInput=${update}
            ></igc-input>
          </div>

          <div data-type="text" hidden>
            <igc-input
              name="text"
              label="Text"
              value="Meet at gate 4 at 10:00."
              @igcInput=${update}
            ></igc-input>
          </div>

          <igc-button @click=${download}>Download PNG</igc-button>
          <span role="status"></span>
        </div>

        <figure>
          <igc-qr-code
            value=${productUrl}
            aria-label="Website link QR code"
            size="220"
            error-level="Q"
            dot-style="rounded"
            square-style="rounded"
          ></igc-qr-code>
          <figcaption><pre>${productUrl}</pre></figcaption>
        </figure>
      </div>
    `;
  },
};

export const PhoneActions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Codes that open an app on the phone: an email draft, a call, a text message and a place on a map. They are plain URLs, so they need no helper. Encode the text parts with `encodeURIComponent()`. The text message uses the `SMSTO:` form with one number. Readers differ in how they fill in a message, so test the code on the phones of your users.',
      },
    },
  },
  render: () => {
    const actions = [
      {
        caption: 'Email draft',
        value: `mailto:support@example.com?subject=${encodeURIComponent('Order 1042')}&body=${encodeURIComponent('Hello, I have a question about my order.')}`,
      },
      { caption: 'Phone call', value: 'tel:+15550100' },
      { caption: 'Text message', value: 'SMSTO:+15550100:Table 12 is ready' },
      { caption: 'Place on a map', value: 'geo:42.6977,23.3219' },
    ];

    return html`
      ${samples}
      <div class="qr-samples">
        ${actions.map(
          ({ caption, value }) => html`
            <figure>
              <igc-qr-code
                value=${value}
                size="160"
                aria-label="${caption} QR code"
              ></igc-qr-code>
              <figcaption>${caption}<br /><code>${value}</code></figcaption>
            </figure>
          `
        )}
      </div>
    `;
  },
};

export const Tickets: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Event tickets. Without `version`, the component picks the smallest version that holds the value, so a longer ticket code gets more and smaller modules. A fixed `version` gives all tickets the same grid, which suits printed layouts. Turn off the switch to compare. The ticket is white, so `margin="2"` is enough quiet zone here. Use the default of 4 modules on a busy background.',
      },
    },
  },
  render: () => {
    const tickets = [
      { code: 'FC26-7', holder: 'Alex Kim', seat: 'General admission' },
      { code: 'FC26-0042-B', holder: 'Sam Rivera', seat: 'Row B, seat 12' },
      {
        code: 'FC26-VIP-000123-EAST-GATE',
        holder: 'Jordan Lee',
        seat: 'VIP lounge, east gate',
      },
    ];

    const pin = (event: Event) => {
      const toggle = event.currentTarget as IgcSwitchComponent;

      for (const qr of toggle.parentElement!.querySelectorAll('igc-qr-code')) {
        qr.version = toggle.checked ? 3 : undefined;
      }
    };

    return html`
      <style>
        .tickets {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-block-start: 1.5rem;
        }

        .ticket {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #d0d5dd;
          border-radius: 12px;
          background: #ffffff;
          color: #101828;
        }

        .ticket dl {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding-inline-end: 1rem;
          border-inline-end: 2px dashed #d0d5dd;
        }

        .ticket dt {
          font-size: 0.75rem;
          color: #475467;
        }

        .ticket dd {
          margin: 0 0 0.5rem;
        }
      </style>

      <div>
        <igc-switch checked @igcChange=${pin}>Pin version 3</igc-switch>
        <div class="tickets">
          ${tickets.map(
            ({ code, holder, seat }) => html`
              <article class="ticket" aria-label="Ticket ${code}">
                <dl>
                  <dt>Event</dt>
                  <dd>Frontend Conf 2026</dd>
                  <dt>Holder</dt>
                  <dd>${holder}</dd>
                  <dt>Seat</dt>
                  <dd>${seat}</dd>
                </dl>
                <igc-qr-code
                  value=${code}
                  aria-label="Check-in code ${code}"
                  version="3"
                  margin="2"
                  size="120"
                ></igc-qr-code>
              </article>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const TableCard: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A table card in a café, with a "Scan me" frame around the code. The frame is plain HTML and CSS: a `figure` with a border, a title and a caption. The component draws only the code, so `toImage()` and `copyToClipboard()` export the code without the frame. To print the card, print the page. Keep the quiet zone of the code between the frame and the modules.',
      },
    },
  },
  render: () => html`
    <style>
      .table-card {
        display: grid;
        justify-items: center;
        gap: 0.75rem;
        inline-size: max-content;
        margin: 0;
        padding: 1.5rem 2rem;
        border: 4px solid var(--ig-gray-900);
        border-radius: 1.5rem;
        text-align: center;
      }

      .table-card .title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
    </style>

    <figure class="table-card">
      <p class="title">Scan me</p>
      <igc-qr-code
        value="https://example.com/menu?table=12"
        aria-label="Menu QR code"
        size="200"
        dot-style="rounded"
        square-style="rounded"
      ></igc-qr-code>
      <figcaption>
        See the menu and order from table 12.<br />example.com/menu
      </figcaption>
    </figure>
  `,
};

export const Export: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`toImage()` exports the code as a `png`, `jpeg`, `webp` or `svg` file. `scale` multiplies `size`, so a scale of 4 gives a 1024 pixel image of this code for print. `download: true` opens the download dialog. `copyToClipboard()` copies the code as an image: "Copy PNG" copies a PNG image, and "Copy SVG" copies an SVG image and a PNG image for applications that do not read SVG. A browser that cannot copy SVG gets only the PNG. The buttons call the method directly in the click handler, because browsers accept a clipboard write only during a user action. `toBlob()` returns an SVG blob with the colors and the logo inlined, so the blob looks the same outside the component. The preview shows that blob in an `img` element.',
      },
    },
  },
  render: () => {
    let previewUrl = '';

    const context = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest('.qr-export')!;
      return {
        qr: root.querySelector('igc-qr-code')!,
        status: root.querySelector('[role="status"]')!,
        preview: root.querySelector('img')!,
      };
    };

    const run = async (event: Event, action: () => Promise<string>) => {
      const { status } = context(event);

      try {
        status.textContent = await action();
      } catch (error) {
        status.textContent = `The export failed: ${(error as Error).message}`;
      }
    };

    const download =
      (format: QrCodeExportFormat, scale: number) => (event: Event) =>
        run(event, async () => {
          const file = await context(event).qr.toImage({
            fileName: `ignite-ui-qr-${scale}x`,
            format,
            scale,
            download: true,
          });
          return `Downloaded ${file.name} (${file.type}).`;
        });

    const copied: Record<QrCodeCopyFormat, string> = {
      svg: 'Copied an SVG image and a PNG image to the clipboard.',
      png: 'Copied a PNG image to the clipboard.',
    };

    const copy = (format: QrCodeCopyFormat) => (event: Event) =>
      run(event, async () => {
        const { qr } = context(event);
        return copied[await qr.copyToClipboard({ format, scale: 2 })];
      });

    const preview = (event: Event) =>
      run(event, async () => {
        const { qr, preview } = context(event);
        const blob = await qr.toBlob();

        URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(blob);
        preview.src = previewUrl;
        preview.hidden = false;
        return `Created an SVG blob of ${blob.size} bytes.`;
      });

    return html`
      <div
        class="qr-export"
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
          <igc-qr-code
            value=${productUrl}
            size="256"
            dot-style="rounded"
            square-style="rounded"
            error-level="H"
            logo-src=${logo('#0b3d91', '#ffffff', 'IG')}
            logo-size="0.75"
            logo-margin="6"
            style="--ig-qr-code-dark-color: #0b3d91;"
          ></igc-qr-code>
          <img alt="Preview of the SVG blob" width="256" height="256" hidden />
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <igc-button @click=${download('svg', 1)}>Download SVG</igc-button>
          <igc-button @click=${download('png', 1)}>
            Download PNG (1x)
          </igc-button>
          <igc-button @click=${download('png', 4)}>
            Download PNG (4x)
          </igc-button>
          <igc-button @click=${download('jpeg', 2)}>
            Download JPEG (2x)
          </igc-button>
          <igc-button @click=${download('webp', 2)}>
            Download WebP (2x)
          </igc-button>
          <igc-button variant="outlined" @click=${copy('png')}>
            Copy PNG
          </igc-button>
          <igc-button variant="outlined" @click=${copy('svg')}>
            Copy SVG
          </igc-button>
          <igc-button variant="outlined" @click=${preview}>
            Preview SVG blob
          </igc-button>
        </div>
        <span role="status"></span>
      </div>
    `;
  },
};
