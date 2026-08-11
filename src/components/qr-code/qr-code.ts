import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createAbortHandle } from '#internals/abort-handler.js';
import { registerComponent } from '#internals/definitions/register.js';
import { bindIf } from '#internals/utils/lit.js';
import { clamp } from '#internals/utils/math.js';
import { nanoid } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { QRCodeMatrixResult } from './model/matrix.js';
import { generateQRCodeMatrix } from './model/matrix.js';
import {
  DEFAULT_SIZE_RATIO,
  MAX_SAFE_AREA,
  SAFE_AREAS,
} from './renderer/constants.js';
import { renderQrFinders } from './renderer/corner.js';
import { renderQrDots } from './renderer/dots.js';
import { renderQrMaskAndImage } from './renderer/image.js';
import { styles } from './themes/qr-code.base.css.js';
import { styles as shared } from './themes/shared/qr-code.common.css.js';
import { all } from './themes/themes.js';
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
 * @cssproperty --ig-qr-code-background - The background color of the QR code. Default is `white`.
 * @cssproperty --ig-qr-code-dark-color - The color of the data modules (dots), and the corner square/dot colors unless overridden below. Default is `black`.
 * @cssproperty --ig-qr-code-corner-square-color - The color of the outer finder-pattern corner squares. Defaults to `--ig-qr-code-dark-color`.
 * @cssproperty --ig-qr-code-corner-dot-color - The color of the inner finder-pattern corner dots. Defaults to `--ig-qr-code-dark-color`.
 *
 * @csspart background - The background rect of the QR code.
 * @csspart dots - The data modules (dots) of the QR code.
 * @csspart corner-square - The outer corner (finder-pattern) squares of the QR code.
 * @csspart corner-dot - The inner corner (finder-pattern) dots of the QR code.
 */
export default class IgcQrCodeComponent extends LitElement {
  public static readonly tagName = 'igc-qr-code';

  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcQrCodeComponent);
  }

  private readonly _abortHandle = createAbortHandle();
  private readonly _maskId = nanoid(8);
  private readonly _maskUrl = `url(#${this._maskId})`;
  private _matrixCache?: {
    value: string;
    errorLevel: QrErrorCorrectionLevel;
    version?: number;
    result: QRCodeMatrixResult;
  };

  @state()
  private _logoAspectRatio = 1;

  @state()
  private _logoLoadFailed = false;

  constructor() {
    super();
    addThemingController(this, all);
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
   * The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
   * than pixels. This is the blank border area surrounding the code, which helps ensure that it
   * can be properly scanned.
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
   * The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo
   * while the QR code remains scannable (up to 9% of the code's area, at the highest error
   * correction level). The value should be a number between 0 and 1, where 0 means no logo and 1
   * means the logo will cover the full safe area (not the entire QR code).
   * The default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).
   *
   * When `error-level` is not explicitly set, the smallest error correction level that can
   * accommodate the requested logo size is chosen automatically.
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
   * The style of the data modules (dots) in the QR code, and of the inner dot of each finder-pattern
   * corner. This can be 'square', 'circle', or 'rounded'.
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
    this._abortHandle.abort();
    this._logoLoadFailed = false;
    this._logoAspectRatio = 1;

    if (!this._hasValidLogoSrc()) {
      return;
    }

    const signal = this._abortHandle.signal;
    const img = new Image();
    img.src = this.logoSrc!;

    if (img.complete) {
      if (img.naturalWidth && img.naturalHeight) {
        this._logoAspectRatio = img.naturalWidth / img.naturalHeight;
      } else {
        this._logoLoadFailed = true;
      }
      return;
    }

    img.addEventListener(
      'load',
      () => {
        if (img.naturalWidth && img.naturalHeight) {
          this._logoAspectRatio = img.naturalWidth / img.naturalHeight;
        } else {
          this._logoLoadFailed = true;
        }
      },
      { once: true, signal }
    );

    img.addEventListener(
      'error',
      () => {
        this._logoLoadFailed = true;
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

  private _getMatrix(
    value: string,
    errorLevel: QrErrorCorrectionLevel
  ): QRCodeMatrixResult {
    const cached = this._matrixCache;
    if (
      cached &&
      cached.value === value &&
      cached.errorLevel === errorLevel &&
      cached.version === this.version
    ) {
      return cached.result;
    }

    const result = generateQRCodeMatrix(value, errorLevel, this.version);
    this._matrixCache = { value, errorLevel, version: this.version, result };
    return result;
  }

  protected override render() {
    if (!this.value) return nothing;

    const hasLogo = this._hasValidLogoSrc() && !this._logoLoadFailed;
    const { errorLevel, area } = this._getErrorLevelAndArea(hasLogo);

    const { matrix, size } = this._getMatrix(this.value, errorLevel);

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

        <rect part="background" width=${svgSize} height=${svgSize} />
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
