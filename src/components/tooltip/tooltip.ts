import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { getElementByIdFromRoot, isString } from '../common/util.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';
import { styles } from './themes/tooltip.base.css.js';
import {
  addTooltipController,
  hideOnTrigger,
} from './tooltip-event-controller.js';
import service from './tooltip-service.js';

// TODO: Expose events

function parseTriggers(string: string): string[] {
  return (string ?? '').split(',').map((part) => part.trim());
}

/**
 * @element igc-tooltip
 *
 * @slot - default slot
 */
export default class IgcTooltipComponent extends LitElement {
  public static readonly tagName = 'igc-tooltip';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTooltipComponent, IgcPopoverComponent);
  }
  private _internals: ElementInternals;
  private _controller = addTooltipController(this);
  private _target?: Element | null;
  private _containerRef: Ref<HTMLElement> = createRef();
  private _animationPlayer = addAnimationController(this, this._containerRef);

  private _autoHideTimeout?: number;
  private _open = false;
  private _showTriggers = ['pointerenter'];
  private _hideTriggers = ['pointerleave'];

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
      hide: this._showTriggers,
    });
  }

  public get hideTriggers(): string {
    return this._hideTriggers.join();
  }

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

  /** Shows the tooltip if not already showing. */
  public show = async () => {
    clearTimeout(this._autoHideTimeout);
    if (this.open) {
      return false;
    }

    this.open = true;
    return await this._toggleAnimation('open');
  };

  /** Hides the tooltip if not already hidden. */
  public hide = async () => {
    if (!this.open) {
      return false;
    }

    await this._toggleAnimation('close');
    this.open = false;
    clearTimeout(this._autoHideTimeout);
    return true;
  };

  protected [hideOnTrigger] = () => {
    this._autoHideTimeout = setTimeout(() => this.hide(), 180);
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
        <div ${ref(this._containerRef)} part="base">
          <slot></slot>
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
