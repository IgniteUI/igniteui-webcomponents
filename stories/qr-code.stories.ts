import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { defineComponents, IgcQrCodeComponent } from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcQrCodeComponent);

// region default
const metadata: Meta<IgcQrCodeComponent> = {
  title: 'QrCode',
  component: 'igc-qr-code',
  parameters: {
    docs: {
      description: {
        component:
          '\nGenerates a QR code based on the provided value and options.\nThe component renders an SVG representation of the QR code, which can be customized using various properties.',
      },
    },
  },
  argTypes: {
    value: {
      type: 'string',
      description:
        'The value to be encoded in the QR code. This can be any string, such as a URL, text, or other data.\nWhen this property is set, the component will generate a QR code representing the provided value.',
      control: 'text',
    },
    version: {
      type: 'number',
      description:
        'The version of the QR code to generate, which determines the size and data capacity of the QR code.\nValid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.\n\nIf not specified, the component will automatically select the smallest version that can accommodate the provided value.',
      control: 'number',
    },
    errorLevel: {
      type: { name: 'enum', value: ['L', 'M', 'Q', 'H'] },
      description:
        "The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.\nValid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.",
      options: ['L', 'M', 'Q', 'H'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'M' } },
    },
    size: {
      type: 'number',
      description:
        'The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.',
      control: 'number',
      table: { defaultValue: { summary: '128' } },
    },
    margin: {
      type: 'number',
      description:
        'The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather\nthan pixels. This is the blank border area surrounding the code, which helps ensure that it\ncan be properly scanned.',
      control: 'number',
      table: { defaultValue: { summary: '4' } },
    },
    logoSrc: {
      type: 'string',
      description:
        'The source URL of an optional logo image to be displayed at the center of the QR code. The logo can help with branding and recognition.\nIf provided, the component will attempt to render the logo within the QR code while maintaining scannability.',
      control: 'text',
    },
    logoSize: {
      type: 'number',
      description:
        "The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo\nwhile the QR code remains scannable (up to 9% of the code's area, at the highest error\ncorrection level). The value should be a number between 0 and 1, where 0 means no logo and 1\nmeans the logo will cover the full safe area (not the entire QR code).\nThe default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).\n\nWhen `error-level` is not explicitly set, the smallest error correction level that can\naccommodate the requested logo size is chosen automatically.",
      control: 'number',
      table: { defaultValue: { summary: '0.4' } },
    },
    logoMargin: {
      type: 'number',
      description:
        "The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,\nwhich helps ensure that the logo does not interfere with the QR code's scannability.",
      control: 'number',
    },
    dotStyle: {
      type: { name: 'enum', value: ['square', 'circle', 'rounded'] },
      description:
        "The style of the data modules (dots) in the QR code, and of the inner dot of each finder-pattern\ncorner. This can be 'square', 'circle', or 'rounded'.",
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
    squareStyle: {
      type: { name: 'enum', value: ['square', 'circle', 'rounded'] },
      description:
        "The style of the corner squares in the QR code. This can be 'square', 'circle', or 'rounded'.",
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
  },
  args: {
    errorLevel: 'M',
    size: 128,
    margin: 4,
    logoSize: 0.4,
    dotStyle: 'square',
    squareStyle: 'square',
  },
};

export default metadata;

interface IgcQrCodeArgs {
  /**
   * The value to be encoded in the QR code. This can be any string, such as a URL, text, or other data.
   * When this property is set, the component will generate a QR code representing the provided value.
   */
  value: string;
  /**
   * The version of the QR code to generate, which determines the size and data capacity of the QR code.
   * Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.
   *
   * If not specified, the component will automatically select the smallest version that can accommodate the provided value.
   */
  version: number;
  /**
   * The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
   * Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.
   */
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  /** The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels. */
  size: number;
  /**
   * The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
   * than pixels. This is the blank border area surrounding the code, which helps ensure that it
   * can be properly scanned.
   */
  margin: number;
  /**
   * The source URL of an optional logo image to be displayed at the center of the QR code. The logo can help with branding and recognition.
   * If provided, the component will attempt to render the logo within the QR code while maintaining scannability.
   */
  logoSrc: string;
  /**
   * The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo
   * while the QR code remains scannable (up to 9% of the code's area, at the highest error
   * correction level). The value should be a number between 0 and 1, where 0 means no logo and 1
   * means the logo will cover the full safe area (not the entire QR code).
   * The default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).
   *
   * When `error-level` is not explicitly set, the smallest error correction level that can
   * accommodate the requested logo size is chosen automatically.
   */
  logoSize: number;
  /**
   * The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,
   * which helps ensure that the logo does not interfere with the QR code's scannability.
   */
  logoMargin: number;
  /**
   * The style of the data modules (dots) in the QR code, and of the inner dot of each finder-pattern
   * corner. This can be 'square', 'circle', or 'rounded'.
   */
  dotStyle: 'square' | 'circle' | 'rounded';
  /** The style of the corner squares in the QR code. This can be 'square', 'circle', or 'rounded'. */
  squareStyle: 'square' | 'circle' | 'rounded';
}
type Story = StoryObj<IgcQrCodeArgs>;

// endregion

export const Default: Story = {
  args: {
    value: 'https://www.infragistics.com/products/ignite-ui-web-components',
  },
};

export const DotStyles: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="square"
        ></igc-qr-code>
        <span>square</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="circle"
        ></igc-qr-code>
        <span>circle</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="rounded"
        ></igc-qr-code>
        <span>rounded</span>
      </div>
    </div>
  `,
};

export const CornerSquareStyles: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          square-style="square"
        ></igc-qr-code>
        <span>square</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          square-style="circle"
        ></igc-qr-code>
        <span>circle</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          square-style="rounded"
        ></igc-qr-code>
        <span>rounded</span>
      </div>
    </div>
  `,
};

export const CombinedStyles: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="circle"
          square-style="circle"
        ></igc-qr-code>
        <span>circle / circle</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="rounded"
          square-style="rounded"
        ></igc-qr-code>
        <span>rounded / rounded</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="circle"
          square-style="square"
        ></igc-qr-code>
        <span>circle / square</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          dot-style="rounded"
          square-style="circle"
        ></igc-qr-code>
        <span>rounded / circle</span>
      </div>
    </div>
  `,
};

export const WithLogo: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; padding: 1.5rem; background: #111; border-radius: 12px;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
      >
        <igc-qr-code
          value="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
          size="220"
          error-level="H"
          dot-style="circle"
          square-style="rounded"
          logo-src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
          logo-size="0.75"
          logo-margin="6"
          style="
            --ig-qr-code-dark-color: #1a1a1a;
            --ig-qr-code-background: #f7df1e;
            --ig-qr-code-corner-square-color: #1a1a1a;
            --ig-qr-code-corner-dot-color: #1a1a1a;
          "
        ></igc-qr-code>
        <span style="color: #f7df1e; font-family: sans-serif; font-weight: 600;"
          >JavaScript</span
        >
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
      >
        <igc-qr-code
          value="https://developer.mozilla.org/en-US/docs/Web/HTML"
          size="220"
          error-level="H"
          dot-style="circle"
          square-style="rounded"
          logo-src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg"
          logo-size="0.75"
          logo-margin="6"
          style="
            --ig-qr-code-dark-color: #ffffff;
            --ig-qr-code-background: #e44d26;
            --ig-qr-code-corner-square-color: #ffffff;
            --ig-qr-code-corner-dot-color: #ffffff;
          "
        ></igc-qr-code>
        <span style="color: #e44d26; font-family: sans-serif; font-weight: 600;"
          >HTML5</span
        >
      </div>

      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
      >
        <igc-qr-code
          value="https://developer.mozilla.org/en-US/docs/Web/CSS"
          size="220"
          error-level="H"
          dot-style="circle"
          square-style="rounded"
          logo-src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg"
          logo-size="0.75"
          logo-margin="6"
          style="
            --ig-qr-code-dark-color: #ffffff;
            --ig-qr-code-background: #1572b6;
            --ig-qr-code-corner-square-color: #ffffff;
            --ig-qr-code-corner-dot-color: #ffffff;
          "
        ></igc-qr-code>
        <span style="color: #1572b6; font-family: sans-serif; font-weight: 600;"
          >CSS3</span
        >
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
      >
        <igc-qr-code
          value="https://www.infragistics.com/products/ignite-ui-web-components"
          size="220"
          error-level="H"
          dot-style="circle"
          square-style="rounded"
          logo-src="https://static.infragistics.com/marketing/Website/products/ignite-ui/shared/ignite-ui-logo-light-background-horizontal.svg"
          logo-size="0.75"
          logo-margin="6"
          style="
            --ig-qr-code-dark-color: #0f172a;
            --ig-qr-code-background: #ffffff;
            --ig-qr-code-corner-square-color: #0f172a;
            --ig-qr-code-corner-dot-color: #0f172a;
          "
        ></igc-qr-code>
        <span style="color: #fff; font-family: sans-serif; font-weight: 600;"
          >Ignite UI</span
        >
      </div>
    </div>
  `,
};

export const CustomColors: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: #0066cc; --ig-qr-code-background: #e8f4ff; --ig-qr-code-corner-square-color: #0066cc; --ig-qr-code-corner-dot-color: #0066cc;"
        ></igc-qr-code>
        <span>Blue</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: #cc3300; --ig-qr-code-background: #fff5f0; --ig-qr-code-corner-square-color: #cc3300; --ig-qr-code-corner-dot-color: #cc3300;"
        ></igc-qr-code>
        <span>Red</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: #ffffff; --ig-qr-code-background: #1a1a2e; --ig-qr-code-corner-square-color: #ffffff; --ig-qr-code-corner-dot-color: #ffffff;"
        ></igc-qr-code>
        <span>Inverted</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: #007a33; --ig-qr-code-background: #f0fff4; --ig-qr-code-corner-square-color: #007a33; --ig-qr-code-corner-dot-color: #007a33;"
        ></igc-qr-code>
        <span>Green</span>
      </div>
    </div>
  `,
};

export const FinderPatternColors: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-corner-square-color: #cc3300; --ig-qr-code-corner-dot-color: #cc3300;"
        ></igc-qr-code>
        <span>Red corners</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-corner-square-color: #0066cc; --ig-qr-code-corner-dot-color: #0066cc;"
        ></igc-qr-code>
        <span>Blue corners</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-corner-square-color: #7b2d8b; --ig-qr-code-corner-dot-color: #e040fb;"
        ></igc-qr-code>
        <span>Purple square / pink dot</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-corner-square-color: #e65c00; --ig-qr-code-corner-dot-color: #004e92;"
        ></igc-qr-code>
        <span>Orange square / navy dot</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: #555; --ig-qr-code-corner-square-color: #ffb300; --ig-qr-code-corner-dot-color: #ffb300;"
        ></igc-qr-code>
        <span>Grey data / golden corners</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-background: #1a1a2e; --ig-qr-code-dark-color: #a0c4ff; --ig-qr-code-corner-square-color: #ff6b6b; --ig-qr-code-corner-dot-color: #ffd93d;"
        ></igc-qr-code>
        <span>Dark bg / accent corners</span>
      </div>
    </div>
  `,
};

export const Sizes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-end;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code value="https://example.com" size="128"></igc-qr-code>
        <span>128px</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code value="https://example.com" size="192"></igc-qr-code>
        <span>192px</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code value="https://example.com" size="256"></igc-qr-code>
        <span>256px</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-qr-code value="https://example.com" size="320"></igc-qr-code>
        <span>320px</span>
      </div>
    </div>
  `,
};
