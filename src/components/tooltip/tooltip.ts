import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { EaseOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeOut } from '../../animations/presets/fade/index.js';
import { scaleInCenter } from '../../animations/presets/scale/index.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { getElementByIdFromRoot, isString } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';
import { styles as shared } from './themes/shared/tooltip.common.css';
import { all } from './themes/themes.js';
import { styles } from './themes/tooltip.base.css.js';
import {
  addTooltipController,
  hideOnTrigger,
  showOnTrigger,
} from './tooltip-event-controller.js';
import service from './tooltip-service.js';

export interface IgcTooltipComponentEventMap {
  igcOpening: CustomEvent<Element | null>;
  igcOpened: CustomEvent<Element | null>;
  igcClosing: CustomEvent<Element | null>;
  igcClosed: CustomEvent<Element | null>;
}

function parseTriggers(string: string): string[] {
  return (string ?? '').split(',').map((part) => part.trim());
}

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
  private _controller = addTooltipController(this);
  private _target?: Element | null;
  private readonly _containerRef: Ref<HTMLElement> = createRef();
  private readonly _animationPlayer = addAnimationController(
    this,
    this._containerRef
  );

  private _timeoutId?: number;
  private _open = false;
  private _showTriggers = ['pointerenter'];
  private _hideTriggers = ['pointerleave'];
  private _showDelay = 200;
  private _hideDelay = 300;

  @query('#arrow')
  protected _arrowElement!: HTMLElement;

  /**
   * Whether the tooltip is showing.
   *
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set open(value: boolean) {
    this._open = value;
    this._open ? service.add(this, this[hideOnTrigger]) : service.remove(this);
  }

  public get open(): boolean {
    return this._open;
  }

  /**
   * Whether to disable the rendering of the arrow indicator for the tooltip.
   *
   * @attr disable-arrow
   */
  @property({ attribute: 'disable-arrow', type: Boolean, reflect: true })
  public disableArrow = false;

  /**
   * Improves positioning for inline based elements, such as links.
   *
   * @attr inline
   */
  @property({ type: Boolean, reflect: true })
  public inline = false;

  /**
   * The offset of the tooltip from the anchor.
   *
   * @attr offset
   */
  @property({ type: Number })
  public offset = 6;

  /**
   * Where to place the floating element relative to the parent anchor element.
   *
   * @attr placement
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
   */
  @property({ attribute: 'show-triggers' })
  public set showTriggers(value: string) {
    this._showTriggers = parseTriggers(value);
    this._controller.set(this._target, {
      show: this._showTriggers,
      hide: this._hideTriggers,
    });
  }

  public get showTriggers(): string {
    return this._showTriggers.join();
  }

  /**
   * Which event triggers will hide the tooltip.
   * Expects a comma separate string of different event triggers.
   *
   * @attr hide-triggers
   */
  @property({ attribute: 'hide-triggers' })
  public set hideTriggers(value: string) {
    this._hideTriggers = parseTriggers(value);
    this._controller.set(this._target, {
      show: this._showTriggers,
      hide: this._hideTriggers,
    });
  }

  public get hideTriggers(): string {
    return this._hideTriggers.join();
  }

  /**
   * Specifies the number of milliseconds that should pass before showing the tooltip.
   *
   * @attr show-delay
   */
  @property({ attribute: 'show-delay', type: Number })
  public set showDelay(value: number) {
    this._showDelay = Math.max(0, value);
  }

  public get showDelay(): number {
    return this._showDelay;
  }

  /**
   * Specifies the number of milliseconds that should pass before hiding the tooltip.
   *
   * @attr hide-delay
   */
  @property({ attribute: 'hide-delay', type: Number })
  public set hideDelay(value: number) {
    this._hideDelay = Math.max(0, value);
  }

  public get hideDelay(): number {
    return this._hideDelay;
  }

  /**
   * Specifies a plain text as tooltip content.
   *
   * @attr message
   */
  @property({ type: String })
  public message = '';

  /**
   * Specifies if the tooltip remains visible until the user closes it via the close button or Esc key.
   *
   * @attr sticky
   */
  @property({ type: Boolean })
  public sticky = false;

  constructor() {
    super();

    this._internals = this.attachInternals();
    this._internals.role = 'tooltip';
    this._internals.ariaAtomic = 'true';
    this._internals.ariaLive = 'polite';
  }

  protected override async firstUpdated() {
    if (!this._target) {
      this._setTarget(this.previousElementSibling);
    }

    if (this.open) {
      await this.updateComplete;
      this.requestUpdate();
    }
  }

  /** @internal */
  public override disconnectedCallback() {
    this._controller.remove(this._target);
    service.remove(this);

    super.disconnectedCallback();
  }

  @watch('anchor')
  protected _anchorChanged() {
    const target = isString(this.anchor)
      ? getElementByIdFromRoot(this, this.anchor)
      : this.anchor;

    this._setTarget(target);
  }

  private _setTarget(target?: Element | null) {
    if (!target) {
      return;
    }

    this._target = target;
    this._controller.set(target, {
      show: this._showTriggers,
      hide: this._hideTriggers,
    });
  }

  private async _toggleAnimation(dir: 'open' | 'close') {
    const animation =
      dir === 'open'
        ? scaleInCenter({ duration: 150, easing: EaseOut.Quad })
        : fadeOut({ duration: 75, easing: EaseOut.Sine });
    return this._animationPlayer.playExclusive(animation);
  }

  private async _applyTooltipState({
    show,
    withDelay = false,
    withEvents = false,
  }: {
    show: boolean;
    withDelay?: boolean;
    withEvents?: boolean;
  }): Promise<boolean> {
    if (show === this.open) return false;

    const delay = show ? this.showDelay : this.hideDelay;

    if (withEvents) {
      const eventName = show ? 'igcOpening' : 'igcClosing';
      const allowed = this.emitEvent(eventName, {
        cancelable: true,
        detail: this._target,
      });

      if (!allowed) return false;
    }

    const _commitStateChange = async () => {
      if (show) {
        this.open = true;
      }

      const result = await this._toggleAnimation(show ? 'open' : 'close');
      this.open = result ? show : !show;

      if (!result) {
        return false;
      }

      if (withEvents) {
        const eventName = show ? 'igcOpened' : 'igcClosed';
        this.emitEvent(eventName, { detail: this._target });
      }

      return result;
    };

    if (withDelay) {
      clearTimeout(this._timeoutId);
      return new Promise((resolve) => {
        this._timeoutId = setTimeout(() => {
          _commitStateChange().then(resolve);
        }, delay);
      });
    }

    return _commitStateChange();
  }

  private _setDelay(ms: number, action: 'open' | 'close'): Promise<boolean> {
    clearTimeout(this._timeoutId);
    return new Promise((resolve) => {
      this._timeoutId = setTimeout(async () => {
        if (action === 'open') {
          this.open = true;
        }

        const result = await this._toggleAnimation(action);
        // Update `open` after the animation to reflect the correct state based on event.type:
        // - Close → false if succeeded
        // - Open → true if succeeded
        this.open = action === 'close' ? !result : result;
        resolve(result);
      }, ms);
    });
  }

  /** Shows the tooltip if not already showing. */
  public show(): Promise<boolean> {
    return this._applyTooltipState({ show: true, withDelay: false });
  }

  /** Hides the tooltip if not already hidden. */
  public hide(): Promise<boolean> {
    return this._applyTooltipState({ show: false, withDelay: false });
  }

  /** Toggles the tooltip between shown/hidden state after the appropriate delay. */
  public toggle = async (): Promise<boolean> => {
    return this.open ? this.hide() : this.show();
  };

  public showWithEvent(): Promise<boolean> {
    return this._applyTooltipState({
      show: true,
      withDelay: true,
      withEvents: true,
    });
  }

  public hideWithEvent(): Promise<boolean> {
    return this._applyTooltipState({
      show: false,
      withDelay: true,
      withEvents: true,
    });
  }

  protected [showOnTrigger] = () => {
    this._animationPlayer.stopAll();
    clearTimeout(this._timeoutId);
    this.showWithEvent();
  };

  protected [hideOnTrigger] = (event?: Event) => {
    // Return if is sticky and the event does not explicitly indicate a forced hide
    if (
      this.sticky &&
      !(event instanceof CustomEvent && event.detail?.forceHide)
    ) {
      return;
    }

    this._animationPlayer.stopAll();
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => this.hideWithEvent(), 180);
  };

  protected override render() {
    return html`
      <igc-popover
        .inert=${!this.open}
        .placement=${this.placement}
        .offset=${this.offset}
        .anchor=${this._target ?? undefined}
        .arrow=${this.disableArrow ? null : this._arrowElement}
        ?open=${this.open}
        ?inline=${this.inline}
        flip
        shift
      >
        <div ${ref(this._containerRef)} part="base">
          <slot>${this.message ? html`${this.message}` : nothing}</slot>
          ${this.sticky
            ? html`
                <slot name="close-button" @click=${this.hideWithEvent}>
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
