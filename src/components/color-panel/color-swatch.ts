import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { colorPanelContext } from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { ColorModel, type ColorKey, colorKey } from '../color-picker/model.js';
import {
  parseContextColor,
  resolveSwatch,
  swatchKey,
  VAR_REFERENCE,
} from './common.js';
import { styles } from './themes/color-swatch.base.css.js';

/**
 * A color option of a color panel. A color panel and a color picker show
 * their swatch children in their swatch list.
 *
 * A swatch without a `color` is the no-color swatch. A pick of it clears the
 * value.
 *
 * @element igc-color-swatch
 *
 * @csspart base - The color fill of the swatch.
 *
 * @cssstate ig-selected - The color of the swatch is the value of the panel.
 */
export default class IgcColorSwatchComponent extends LitElement {
  public static readonly tagName = 'igc-color-swatch';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcColorSwatchComponent);
  }

  //#region Internal state and properties

  private readonly _panel = addAsyncContextConsumer(
    this,
    colorPanelContext,
    (panel) => {
      this.requestUpdate();
      panel.refreshSwatches();
    }
  );

  // The panel sets `ariaSelected` and the selected state through
  // `internalsOf()`.
  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'option', ariaSelected: 'false' },
    reflectRole: true,
    reflectLabel: true,
  });

  /** The `color` that {@link _key} comes from. */
  private _resolvedColor?: string;

  /** Whether the color has a `var()`, which can resolve to a new color. */
  private _contextual = false;

  private _key: ColorKey | null = null;

  /** The resolved color. A no-color swatch and an invalid color have none. */
  private _model?: ColorModel;

  private get _color(): string {
    return this.color?.trim() ?? '';
  }

  private get _accessibleName(): string {
    const panel = this._panel.value;

    if (this.label) return this.label;
    if (!this._color) return panel?.noColorLabel() ?? '';

    return (this._model && panel?.swatchName(this._model)) || this._color;
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The color of the swatch. Accepts any CSS color, also with `var()`, which
   * resolves from the custom properties of the swatch. A pick writes the
   * resolved color.
   *
   * Without a color, the swatch is the no-color swatch.
   *
   * @attr color
   */
  @property()
  public color?: string;

  /**
   * The accessible name of the swatch. Without it, the name is the color
   * name, such as "vibrant red", or "No color" for the no-color swatch.
   *
   * @attr label
   */
  @property()
  public label?: string;

  //#endregion

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._panel.value?.refreshSwatches();
  }

  protected override willUpdate(): void {
    this._syncName();
  }

  protected override updated(props: PropertyValues<this>): void {
    // A no-color swatch has no `color` in the first changed properties.
    if (this._resolvedColor === undefined || props.has('color')) {
      this[resolveSwatch]();
      this._panel.value?.refreshSwatches();
    }
  }

  //#endregion

  //#region Internal API

  /** @internal */
  public get [swatchKey](): ColorKey | null {
    return this._key;
  }

  /** @internal */
  public [resolveSwatch](): void {
    const color = this._color;

    if (color === this._resolvedColor && !this._contextual) {
      return;
    }

    this._resolvedColor = color;
    this._contextual = false;

    if (!color) {
      this._setModel();
      return;
    }

    let model = ColorModel.parse(color);

    // The parser rejects `var()`. It resolves from the swatch.
    if (model.isEmpty && VAR_REFERENCE.test(color)) {
      this._contextual = true;
      model = parseContextColor(this, color);
    }

    this._setModel(model.isEmpty ? undefined : model);
  }

  /** Names the swatch at once: the model changes after the render. */
  private _setModel(model?: ColorModel): void {
    this._model = model;

    if (model) {
      this._key = colorKey(model);
    } else {
      // An invalid color has no key. The no-color swatch has the empty key.
      this._key = this._color ? null : '';
    }

    this._syncName();
  }

  private _syncName(): void {
    this._internals.setARIA({ ariaLabel: this._accessibleName });
  }

  //#endregion

  protected override render() {
    const color = this._color;

    return html`
      <span
        part="base"
        ?data-empty=${!color}
        style=${styleMap({ '--_color': color || undefined })}
      ></span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-swatch': IgcColorSwatchComponent;
  }
}
