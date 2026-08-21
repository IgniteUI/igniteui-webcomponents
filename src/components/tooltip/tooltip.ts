import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { EaseOut } from '#animations/easings.js';
import { addAnimationController } from '#animations/player.js';
import { fadeOut } from '#animations/presets/fade/index.js';
import { scaleInCenter } from '#animations/presets/scale/index.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { isElement, isLTR } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import { addTooltipController } from './controller.js';
import { styles as shared } from './themes/shared/tooltip.common.css.js';
import { all } from './themes/themes.js';
import { styles } from './themes/tooltip.base.css.js';

export interface IgcTooltipComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/** Additional offset applied to the arrow element for aligned placements. */
const ARROW_OFFSET = 8;

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
 * @csspart simple-text - The container where the message property of the tooltip is rendered.
 * @csspart close-button - The default sticky-mode close button.
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
    onShow: () => this._showOnInteraction(),
    onHide: () => this._hideOnInteraction(),
    onEscape: () => this._hideOnEscape(),
    onClick: () => this._cancelTransition(),
    // The controller dropped the anchor the tooltip is bound to.
    onReset: () => this._cancelTransition(false),
  });

  private readonly _containerRef = createRef<HTMLElement>();
  private readonly _player = addAnimationController(this, this._containerRef);
  private readonly _slots = addSlotController(this, {
    slots: setSlots('close-button'),
  });

  private readonly _showAnimation = scaleInCenter({
    duration: 150,
    easing: EaseOut.Quad,
  });

  private readonly _hideAnimation = fadeOut({
    duration: 75,
    easing: EaseOut.Sine,
  });

  /** The queued, not yet committed transition, if a delay is in effect. */
  private _pending?: {
    timer: ReturnType<typeof setTimeout>;
    resolve: (value: boolean) => void;
  };

  /** A commit that finishes with a stale id has been superseded. */
  private _transitionId = 0;

  private _animating = false;

  /**
   * The state the tooltip is heading to. A show commits `open` upfront so the
   * popover renders; a hide commits it only once its animation is done.
   */
  private _requestedState = false;

  private _showDelay = 200;
  private _hideDelay = 300;

  @query('igc-popover', true)
  private readonly _popover!: IgcPopoverComponent;

  @query('#arrow')
  private readonly _arrowElement!: HTMLElement;

  private get _arrowOffset(): number {
    const [side, alignment] = this.placement.split('-');

    if (!alignment) {
      return 0;
    }

    const offset = alignment === 'start' ? -ARROW_OFFSET : ARROW_OFFSET;
    const isHorizontal = side === 'left' || side === 'right';

    // Only the vertical placements follow the writing direction.
    return isHorizontal || isLTR(this) ? offset : -offset;
  }

  /**
   * Whether the consumer projected anything into the default slot. Queried
   * without flattening, which would report the rendered `message` - the slot's
   * own fallback content - as if it came from the consumer.
   */
  private get _hasProjectedContent(): boolean {
    return this._slots
      .getAssignedNodes('[default]')
      .some(
        (node) =>
          isElement(node) ||
          (node.nodeType === Node.TEXT_NODE &&
            Boolean(node.textContent?.trim()))
      );
  }

  /**
   * Whether the tooltip is showing.
   *
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public set open(value: boolean) {
    this._requestedState = value;
    this._controller.open = value;
  }

  public get open(): boolean {
    return this._controller.open;
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
   * Where to place the tooltip relative to its anchor element.
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
   * Trying to bind to an IDREF that does not exist in the current DOM root will not work.
   * In such scenarios, it is better to get a DOM reference and pass it to the tooltip instance.
   *
   * @attr anchor
   */
  @property()
  public anchor?: Element | string;

  /**
   * Which event triggers will show the tooltip.
   * Expects a comma separated string of different event triggers.
   *
   * @attr show-triggers
   * @default pointerenter,focusin
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
   * Expects a comma separated string of different event triggers.
   *
   * @attr hide-triggers
   * @default pointerleave,click,focusout
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
   * Specifies plain text as the tooltip content.
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
      });
    }
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    // The arrow is created by the render that just committed, so the popover
    // can only be handed it afterwards.
    if (changedProperties.has('withArrow')) {
      this._popover.arrow = this.withArrow ? this._arrowElement : null;
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

  /**
   * Invalidates the queued and/or running transition, resolving a delayed one
   * with `false`. The caller must settle the state it left behind.
   *
   * @returns Whether the aborted transition was mid-animation.
   */
  private _abortTransition(): boolean {
    const wasAnimating = this._animating;

    this._transitionId++;
    this._animating = false;

    clearTimeout(this._pending?.timer);
    this._pending?.resolve(false);
    this._pending = undefined;

    return wasAnimating;
  }

  /** Lands the tooltip on `state` after its transition was aborted. */
  private _settleState(state: boolean, wasAnimating: boolean): void {
    this._requestedState = state;

    if (wasAnimating) {
      this._player.cancelAll();
      this.inert = false;
    }

    // Via the accessor - it drives the reflection and the render.
    if (this.open !== state) {
      this.open = state;
    }
  }

  /**
   * Drops a queued or running transition and settles on `state`, by default
   * the state the tooltip is already committed to.
   */
  private _cancelTransition(state = this.open): void {
    this._settleState(state, this._abortTransition());
  }

  private async _applyTooltipState({
    show,
    withDelay = false,
    withEvents = false,
  }: TooltipStateOptions): Promise<boolean> {
    if (show === this._requestedState) {
      return false;
    }

    // Supersede whatever transition is queued or already running.
    const wasAnimating = this._abortTransition();
    this._requestedState = show;

    // A superseded transition that never animated leaves the tooltip already
    // in the requested state.
    if (show === this.open && !wasAnimating) {
      return false;
    }

    // Vetoed - the first guard proves we were at `!show`.
    if (withEvents && !this._emitEvent(show ? 'igcOpening' : 'igcClosing')) {
      this._settleState(!show, wasAnimating);
      return false;
    }

    const id = this._transitionId;

    const commitStateChange = async () => {
      if (show) {
        this.open = true;
      }

      // Make the tooltip ignore most interactions while the animation
      // is running. In the rare case when the popover overlaps its anchor
      // this will prevent looping between the anchor and tooltip handlers.
      this.inert = true;
      this._animating = true;

      const animationComplete = await this._player.playExclusive(
        show ? this._showAnimation : this._hideAnimation
      );

      // Superseded while animating - the newer transition owns the state now.
      if (id !== this._transitionId) {
        return false;
      }

      this._animating = false;
      this.inert = false;
      this.open = show;

      if (animationComplete && withEvents) {
        this._emitEvent(show ? 'igcOpened' : 'igcClosed');
      }

      return animationComplete;
    };

    if (!withDelay) {
      return commitStateChange();
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(
        () => {
          this._pending = undefined;
          commitStateChange().then(resolve);
        },
        show ? this.showDelay : this.hideDelay
      );

      this._pending = { timer, resolve };
    });
  }

  /**
   * Shows the tooltip if not already showing.
   * If a target is provided, sets it as a transient anchor.
   *
   * @remarks
   * Bypasses `showDelay` and does not emit `igcOpening`/`igcOpened`.
   * Resolves with whether the tooltip transitioned to a shown state.
   */
  public async show(target?: Element | string): Promise<boolean> {
    if (target) {
      this._cancelTransition();
      this._controller.setAnchor(target, true);
    }

    return await this._applyTooltipState({ show: true });
  }

  /**
   * Hides the tooltip if not already hidden.
   *
   * @remarks
   * Bypasses `hideDelay` and does not emit `igcClosing`/`igcClosed`.
   * Resolves with whether the tooltip transitioned to a hidden state.
   */
  public async hide(): Promise<boolean> {
    return await this._applyTooltipState({ show: false });
  }

  /**
   * Toggles the tooltip between shown/hidden state.
   *
   * @remarks
   * Resolves with whether the tooltip transitioned to the opposite state.
   */
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
    this._cancelTransition();
    this._showWithEvent();
  }

  private _hideOnInteraction(): void {
    if (!this.sticky) {
      this._hideWithEvent();
    }
  }

  /** Sticky mode close action - closes without waiting out `hideDelay`. */
  private _hideOnCloseClick(): void {
    this._applyTooltipState({ show: false, withEvents: true });
  }

  private async _hideOnEscape(): Promise<void> {
    // `hide()` is silent, so announce the close here - if there was one.
    if (await this.hide()) {
      this._emitEvent('igcClosed');
    }
  }

  protected override render() {
    const parts = {
      base: true,
      'simple-text': !this._hasProjectedContent,
    };

    return html`
      <igc-popover
        .inert=${!this.open}
        .placement=${this.placement}
        .offset=${this.offset}
        .anchor=${this._controller.anchor ?? undefined}
        .arrowOffset=${this._arrowOffset}
        .shiftPadding=${8}
        ?open=${this.open}
        flip
        shift
      >
        <div ${ref(this._containerRef)} part=${partMap(parts)}>
          <slot>${this.message}</slot>
          ${
            this.sticky
              ? html`
                  <slot name="close-button" @click=${this._hideOnCloseClick}>
                    <button
                      type="button"
                      part="close-button"
                      aria-label="Close"
                    >
                      <igc-icon
                        name="input_clear"
                        collection="default"
                        aria-hidden="true"
                      ></igc-icon>
                    </button>
                  </slot>
                `
              : nothing
          }
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
