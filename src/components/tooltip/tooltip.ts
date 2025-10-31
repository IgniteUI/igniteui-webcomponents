import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { EaseOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeOut } from '../../animations/presets/fade/index.js';
import { scaleInCenter } from '../../animations/presets/scale/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, isLTR } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import { addTooltipController, TooltipRegexes } from './controller.js';
import { styles as shared } from './themes/shared/tooltip.common.css.js';
import { all } from './themes/themes.js';
import { styles } from './themes/tooltip.base.css.js';

export interface IgcTooltipComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

type TooltipStateOptions = {
  show: boolean;
  withDelay?: boolean;
  withEvents?: boolean;
};

/**
 * Provides a way to display supplementary information related to an element when a user interacts with it (e.g., hover, focus).
 * It offers features such as placement customization, delays, sticky mode, and animations.
 *
 * @element igc-tooltip
 *
 * @slot - Default slot of the tooltip component.
 * @slot close-button - Slot for custom sticky-mode close action (e.g., an icon/button).
 *
 * @csspart base - The wrapping container of the tooltip content.
 *
 * @fires igcOpening - Emitted before the tooltip begins to open. Can be canceled to prevent opening.
 * @fires igcOpened - Emitted after the tooltip has successfully opened and is visible.
 * @fires igcClosing - Emitted before the tooltip begins to close. Can be canceled to prevent closing.
 * @fires igcClosed - Emitted after the tooltip has been fully removed from view.
 */
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

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'tooltip',
      ariaAtomic: 'true',
      ariaLive: 'polite',
    },
  });

  private readonly _controller = addTooltipController(this, {
    onShow: this._showOnInteraction,
    onHide: this._hideOnInteraction,
    onEscape: this._hideOnEscape,
    onClick: this._stopTimeoutAndAnimation,
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

  @query('slot:not([name])')
  private _defaultSlot!: HTMLSlotElement;

  @state()
  private _hasCustomContent = false;

  private _initialCheckDone = false;

  private get _arrowOffset() {
    if (this.placement.includes('-')) {
      // Horizontal start | end placement

      if (TooltipRegexes.horizontalStart.test(this.placement)) {
        return -8;
      }

      if (TooltipRegexes.horizontalEnd.test(this.placement)) {
        return 8;
      }

      // Vertical start | end placement

      if (TooltipRegexes.start.test(this.placement)) {
        return isLTR(this) ? -8 : 8;
      }

      if (TooltipRegexes.end.test(this.placement)) {
        return isLTR(this) ? 8 : -8;
      }
    }

    return 0;
  }

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
   * @deprecated since 6.1.0. Use `with-arrow` to control the behavior of the tooltip arrow.
   * @attr disable-arrow
   * @default false
   */
  @property({ type: Boolean, attribute: 'disable-arrow' })
  public set disableArrow(value: boolean) {
    this.withArrow = !value;
  }

  /**
   * @deprecated since 6.1.0. Use `with-arrow` to control the behavior of the tooltip arrow.
   */
  public get disableArrow(): boolean {
    return !this.withArrow;
  }

  /**
   * Whether to render an arrow indicator for the tooltip.
   *
   * @attr with-arrow
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'with-arrow' })
  public withArrow = false;

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
   * @default bottom
   */
  @property()
  public placement: PopoverPlacement = 'bottom';

  /**
   * An element instance or an IDREF to use as the anchor for the tooltip.
   *
   * @remarks
   * Trying to bind to an IDREF that does not exist in the current DOM root at will not work.
   * In such scenarios, it is better to get a DOM reference and pass it to the tooltip instance.
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
   * @default pointerleave, click
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
    addThemingController(this, all);
  }

  protected override firstUpdated(): void {
    if (this.open) {
      this.updateComplete.then(() => {
        this._player.playExclusive(this._showAnimation);
        this.requestUpdate();
      });
    }
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    // Check on first update when slot becomes available, or when message changes
    if (!this._initialCheckDone || changedProperties.has('message')) {
      this._initialCheckDone = true;
      this.updateComplete.then(() => this._checkForCustomContent());
    }
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('anchor')) {
      this._controller.resolveAnchor(this.anchor);
    }

    if (changedProperties.has('sticky')) {
      this._internals.setARIA({ role: this.sticky ? 'status' : 'tooltip' });
    }
  }

  private _emitEvent(name: keyof IgcTooltipComponentEventMap): boolean {
    return this.emitEvent(name, {
      cancelable: name === 'igcOpening' || name === 'igcClosing',
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

  /**
   *  Shows the tooltip if not already showing.
   *  If a target is provided, sets it as a transient anchor.
   */
  public async show(target?: Element | string): Promise<boolean> {
    if (target) {
      this._stopTimeoutAndAnimation();
      this._controller.setAnchor(target, true);
    }

    return await this._applyTooltipState({ show: true });
  }

  /** Hides the tooltip if not already hidden. */
  public async hide(): Promise<boolean> {
    return await this._applyTooltipState({ show: false });
  }

  /** Toggles the tooltip between shown/hidden state */
  public async toggle(): Promise<boolean> {
    return await (this.open ? this.hide() : this.show());
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
    this._stopTimeoutAndAnimation();
    this._showWithEvent();
  }

  private _stopTimeoutAndAnimation(): void {
    clearTimeout(this._timeoutId);
    this._player.stopAll();
  }

  private _setAutoHide(): void {
    this._stopTimeoutAndAnimation();

    this._timeoutId = setTimeout(
      this._hideWithEvent.bind(this),
      this._autoHideDelay
    );
  }

  private _hideOnInteraction(): void {
    if (!this.sticky) {
      this._setAutoHide();
    }
  }

  private async _hideOnEscape(): Promise<void> {
    await this.hide();
    this._emitEvent('igcClosed');
  }

  private _checkForCustomContent(): void {
    if (!this._defaultSlot) {
      this._hasCustomContent = false;
      return;
    }
    const assignedNodes = this._defaultSlot.assignedNodes({ flatten: true });
    // If there are assigned nodes, we have custom content
    this._hasCustomContent = assignedNodes.length > 0;
  }

  protected override render() {
    const classes = {
      'simple-text': !this._hasCustomContent,
    };

    return html`
      <igc-popover
        .inert=${!this.open}
        .placement=${this.placement}
        .offset=${this.offset}
        .anchor=${this._controller.anchor ?? undefined}
        .arrow=${this.withArrow ? this._arrowElement : null}
        .arrowOffset=${this._arrowOffset}
        .shiftPadding=${8}
        ?open=${this.open}
        flip
        shift
      >
        <div ${ref(this._containerRef)} part="base" class=${classMap(classes)}>
          <slot @slotchange=${this._checkForCustomContent}
            >${this.message}</slot
          >
          ${this.sticky
            ? html`
                <slot name="close-button" @click=${this._setAutoHide}>
                  <igc-icon
                    name="input_clear"
                    collection="default"
                    aria-hidden="true"
                  ></igc-icon>
                </slot>
              `
            : nothing}
          ${this.withArrow ? html`<div id="arrow"></div>` : nothing}
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
