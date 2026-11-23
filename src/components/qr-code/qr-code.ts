import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { createAbortHandle } from '#internals/abort-handler.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { bindIf } from '#internals/utils/lit.js';
import {
  asNumber,
  clamp,
  numberInRangeInclusive,
} from '#internals/utils/math.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { all } from '#themes/qr-code/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { encodeQR, isValidVersion } from './model/encode.js';
import type { QRCodeMatrixResult } from './model/matrix.js';
import { generateQRCodeMatrix } from './model/matrix.js';
import {
  canCopySvg,
  createSvgSnapshot,
  downloadFile,
  ensureExtension,
  isExportFormat,
  MAX_EXPORT_DIMENSION,
  MIME_TYPES,
  rasterizeSvg,
  serializeSvg,
  snapSvg,
} from './renderer/export.js';
import { resolveCornerDotStyle, snapToPixels } from './renderer/helpers.js';
import { fitLogo, type LogoLayout } from './renderer/logo.js';
import {
  DEFAULT_SIZE_RATIO,
  MAX_SAFE_AREA,
  renderQrAlignment,
  renderQrDots,
  renderQrFinders,
  renderQrGradient,
  renderQrMaskAndImage,
  SAFE_AREAS,
} from './renderer/templates.js';
import { styles } from './themes/qr-code.base.css.js';
import { styles as shared } from './themes/shared/qr-code.common.css.js';
import type {
  QrCodeCopyFormat,
  QrCodeCopyOptions,
  QrCodeExportOptions,
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
  QrErrorCorrectionLevel,
  QrGradient,
  QrLogoShape,
} from './types.js';

const nextId = createIdGenerator('igc-qr-code');

/** The logo layout, and the version to request for it: unset keeps the automatic version. */
type LogoFit = { version?: number; layout: LogoLayout };

/** The smallest `dotScale`. Smaller circle modules fail to decode in large versions. */
const MIN_DOT_SCALE = 0.7;

/** A test, not a lower-cased copy: a data URI can be large. */
const BLOCKED_LOGO_SOURCE = /^\s*(?:javascript:|vbscript:|data:(?!image\/))/i;

/**
 * Generates a QR code from a value and renders it as an SVG image.
 * Properties set the size, the shapes, the error correction level and an optional logo.
 *
 * @element igc-qr-code
 *
 * @cssproperty --ig-qr-code-background - The background color of the QR code. Default is `white`.
 * @cssproperty --ig-qr-code-dark-color - The color of the data modules (dots) and the alignment patterns, and the corner square/dot colors unless overridden below. Default is `black`.
 * @cssproperty --ig-qr-code-corner-square-color - The color of the outer finder-pattern corner squares. Defaults to `--ig-qr-code-dark-color`.
 * @cssproperty --ig-qr-code-corner-dot-color - The color of the inner finder-pattern corner dots. Defaults to `--ig-qr-code-dark-color`.
 * @cssproperty --ig-qr-code-gradient-start - The start color of the `gradient`. Defaults to `--ig-qr-code-dark-color`.
 * @cssproperty --ig-qr-code-gradient-end - The end color of the `gradient`. Defaults to `--ig-qr-code-dark-color`.
 *
 * @csspart background - The background rect of the QR code.
 * @csspart dots - The data modules (dots) of the QR code.
 * @csspart corner-square - The outer corner (finder-pattern) squares of the QR code.
 * @csspart corner-dot - The inner corner (finder-pattern) dots of the QR code.
 * @csspart alignment - The alignment patterns of the QR code, from version 2.
 */
export default class IgcQrCodeComponent extends HostAriaMixin(LitElement) {
  public static readonly tagName = 'igc-qr-code';

  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcQrCodeComponent);
  }

  private readonly _abortHandle = createAbortHandle();
  private readonly _id = nextId();
  private _logoReady: Promise<void> = Promise.resolve();
  private _matrixCache?: {
    value: string;
    errorLevel: QrErrorCorrectionLevel;
    version?: number;
    result: QRCodeMatrixResult | null;
    error?: unknown;
  };
  private _logoFitCache?: { settings: string; fit: LogoFit | null };

  @state()
  private _logoAspectRatio = 1;

  @state()
  private _logoLoadFailed = false;

  /** The error correction level that the application set. */
  private _errorLevel?: QrErrorCorrectionLevel;

  constructor() {
    super();
    addThemingController(this, all);
  }

  /**
   * The value to encode in the QR code. This can be any string, such as a URL, text, or other data.
   * Without a value, the component renders nothing.
   *
   * @attr value
   */
  @property()
  public value?: string;

  /**
   * The version of the QR code to generate, which determines the size and data capacity of the QR code.
   * Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.
   *
   * When it is not set, or it is not an integer from 1 to 40, the component selects the smallest
   * version that holds the value and that stays readable under the logo. When the value does not
   * fit the version, the component renders nothing. On a version that is set, a logo gets smaller
   * to keep the code readable.
   *
   * @attr version
   */
  @property({ type: Number })
  @coercedProperty<number | undefined>({
    transform: ({ value }) => (isValidVersion(value) ? value : undefined),
  })
  public version?: number = undefined;

  /**
   * The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
   * Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.
   *
   * When the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'
   * raises the level to the smallest level that holds the logo. To restore this behavior, set
   * `undefined` or remove the attribute.
   *
   * @attr error-level
   * @default 'M'
   */
  @property({ attribute: 'error-level' })
  public set errorLevel(value: QrErrorCorrectionLevel | null | undefined) {
    this._errorLevel = value || undefined;
  }

  public get errorLevel(): QrErrorCorrectionLevel {
    return this._errorLevel ?? 'M';
  }

  /**
   * The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.
   *
   * Each module covers a whole number of pixels, so the edges stay sharp. The pixels that are
   * left over widen the quiet zone, and the code can be smaller than `size`. An exported image
   * gets whole pixels at its own size.
   *
   * @attr size
   * @default 128
   */
  @property({ type: Number })
  public size = 128;

  /**
   * The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
   * than pixels. This is the blank border area surrounding the code, which helps ensure that it
   * can be properly scanned. It is a minimum: the modules cover whole pixels, and the pixels that
   * are left over make the quiet zone wider.
   *
   * @attr margin
   * @default 4
   */
  @property({ type: Number })
  public margin = 4;

  /**
   * The source URL of an optional logo image at the center of the QR code.
   * The component does not render a logo that fails to load, a `javascript:` or `vbscript:` URL,
   * or a data URI that is not an image.
   *
   * @attr logo-src
   */
  @property({ attribute: 'logo-src' })
  public logoSrc?: string;

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
   * The shape of the logo: 'square', 'circle', 'rounded' or 'squircle'. The shape fills the logo
   * box, so a 'circle' logo with a wide image is an ellipse. The image is clipped to the shape,
   * and the cutout holds only the modules that the shape covers, in part or in full.
   *
   * @attr logo-shape
   * @default 'square'
   */
  @property({ attribute: 'logo-shape' })
  public logoShape: QrLogoShape = 'square';

  /**
   * The style of the data modules (dots) in the QR code. This can be 'square', 'circle',
   * 'rounded', 'squircle', 'diamond', 'plus', 'liquid', 'horizontal-bars' or 'vertical-bars'.
   * 'liquid' is 'rounded' with a smooth fill in the inside corners where modules join. The bar
   * styles draw each run of dark modules in a row or a column as one bar with round ends.
   *
   * The inner dot of each finder-pattern corner uses the same style unless `cornerDotStyle` is
   * set. It draws 'diamond' and 'plus' as 'square', and 'liquid' and the bar styles as
   * 'rounded'.
   *
   * @attr dot-style
   * @default 'square'
   */
  @property({ attribute: 'dot-style' })
  public dotStyle: QrDotStyle = 'square';

  /**
   * The size of each data module, as a ratio of its cell in the module grid. The value is a
   * number from 0.7 to 1. Other values are clamped. A value below 1 leaves a gap between the
   * modules, so 'rounded' modules do not join their neighbors, and 'liquid' draws as 'rounded'.
   * For the bar styles, it sets the thickness of the bars and shortens their ends. The
   * finder-pattern corners keep their full size. A smaller value can make the code harder to
   * scan with a camera.
   *
   * @attr dot-scale
   * @default 1
   */
  @property({ type: Number, attribute: 'dot-scale' })
  public dotScale = 1;

  /**
   * The style of the corner squares in the QR code. This can be 'square', 'circle', 'rounded',
   * 'squircle' or 'leaf'. A 'leaf' has two opposite round corners on the diagonal toward the
   * center of the code. The rings of the alignment patterns use the same style, and a 'leaf'
   * ring there has the shape of the top-left corner square.
   *
   * @attr square-style
   * @default 'square'
   */
  @property({ attribute: 'square-style' })
  public squareStyle: QrCornerSquareStyle = 'square';

  /**
   * The style of the inner dot of each finder-pattern corner. This can be 'square', 'circle',
   * 'rounded', 'squircle' or 'leaf'. When it is not set, the inner dot uses `dotStyle`. The
   * centers of the alignment patterns use the same style.
   *
   * In a 'circle' corner square, a 'square' or 'leaf' dot draws as 'circle', because scanners
   * do not find the pattern reliably with corners in a round ring.
   *
   * @attr corner-dot-style
   */
  @property({ attribute: 'corner-dot-style' })
  public cornerDotStyle?: QrCornerDotStyle;

  /**
   * The gradient of the dark modules: 'linear' or 'radial'. When it is not set, or has another
   * value, the modules have one color. The gradient goes from `--ig-qr-code-gradient-start` to
   * `--ig-qr-code-gradient-end` over the code without its quiet zone. It also paints the corners,
   * unless `--ig-qr-code-corner-square-color` or `--ig-qr-code-corner-dot-color` is set.
   *
   * Keep both colors much darker than the background.
   *
   * @attr gradient
   */
  @property()
  public gradient?: QrGradient;

  /**
   * The angle of a 'linear' gradient in degrees, clockwise. At 0 the gradient goes from left to
   * right, and at 90 from top to bottom.
   *
   * @attr gradient-angle
   * @default 0
   */
  @property({ type: Number, attribute: 'gradient-angle' })
  @coercedProperty<number>({ transform: ({ value }) => asNumber(value, 0) })
  public gradientAngle = 0;

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
    this._logoReady = Promise.resolve();

    if (!this._hasValidLogoSrc()) {
      return;
    }

    const signal = this._abortHandle.signal;
    const img = new Image();
    img.src = this.logoSrc!;

    // On error the natural dimensions are 0, so one rule covers load and error.
    const settle = () => {
      if (img.naturalWidth && img.naturalHeight) {
        this._logoAspectRatio = img.naturalWidth / img.naturalHeight;
      } else {
        this._logoLoadFailed = true;
      }
    };

    if (img.complete) {
      settle();
      return;
    }

    this._logoReady = new Promise<void>((resolve) => {
      const done = () => {
        settle();
        resolve();
      };

      img.addEventListener('load', done, { once: true, signal });
      img.addEventListener('error', done, { once: true, signal });
      signal.addEventListener('abort', () => resolve(), { once: true });
    });
  }

  /**
   * Rejects an empty source, the `javascript:` and `vbscript:` schemes, and a
   * non-image data URI.
   */
  private _hasValidLogoSrc(): boolean {
    return !!this.logoSrc && !BLOCKED_LOGO_SOURCE.test(this.logoSrc);
  }

  /**
   * Returns the smallest level, from 'M' up, that holds a logo of `area`.
   * A logo removes modules, so it does not lower the level below the default.
   */
  private _pickErrorLevel(area: number): QrErrorCorrectionLevel {
    if (area <= SAFE_AREAS.M) return 'M';
    if (area <= SAFE_AREAS.Q) return 'Q';
    return 'H';
  }

  private _getErrorLevelAndArea(hasLogo: boolean): {
    errorLevel: QrErrorCorrectionLevel;
    area: number;
  } {
    const userErrorLevel = this._errorLevel;
    const size = this.logoSize;
    const sizeRatio = hasLogo ? clamp(size ?? DEFAULT_SIZE_RATIO, 0, 1) : 0;
    const targetArea = sizeRatio * MAX_SAFE_AREA;

    if (userErrorLevel) {
      return {
        errorLevel: userErrorLevel,
        area: Math.min(targetArea, SAFE_AREAS[userErrorLevel]),
      };
    }

    return { errorLevel: this._pickErrorLevel(targetArea), area: targetArea };
  }

  /** Returns `dotScale` clamped from `MIN_DOT_SCALE` to 1, or 1 when it is not a number. */
  private _getDotScale(): number {
    return clamp(asNumber(this.dotScale, 1), MIN_DOT_SCALE, 1);
  }

  /**
   * Returns the logo layout, with the version to request when the logo needs a larger one than
   * the value, or `null` when the value cannot be encoded.
   */
  private _getLogoFit(
    value: string,
    errorLevel: QrErrorCorrectionLevel,
    area: number
  ): LogoFit | null {
    const version = this.version;
    const aspectRatio = this._logoAspectRatio;
    const shape = this.logoShape;
    const settings = JSON.stringify([
      value,
      errorLevel,
      version,
      area,
      aspectRatio,
      shape,
    ]);

    if (this._logoFitCache?.settings === settings) {
      return this._logoFitCache.fit;
    }

    let fit: LogoFit | null = null;

    try {
      const smallest = version ?? encodeQR(value, errorLevel).version;
      const fitted = fitLogo(smallest, version !== undefined, {
        errorLevel,
        area,
        aspectRatio,
        shape,
      });
      fit = {
        version: fitted.version === smallest ? version : fitted.version,
        layout: fitted.layout,
      };
    } catch {
      // `_getMatrix()` reports the error.
    }

    this._logoFitCache = { settings, fit };
    return fit;
  }

  /** Returns `null` when the value cannot be encoded. */
  private _getMatrix(
    value: string,
    errorLevel: QrErrorCorrectionLevel,
    version: number | undefined
  ): QRCodeMatrixResult | null {
    const cached = this._matrixCache;
    if (
      cached &&
      cached.value === value &&
      cached.errorLevel === errorLevel &&
      cached.version === version
    ) {
      return cached.result;
    }

    let result: QRCodeMatrixResult | null = null;
    let error: unknown;

    try {
      result = generateQRCodeMatrix(value, errorLevel, version);
    } catch (e) {
      error = e;
      // oxlint-disable-next-line no-console -- an empty render is the only other signal
      console.warn(`<igc-qr-code> cannot encode its value. ${e}`);
    }

    this._matrixCache = { value, errorLevel, version, result, error };
    return result;
  }

  /**
   * Returns a self-contained copy of the rendered SVG with theme colors resolved
   * and the logo inlined. Waits for a pending logo load and render first.
   */
  private async _createSnapshot(): Promise<SVGSVGElement> {
    // The logo load starts in `update()`, so flush a pending update before waiting
    // on it and then let the settled aspect ratio render.
    await this.updateComplete;
    await this._logoReady;
    await this.updateComplete;

    // The SVG is rendered only when there is a value that fits.
    const svg = this.renderRoot.querySelector('svg');
    if (!svg) {
      const error = this.value ? this._matrixCache?.error : undefined;
      throw error ?? new Error('Cannot export an igc-qr-code without a value.');
    }

    return createSvgSnapshot(svg);
  }

  /** Returns `size * scale` in whole pixels. Throws a RangeError when `scale` or the result is out of range. */
  private _getExportDimension(scale: number, size = this.size): number {
    if (!Number.isFinite(scale) || scale <= 0) {
      throw new RangeError(
        'The export scale must be a positive finite number.'
      );
    }

    const dimension = Math.round(size * scale);
    if (!numberInRangeInclusive(dimension, 1, MAX_EXPORT_DIMENSION)) {
      throw new RangeError(
        `The exported image side must be between 1 and ${MAX_EXPORT_DIMENSION} pixels.`
      );
    }

    return dimension;
  }

  /**
   * Serializes a snapshot resized to `scale`, measured from its rendered width, with the
   * modules on whole pixels of the new size.
   */
  private async _serializeSnapshot(
    scale: number
  ): Promise<{ blob: Blob; dimension: number }> {
    const svg = await this._createSnapshot();
    const dimension = this._getExportDimension(
      scale,
      Number(svg.getAttribute('width'))
    );
    svg.setAttribute('width', `${dimension}`);
    svg.setAttribute('height', `${dimension}`);
    snapSvg(svg, dimension, this.margin);
    return { blob: serializeSvg(svg), dimension };
  }

  /* blazorSuppress */
  /**
   * Serializes the QR code to an `image/svg+xml` blob.
   *
   * Theme colors are resolved to plain `fill` attributes and a logo that is not a data URI
   * is fetched and inlined, so the blob renders identically outside the component.
   * A logo that cannot be fetched (for example a cross-origin URL without CORS headers) is omitted.
   *
   * Rejects when there is no `value` or it does not fit the `version`.
   */
  public async toBlob(): Promise<Blob> {
    return serializeSvg(await this._createSnapshot());
  }

  /* blazorSuppress */
  /**
   * Exports the QR code as an image file.
   *
   * The `scale` option multiplies the `size` of the component: a 256px QR code exported
   * with `scale: 2` produces a 512x512 image. When `download` is `true` the browser
   * download dialog opens for the file.
   *
   * Rejects when there is no `value` or it does not fit the `version`, when `format` is not
   * supported, when `scale` is not a positive finite number, or when the resulting image
   * exceeds the maximum canvas size.
   */
  public async toImage(options?: QrCodeExportOptions): Promise<File> {
    const { fileName, format = 'png', scale = 1, download } = options ?? {};

    if (!isExportFormat(format)) {
      throw new TypeError(`Unsupported export format: ${format}.`);
    }

    const { blob: svgBlob, dimension } = await this._serializeSnapshot(scale);
    const blob =
      format === 'svg'
        ? svgBlob
        : await rasterizeSvg(svgBlob, dimension, format);

    const name = ensureExtension(fileName?.trim() || 'qr-code', format);
    const file = new File([blob], name, { type: MIME_TYPES[format] });

    if (download) {
      downloadFile(file);
    }

    return file;
  }

  /* blazorSuppress */
  /**
   * Copies the QR code to the clipboard as an image and resolves to the format that the clipboard
   * received. A browser that cannot copy SVG gets only the PNG.
   *
   * Browsers accept a clipboard write only in a focused document during a user action, so call
   * the method directly from the event handler, with no `await` before it.
   *
   * Rejects when there is no `value` or it does not fit the `version`, when `format` is not
   * supported, when `scale` is not a positive finite number, when the image exceeds the maximum
   * canvas size, when the Clipboard API is not available, or when the browser refuses the write.
   */
  public async copyToClipboard(
    options?: QrCodeCopyOptions
  ): Promise<QrCodeCopyFormat> {
    const { format = 'png', scale = 1 } = options ?? {};

    if (format !== 'png' && format !== 'svg') {
      throw new TypeError(`Unsupported copy format: ${format}.`);
    }

    // Reject a bad scale before the write; the export checks it again at the rendered size.
    this._getExportDimension(scale);

    if (!this.value) {
      throw new Error('Cannot copy an igc-qr-code without a value.');
    }

    // An insecure context has no `navigator.clipboard`.
    const clipboard = navigator.clipboard;
    if (!clipboard) {
      throw new Error('The Clipboard API is not available.');
    }

    const copied = format === 'svg' && canCopySvg() ? 'svg' : 'png';

    // The write starts before the first `await`, while the user action is active,
    // so the images go in as promises.
    const image = this._serializeSnapshot(scale);
    const svg = image.then(({ blob }) => blob);
    const png = image.then(({ blob, dimension }) =>
      rasterizeSvg(blob, dimension, 'png')
    );
    // A refused write never reads the item, so a failed export would go unhandled.
    svg.catch(() => {});
    png.catch(() => {});

    await clipboard.write([
      new ClipboardItem(
        copied === 'svg'
          ? { [MIME_TYPES.svg]: svg, [MIME_TYPES.png]: png }
          : { [MIME_TYPES.png]: png }
      ),
    ]);
    return copied;
  }

  protected override render() {
    if (!this.value) return nothing;

    const hasLogo = this._hasValidLogoSrc() && !this._logoLoadFailed;
    const { errorLevel, area } = this._getErrorLevelAndArea(hasLogo);

    const fit =
      area > 0 ? this._getLogoFit(this.value, errorLevel, area) : null;
    const encoded = this._getMatrix(
      this.value,
      errorLevel,
      fit?.version ?? this.version
    );
    if (!encoded) return nothing;

    const { matrix, size } = encoded;

    const totalModules = size + this.margin * 2;
    const moduleSize = size / totalModules;
    const marginPx = this.margin * moduleSize;
    const svgSize = moduleSize * totalModules;
    const snap = snapToPixels(this.size, size, this.margin);

    const patterns = {
      size,
      moduleSize,
      marginPx,
      squareStyle: this.squareStyle,
      dotStyle: resolveCornerDotStyle(
        this.squareStyle,
        this.cornerDotStyle,
        this.dotStyle
      ),
    };

    const maskId = `${this._id}-mask`;
    const { mask, image, shouldApplyMask } = renderQrMaskAndImage({
      src: this.logoSrc!,
      layout: fit?.layout,
      unitSize: (this.size / svgSize) * (snap?.scale ?? 1),
      margin: this.logoMargin,
      svgSize,
      moduleSize,
      marginPx,
      maskId,
      clipId: `${this._id}-clip`,
      transform: snap?.transform,
    });

    const gradientId = `${this._id}-gradient`;
    const hasGradient =
      this.gradient === 'linear' || this.gradient === 'radial';
    const gradient = hasGradient
      ? renderQrGradient({
          id: gradientId,
          gradient: this.gradient!,
          angle: this.gradientAngle,
          svgSize,
          marginPx,
        })
      : nothing;

    return html`
      <svg
        ${ariaBindings(hostAria(this, { ownLabel: true }))}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        width=${this.size}
        height=${this.size}
        viewBox="0 0 ${svgSize} ${svgSize}"
      >
        <title>${this.ariaLabel ?? `QR code: ${this.value}`}</title>

        <rect part="background" width=${svgSize} height=${svgSize} />
        ${mask} ${gradient}
        <g
          mask=${bindIf(shouldApplyMask, `url(#${maskId})`)}
          transform=${ifDefined(snap?.transform)}
          style=${styleMap({
            '--_paint': hasGradient ? `url(#${gradientId})` : undefined,
          })}
        >
          ${renderQrDots({
            matrix,
            moduleSize,
            marginPx,
            dotStyle: this.dotStyle,
            dotScale: this._getDotScale(),
            cutout: shouldApplyMask ? fit?.layout.cutout : undefined,
          })}
          ${renderQrAlignment(patterns)} ${renderQrFinders(patterns)}
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
