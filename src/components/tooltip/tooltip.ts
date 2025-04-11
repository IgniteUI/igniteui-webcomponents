import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { EaseOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeOut } from '../../animations/presets/fade/index.js';
import { scaleInCenter } from '../../animations/presets/scale/index.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, getElementByIdFromRoot, isString } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';
import { styles as shared } from './themes/shared/tooltip.common.css';
import { all } from './themes/themes.js';
import { styles } from './themes/tooltip.base.css.js';
import { addTooltipController } from './tooltip-event-controller.js';

export interface IgcTooltipComponentEventMap {
  igcOpening: CustomEvent<Element | null>;
  igcOpened: CustomEvent<Element | null>;
  igcClosing: CustomEvent<Element | null>;
  igcClosed: CustomEvent<Element | null>;
}

type TooltipStateOptions = {
  show: boolean;
  withDelay?: boolean;
  withEvents?: boolean;
};

/**
 * @element igc-tooltip
 *
 * @slot - default slot
 * @slot close-button - Slot for custom sticky-mode close action (e.g., an icon/button).
 *
 * @fires igcOpening - Emitted before the tooltip begins to open. Can be canceled to prevent opening.
 * @fires igcOpened - Emitted after the tooltip has successfully opened and is visible.
 * @fires igcClosing - Emitted before the tooltip begins to close. Can be canceled to prevent closing.
 * @fires igcClosed - Emitted after the tooltip has been fully removed from view.
 */
@themes(all)
export default class IgcTooltipComponent extends EventEmitterMixin<
  IgcTooltipComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tooltip';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcTooltipComponent,
      IgcPopoverComponent,
      IgcIconComponent
    );
  }

  private readonly _internals: ElementInternals;

  private readonly _controller = addTooltipController(this, {
    onShow: this._showOnInteraction,
    onHide: this._hideOnInteraction,
    onEscape: this._hideOnEscape,
  });

  private readonly _containerRef = createRef<HTMLElement>();
  private readonly _player = addAnimationController(this, this._containerRef);

  private readonly _showAnimation = scaleInCenter({
    duration: 150,
    easing: EaseOut.Quad,
  });

  private readonly _hideAnimation = fadeOut({
    duration: 75,
    easing: EaseOut.Sine,
  });

  private _timeoutId?: number;
  private _autoHideDelay = 180;
  private _showDelay = 200;
  private _hideDelay = 300;

  @query('#arrow')
  private _arrowElement!: HTMLElement;

  /**
   * Whether the tooltip is showing.
   *
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public set open(value: boolean) {
    this._controller.open = value;
  }

  public get open(): boolean {
    return this._controller.open;
  }

  /**
   * Whether to disable the rendering of the arrow indicator for the tooltip.
   *
   * @attr disable-arrow
   * @default false
   */
  @property({ attribute: 'disable-arrow', type: Boolean, reflect: true })
  public disableArrow = false;

  /**
   * Improves positioning for inline based elements, such as links.
   *
   * @attr inline
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public inline = false;

  /**
   * The offset of the tooltip from the anchor in pixels.
   *
   * @attr offset
   * @default 6
   */
  @property({ type: Number })
  public offset = 6;

  /**
   * Where to place the floating element relative to the parent anchor element.
   *
   * @attr placement
   * @default top
   */
  @property()
  public placement: IgcPlacement = 'top';

  /**
   * An element instance or an IDREF to use as the anchor for the tooltip.
   *
   * @attr anchor
   */
  @property()
  public anchor?: Element | string;

  /**
   * Which event triggers will show the tooltip.
   * Expects a comma separate string of different event triggers.
   *
   * @attr show-triggers
   * @default pointerenter
   */
  @property({ attribute: 'show-triggers' })
  public set showTriggers(value: string) {
    this._controller.showTriggers = value;
  }

  public get showTriggers(): string {
    return this._controller.showTriggers;
  }

  /**
   * Which event triggers will hide the tooltip.
   * Expects a comma separate string of different event triggers.
   *
   * @attr hide-triggers
   * @default pointerleave
   */
  @property({ attribute: 'hide-triggers' })
  public set hideTriggers(value: string) {
    this._controller.hideTriggers = value;
  }

  public get hideTriggers(): string {
    return this._controller.hideTriggers;
  }

  /**
   * Specifies the number of milliseconds that should pass before showing the tooltip.
   *
   * @attr show-delay
   * @default 200
   */
  @property({ attribute: 'show-delay', type: Number })
  public set showDelay(value: number) {
    this._showDelay = Math.max(0, asNumber(value));
  }

  public get showDelay(): number {
    return this._showDelay;
  }

  /**
   * Specifies the number of milliseconds that should pass before hiding the tooltip.
   *
   * @attr hide-delay
   * @default 300
   */
  @property({ attribute: 'hide-delay', type: Number })
  public set hideDelay(value: number) {
    this._hideDelay = Math.max(0, asNumber(value));
  }

  public get hideDelay(): number {
    return this._hideDelay;
  }

  /**
   * Specifies a plain text as tooltip content.
   *
   * @attr message
   */
  @property()
  public message = '';

  /**
   * Specifies if the tooltip remains visible until the user closes it via the close button or Esc key.
   *
   * @attr sticky
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public sticky = false;

  constructor() {
    super();

    this._internals = this.attachInternals();
    this._internals.role = this.sticky ? 'status' : 'tooltip';
    this._internals.ariaAtomic = 'true';
    this._internals.ariaLive = 'polite';
  }

  protected override firstUpdated(): void {
    this._controller.anchor ??= this.previousElementSibling;

    if (this.open) {
      this.updateComplete.then(() => {
        this._player.playExclusive(this._showAnimation);
        this.requestUpdate();
      });
    }
  }

  @watch('anchor')
  protected _anchorChanged(): void {
    const target = isString(this.anchor)
      ? getElementByIdFromRoot(this, this.anchor)
      : this.anchor;

    this._controller.anchor = target;
  }

  @watch('sticky')
  protected _onStickyChange(): void {
    this._internals.role = this.sticky ? 'status' : 'tooltip';
  }

  private _emitEvent(name: keyof IgcTooltipComponentEventMap): boolean {
    return this.emitEvent(name, {
      cancelable: name === 'igcOpening' || name === 'igcClosing',
      detail: this._controller.anchor,
    });
  }

  private async _applyTooltipState({
    show,
    withDelay = false,
    withEvents = false,
  }: TooltipStateOptions): Promise<boolean> {
    if (show === this.open) {
      return false;
    }

    if (withEvents && !this._emitEvent(show ? 'igcOpening' : 'igcClosing')) {
      return false;
    }

    const commitStateChange = async () => {
      if (show) {
        this.open = true;
      }

      // Make the tooltip ignore most interactions while the animation
      // is running. In the rare case when the popover overlaps its anchor
      // this will prevent looping between the anchor and tooltip handlers.
      this.inert = true;

      const animationComplete = await this._player.playExclusive(
        show ? this._showAnimation : this._hideAnimation
      );

      this.inert = false;
      this.open = show;

      if (animationComplete && withEvents) {
        this._emitEvent(show ? 'igcOpened' : 'igcClosed');
      }

      return animationComplete;
    };

    if (withDelay) {
      clearTimeout(this._timeoutId);
      return new Promise(() => {
        this._timeoutId = setTimeout(
          async () => await commitStateChange(),
          show ? this.showDelay : this.hideDelay
        );
      });
    }

    return commitStateChange();
  }

  /** Shows the tooltip if not already showing. */
  public show(): Promise<boolean> {
    return this._applyTooltipState({ show: true });
  }

  /** Hides the tooltip if not already hidden. */
  public hide(): Promise<boolean> {
    return this._applyTooltipState({ show: false });
  }

  /** Toggles the tooltip between shown/hidden state */
  public toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  protected _showWithEvent(): Promise<boolean> {
    return this._applyTooltipState({
      show: true,
      withDelay: true,
      withEvents: true,
    });
  }

  protected _hideWithEvent(): Promise<boolean> {
    return this._applyTooltipState({
      show: false,
      withDelay: true,
      withEvents: true,
    });
  }

  private _showOnInteraction(): void {
    clearTimeout(this._timeoutId);
    this._player.stopAll();
    this._showWithEvent();
  }

  private _runAutoHide(): void {
    clearTimeout(this._timeoutId);
    this._player.stopAll();

    this._timeoutId = setTimeout(
      () => this._hideWithEvent(),
      this._autoHideDelay
    );
  }

  private _hideOnInteraction(): void {
    if (!this.sticky) {
      this._runAutoHide();
    }
  }

  private async _hideOnEscape(): Promise<void> {
    await this.hide();
    this._emitEvent('igcClosed');
  }

  protected override render() {
    return html`
      <igc-popover
        .inert=${!this.open}
        .placement=${this.placement}
        .offset=${this.offset}
        .anchor=${this._controller.anchor ?? undefined}
        .arrow=${this.disableArrow ? null : this._arrowElement}
        .shiftPadding=${8}
        ?open=${this.open}
        ?inline=${this.inline}
        flip
        shift
      >
        <div ${ref(this._containerRef)} part="base">
          <slot>${this.message ? html`${this.message}` : nothing}</slot>
          ${this.sticky
            ? html`
                <slot name="close-button" @click=${this._runAutoHide}>
                  <igc-icon
                    name="input_clear"
                    collection="default"
                    aria-hidden="true"
                  ></igc-icon>
                </slot>
              `
            : nothing}
          ${this.disableArrow ? nothing : html`<div id="arrow"></div>`}
        </div>
      </igc-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tooltip': IgcTooltipComponent;
  }
}
