import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { getElementByIdFromRoot, isString } from '../common/util.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';
import { styles } from './themes/tooltip.base.css.js';
import {
  addTooltipController,
  hideOnTrigger,
  showOnTrigger,
} from './tooltip-event-controller.js';
import service from './tooltip-service.js';

// TODO: Expose events
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

  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTooltipComponent, IgcPopoverComponent);
  }
  private _internals: ElementInternals;
  private _controller = addTooltipController(this);
  private _target?: Element | null;
  private _containerRef: Ref<HTMLElement> = createRef();
  private _animationPlayer = addAnimationController(this, this._containerRef);

  private _timeoutId?: number;
  private toBeShown = false;
  private toBeHidden = false;
  private _open = false;
  private _showTriggers = ['pointerenter'];
  private _hideTriggers = ['pointerleave'];
  private _showDelay = 500;
  private _hideDelay = 500;

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
    this._open ? service.add(this) : service.remove(this);
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
  public offset = 4;

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
   * @attr
   */
  @property({ type: String })
  public message = '';

  constructor() {
    super();

    this._internals = this.attachInternals();
    this._internals.role = 'tooltip';
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
    const animation = dir === 'open' ? fadeIn : fadeOut;
    return this._animationPlayer.playExclusive(animation());
  }

  private async _forceAnimationStop() {
    this.toBeShown = false;
    this.toBeHidden = false;
    this.open = !this.open;
    this._animationPlayer.stopAll();
  }

  /** Shows the tooltip if not already showing. */
  public show = async (): Promise<boolean> => {
    clearTimeout(this._timeoutId);
    if (this.open) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      this._timeoutId = setTimeout(async () => {
        this.open = true;
        this.toBeShown = true;
        resolve(await this._toggleAnimation('open'));
        this.toBeShown = false;
      }, this.showDelay);
    });
  };

  /** Hides the tooltip if not already hidden. */
  public hide = async (): Promise<boolean> => {
    clearTimeout(this._timeoutId);
    if (!this.open) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      this._timeoutId = setTimeout(async () => {
        this.open = false;
        this.toBeHidden = true;
        resolve(await this._toggleAnimation('close'));
        this.toBeHidden = false;
      }, this.hideDelay);
    });
  };

  /** Toggles the tooltip between shown/hidden state after the appropriate delay. */
  public toggle = async (): Promise<boolean> => {
    return this.open ? this.hide() : this.show();
  };

  public showWithEvent = async () => {
    clearTimeout(this._timeoutId);
    if (this.toBeHidden) {
      await this._forceAnimationStop();
      return;
    }
    if (
      this.open ||
      !this.emitEvent('igcOpening', { cancelable: true, detail: this._target })
    ) {
      return;
    }
    if (await this.show()) {
      this.emitEvent('igcOpened', { detail: this._target });
    }
  };

  public hideWithEvent = async () => {
    clearTimeout(this._timeoutId);
    if (this.toBeShown) {
      await this._forceAnimationStop();
      return;
    }
    if (
      !this.open ||
      !this.emitEvent('igcClosing', { cancelable: true, detail: this._target })
    ) {
      return;
    }
    if (await this.hide()) {
      this.emitEvent('igcClosed', { detail: this._target });
    }
  };

  protected [showOnTrigger] = () => {
    this.showWithEvent();
  };

  protected [hideOnTrigger] = (ev: Event) => {
    const related = (ev as PointerEvent).relatedTarget as Node | null;
    // If the pointer moved into the tooltip element, don't hide
    if (related && (this.contains(related) || this._target?.contains(related)))
      return;

    this.hideWithEvent();
  };

  protected override render() {
    return html`
      <igc-popover
        .placement=${this.placement}
        .offset=${this.offset}
        .anchor=${this._target}
        .arrow=${this.disableArrow ? null : this._arrowElement}
        ?open=${this.open}
        ?inline=${this.inline}
        flip
        shift
      >
        <div
          ${ref(this._containerRef)}
          part="base"
          aria-hidden=${String(!this.open)}
          aria-live="polite"
          aria-atomic="true"
        >
          ${this.message ? html`${this.message}` : html`<slot></slot>`}
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
