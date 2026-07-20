import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createAbortHandle } from '../common/abort-handler.js';
import { registerComponent } from '../common/definitions/register.js';
import { bindIf, clamp, nanoid } from '../common/util.js';
import { generateQRCodeMatrix } from './model/matrix.js';
import {
  DEFAULT_SIZE_RATIO,
  DOT_BACKGROUND,
  MAX_SAFE_AREA,
  SAFE_AREAS,
} from './renderer/constants.js';
import { renderQrFinders } from './renderer/corner.js';
import { renderQrDots } from './renderer/dots.js';
import { renderQrMaskAndImage } from './renderer/image.js';
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

  private readonly _abortHandle = createAbortHandle();
  private readonly _maskId = nanoid(8);
  private readonly _maskUrl = `url(#${this._maskId})`;

  @state()
  private _logoAspectRatio = 1;

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
   * The source URL of an optional logo image to be displayed at the center of the QR code. The logo can help with branding and recognition.
   * If provided, the component will attempt to render the logo within the QR code while maintaining scannability.
   *
   * @attr logo-src
   */
  @property({ attribute: 'logo-src' })
  public logoSrc?: string;

  /**
   * The size of the logo as a ratio of the QR code size. This determines how large the logo will appear within the QR code.
   * The value should be a number between 0 and 1, where 0 means no logo and 1 means the logo will take up the entire QR code (which is not recommended).
   * The default value is 0.4, meaning the logo will take up 40% of the QR code size.
   *
   * @attr logo-size
   * @default 0.4
   */
  @property({ type: Number, attribute: 'logo-size' })
  public logoSize = 0.4;

  /**
   * The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,
   * which helps ensure that the logo does not interfere with the QR code's scannability.
   *
   * @attr logo-margin
   */
  @property({ type: Number, attribute: 'logo-margin' })
  public logoMargin?: number;

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

  /** @internal */
  protected override update(props: PropertyValues<this>): void {
    if (props.has('logoSrc')) {
      this._resolveAspectRatio();
    }

    super.update(props);
  }

  private _resolveAspectRatio(): void {
    if (!this._hasValidLogoSrc()) {
      this._abortHandle.abort();
      this._logoAspectRatio = 1;
      return;
    }

    this._abortHandle.abort();
    const signal = this._abortHandle.signal;

    const img = new Image();
    img.src = this.logoSrc!;

    if (img.complete && img.naturalWidth && img.naturalHeight) {
      this._logoAspectRatio = img.naturalWidth / img.naturalHeight;
      return;
    }

    this._logoAspectRatio = 1;

    img.addEventListener(
      'load',
      () => {
        if (img.naturalWidth && img.naturalHeight) {
          this._logoAspectRatio = img.naturalWidth / img.naturalHeight;
        }
      },
      { once: true, signal }
    );
  }

  /**
   * Determines whether a valid logo source is provided.
   *
   * The method checks if the `logoSrc` property is set and if it does not start with potentially unsafe schemes like 'javascript:' or 'vbscript:'.
   * It also ensures that if the source is a data URI, it must be an image type.
   * This validation helps prevent security risks associated with rendering untrusted content in the QR code.
   */
  private _hasValidLogoSrc(): boolean {
    if (!this.logoSrc) return false;
    const s = this.logoSrc.trim().toLowerCase();
    if (s.startsWith('javascript:') || s.startsWith('vbscript:')) return false;
    if (s.startsWith('data:') && !s.startsWith('data:image/')) return false;
    return true;
  }

  private _pickErrorLevel(area: number): QrErrorCorrectionLevel {
    if (area <= SAFE_AREAS.L) return 'L';
    if (area <= SAFE_AREAS.M) return 'M';
    if (area <= SAFE_AREAS.Q) return 'Q';
    return 'H';
  }

  private _getErrorLevelAndArea(hasLogo: boolean) {
    const userErrorLevel = this.errorLevel;
    const size = this.logoSize;
    const sizeRatio = hasLogo ? clamp(size ?? DEFAULT_SIZE_RATIO, 0, 1) : 0;
    const targetArea = sizeRatio * MAX_SAFE_AREA;

    let errorLevel: QrErrorCorrectionLevel;
    let area: number;

    if (userErrorLevel) {
      errorLevel = userErrorLevel;
      area = Math.min(targetArea, SAFE_AREAS[userErrorLevel]);
    } else if (targetArea > 0) {
      errorLevel = this._pickErrorLevel(targetArea);
      area = targetArea;
    } else {
      errorLevel = 'M';
      area = 0;
    }

    return { errorLevel, area };
  }

  protected override render() {
    if (!this.value) return nothing;

    const hasLogo = this._hasValidLogoSrc();
    const { errorLevel, area } = this._getErrorLevelAndArea(hasLogo);

    const { matrix, size } = generateQRCodeMatrix(
      this.value,
      errorLevel,
      this.version
    );

    const totalModules = size + this.margin * 2;
    const moduleSize = size / totalModules;
    const marginPx = this.margin * moduleSize;
    const svgSize = moduleSize * (size + this.margin * 2);

    const { mask, image, shouldApplyMask } = renderQrMaskAndImage({
      hasLogo,
      src: this.logoSrc!,
      aspectRatio: this._logoAspectRatio,
      area,
      size: this.size,
      margin: this.logoMargin,
      svgSize,
      maskId: this._maskId,
    });

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        width=${this.size}
        height=${this.size}
        viewBox="0 0 ${svgSize} ${svgSize}"
      >
        <title>${this.ariaLabel ?? `QR code: ${this.value}`}</title>

        <rect width=${svgSize} height=${svgSize} fill=${DOT_BACKGROUND} />
        ${mask}
        <g mask=${bindIf(shouldApplyMask, this._maskUrl)}>
          ${renderQrDots({
            matrix,
            moduleSize,
            marginPx,
            dotStyle: this.dotStyle,
          })}
          ${renderQrFinders({
            size,
            moduleSize,
            marginPx,
            dotStyle: this.dotStyle,
            squareStyle: this.squareStyle,
          })}
        </g>
        ${image}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-qr-code': IgcQrCodeComponent;
  }
}
