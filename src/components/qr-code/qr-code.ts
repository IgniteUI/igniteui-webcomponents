import { css, html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { isEmpty } from '../common/util.js';
import { generateQRCodeMatrix } from './model/matrix.js';
import { renderQrCorner } from './renderer/corner.js';
import { getFinderPatterns, renderDataModules } from './renderer/svg.js';
import type {
  QrCornerSquareStyle,
  QrDotStyle,
  QrErrorCorrectionLevel,
} from './types.js';

/**
 *
 * Generates a QR code based on the provided value and options.
 * The component renders an SVG representation of the QR code, which can be customized using various properties.
 *
 * @element igc-qr-code
 *
 * @cssproperty --igc-qr-dark - The color used for the dark modules of the QR code. Default is #000.
 * @cssproperty --igc-qr-background - The color used for the background of the QR code. Default is #fff.
 * @cssproperty --qr-corner-square-fill - The fill color for the corner squares of the QR code. Default is black.
 * @cssproperty --qr-corner-dot-fill - The fill color for the corner dots of the QR code. Default is black.
 */
export default class IgcQrCodeComponent extends LitElement {
  public static readonly tagName = 'igc-qr-code';

  public static override styles = css`
    :host {
      display: inline-block;
      contain: content;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcQrCodeComponent);
  }

  /**
   * The value to be encoded in the QR code. This can be any string, such as a URL, text, or other data.
   * When this property is set, the component will generate a QR code representing the provided value.
   *
   * @attr value
   */
  @property()
  public value?: string;

  /**
   * The version of the QR code to generate, which determines the size and data capacity of the QR code.
   * Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.
   *
   * If not specified, the component will automatically select the smallest version that can accommodate the provided value.
   *
   * @attr version
   */
  @property({ type: Number })
  public version?: number;

  /**
   * The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
   * Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.
   *
   * @attr error-level
   * @default 'M'
   */
  @property({ attribute: 'error-level' })
  public errorLevel?: QrErrorCorrectionLevel = 'M';

  /**
   * The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.
   *
   * @attr size
   * @default 128
   */
  @property({ type: Number })
  public size = 128;

  /**
   * The margin around the QR code in pixels. This is the whitespace area surrounding the QR code,
   * which helps ensure that it can be properly scanned.
   *
   * @attr margin
   * @default 4
   */
  @property({ type: Number })
  public margin = 4;

  /**
   * The style of the data modules (dots) in the QR code. This can be 'square', 'circle', or 'rounded'.
   *
   * @attr dot-style
   * @default 'square'
   */
  @property({ attribute: 'dot-style' })
  public dotStyle: QrDotStyle = 'square';

  /**
   * The style of the corner squares in the QR code. This can be 'square', 'circle', or 'rounded'.
   *
   * @attr square-style
   * @default 'square'
   */
  @property({ attribute: 'square-style' })
  public squareStyle: QrCornerSquareStyle = 'square';

  protected override render() {
    if (!this.value) return null;

    const { matrix, size } = generateQRCodeMatrix(
      this.value,
      this.errorLevel,
      this.version
    );

    const totalModules = size + this.margin * 2;
    const moduleSize = size / totalModules;
    const marginPx = this.margin * moduleSize;
    const svgSize = moduleSize * (size + this.margin * 2);

    const dataModules = renderDataModules(
      matrix,
      moduleSize,
      marginPx,
      this.dotStyle
    );

    const paths = isEmpty(dataModules)
      ? nothing
      : svg`<path d=${dataModules.join(' ')} fill="var(--igc-qr-dark, #000)"/>`;

    const patterns = getFinderPatterns(size, moduleSize, marginPx).map(
      ({ x, y }) =>
        renderQrCorner({
          x,
          y,
          size: moduleSize,
          dotStyle: this.dotStyle,
          squareStyle: this.squareStyle,
        })
    );

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        width=${this.size}
        height=${this.size}
        viewBox="0 0 ${svgSize} ${svgSize}"
      >
        <title>${this.ariaLabel ?? `QR code: ${this.value}`}</title>

        <rect
          width=${svgSize}
          height=${svgSize}
          fill="var(--igc-qr-background, #fff)"
        />
        <g>${paths}${patterns}</g>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-qr-code': IgcQrCodeComponent;
  }
}
