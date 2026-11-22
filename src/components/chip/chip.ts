import { ChipResourceStringsEN } from 'igniteui-i18n-core';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  getCSSTransitions,
  transitionsSettled,
} from '#animations/css-transitions.js';
import {
  ariaBindings,
  HOST_DISCLOSURE_ATTRIBUTES,
  hostAria,
  hostDisclosure,
} from '#internals/controllers/aria-projection.js';
import { addKeybindings } from '#internals/controllers/key-bindings.js';
import {
  addSlotController,
  type InferSlotNames,
  setSlots,
} from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { all } from '#themes/chip/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconComponent from '../icon/icon.js';
import type { StyleVariant } from '../types.js';
import { styles } from './themes/chip.base.css.js';
import { styles as shared } from './themes/shared/chip.common.css.js';

export interface IgcChipComponentEventMap {
  igcRemove: CustomEvent<void>;
  igcSelect: CustomEvent<boolean>;
}

const Slots = setSlots('start', 'prefix', 'suffix', 'end');

const STYLE_PROPERTIES = [
  'selected',
  'selectable',
  'variant',
  'outlined',
  'disabled',
] as const;

/**
 * The chip bases whose transitions a change from code turned off with
 * `data-instant`. They turn back on in the first frame with no change from
 * code, so a scroll that changes chips in each frame does not turn them on and
 * off.
 */
class InstantBases {
  private readonly _bases = new Set<Element>();
  private _changedInFrame = false;
  private _quietFrameCheckScheduled = false;

  public add(base: Element): void {
    base.setAttribute('data-instant', '');
    this._bases.add(base);
    this._changedInFrame = true;

    if (!this._quietFrameCheckScheduled) {
      this._quietFrameCheckScheduled = true;
      requestAnimationFrame(this._clearInQuietFrame);
    }
  }

  public delete(base: Element): void {
    this._bases.delete(base);
    base.removeAttribute('data-instant');
  }

  private readonly _clearInQuietFrame = (): void => {
    this._quietFrameCheckScheduled = this._changedInFrame;
    this._changedInFrame = false;

    if (this._quietFrameCheckScheduled) {
      requestAnimationFrame(this._clearInQuietFrame);
      return;
    }

    for (const base of this._bases) {
      base.removeAttribute('data-instant');
    }
    this._bases.clear();
  };
}

const instantBases = new InstantBases();

const i18n = {
  defaultEN: ChipResourceStringsEN,
};

/**
 * Chips help people enter information, make selections, filter content, or trigger actions.
 *
 * @element igc-chip
 *
 * @slot - Renders the label of the chip.
 * @slot prefix - Renders content at the start of the chip, before the default content.
 * @slot start - Renders content at the start of the chip, before the prefix content.
 * @slot suffix - Renders content at the end of the chip after the default content.
 * @slot end - Renders content at the end of the chip, after the suffix content.
 * @slot select - Renders content while a selectable chip is selected. It replaces the default selected icon.
 * @slot remove - Renders content that replaces the default remove icon.
 *
 * @fires igcRemove - Emitted when the user activates the remove control. The chip does not remove itself.
 * @fires igcSelect - Emitted when the user selects or deselects the chip. The detail is the new selected state.
 *
 * @csspart base - The base wrapper of the chip.
 * @csspart action - The selection control of the chip, wrapping the chip content.
 * @csspart content - The wrapper element around the default slot of the chip.
 * @csspart prefix - The prefix container of the chip.
 * @csspart suffix - The suffix container of the chip.
 * @csspart remove - The container of the remove control of the chip.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcChipComponent extends I18nMixin(
  EventEmitterMixin<IgcChipComponentEventMap>(
    HostAriaMixin(LitElement, HOST_DISCLOSURE_ATTRIBUTES)
  ),
  i18n
) {
  public static readonly tagName = 'igc-chip';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcChipComponent, IgcIconComponent);
  }

  private readonly _baseRef = createRef<HTMLElement>();
  private readonly _removePartRef = createRef<HTMLSlotElement>();
  private readonly _slots = addSlotController(this, { slots: Slots });

  private _userSelection = false;

  /** How the current update shows a change of the style properties. */
  private _styleChangeMode?: 'animated' | 'at-once';

  /**
   * Identifies the running animation of a selection by the user. A newer
   * selection, or a change from code that joins it, replaces the token.
   */
  @state()
  private _userAnimationToken?: object;

  /**
   * Whether the chip is disabled.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether the chip shows a remove control. A disabled chip hides it.
   *
   * @attr removable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /**
   * Whether the chip is outlined.
   *
   * @attr outlined
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * Whether the chip can be selected.
   *
   * @attr selectable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selectable = false;

  /* @tsTwoWayProperty(true, "igcSelect", "detail", false) */
  /**
   * Whether the chip is selected.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * The color variant of the chip.
   *
   * @attr variant
   */
  @property({ reflect: true })
  public variant?: StyleVariant;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._removePartRef,
      skip: () => !this._removePartRef.value,
      bindingDefaults: { triggers: ['keyup'] },
    }).setActivateHandler(this._handleRemove);
  }

  public override disconnectedCallback(): void {
    const base = this._baseRef.value;
    if (base) {
      instantBases.delete(base);
    }
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!STYLE_PROPERTIES.some((name) => changed.has(name))) {
      return;
    }

    // A change from code while a selection by the user animates joins it.
    if (
      this._userSelection ||
      (this._userAnimationToken && !changed.has('selectable'))
    ) {
      this._userAnimationToken = {};
      this._styleChangeMode = 'animated';
    } else {
      this._userAnimationToken = undefined;
      // A new base has no styles to transition from.
      this._styleChangeMode = this.hasUpdated ? 'at-once' : undefined;
    }
    this._userSelection = false;
  }

  protected override updated(): void {
    // A disconnected chip has no base and no styles to transition from.
    const base = this._baseRef.value;

    if (this._styleChangeMode === 'animated') {
      this._trackUserAnimation(base);
    } else if (this._styleChangeMode === 'at-once' && base) {
      instantBases.add(base);
    }
    this._styleChangeMode = undefined;
  }

  protected _handleSelect(): void {
    if (this.selectable) {
      this._userSelection = true;
      this.selected = !this.selected;
      this.emitEvent('igcSelect', { detail: this.selected });
    }
  }

  protected _handleRemove(event: Event): void {
    event.stopPropagation();
    this.emitEvent('igcRemove');
  }

  private _hasSlotted(...slots: InferSlotNames<typeof Slots>[]): boolean {
    return slots.some((slot) => this._slots.hasAssignedElements(slot));
  }

  private async _trackUserAnimation(base?: HTMLElement): Promise<void> {
    const token = this._userAnimationToken;
    let transitions: CSSTransition[] = [];

    if (base) {
      instantBases.delete(base);
      transitions = getCSSTransitions(base, { subtree: true });
    }

    await transitionsSettled(transitions);

    if (this._userAnimationToken === token) {
      this._userAnimationToken = undefined;
    }
  }

  /* alternateName: focusComponent */
  /** Sets focus on the chip. */
  public override focus(options?: FocusOptions): void {
    super.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the chip. */
  public override blur(): void {
    cancelDeferredFocus(this);
    super.blur();
  }

  protected _renderPrefix() {
    const hasPrefix = this._hasSlotted('start', 'prefix');
    const animated = Boolean(this._userAnimationToken);
    const hasIndicator = this.selectable && (this.selected || animated);

    return html`
      <span part="prefix" ?hidden=${!hasIndicator && !hasPrefix}>
        ${
          hasIndicator
            ? html`
                <span
                  data-indicator
                  ?data-entering=${animated && this.selected}
                  ?data-leaving=${!this.selected}
                  ?data-gap=${hasPrefix}
                >
                  ${renderSlottedIcon({ slot: 'select', icon: 'selected' })}
                </span>
              `
            : nothing
        }
        <slot name="start"></slot>
        <slot name="prefix"></slot>
      </span>
    `;
  }

  protected _renderSuffix() {
    return html`
      <span part="suffix" ?hidden=${!this._hasSlotted('end', 'suffix')}>
        <slot name="suffix"></slot>
        <slot name="end"></slot>
      </span>
    `;
  }

  protected _renderRemove() {
    if (!this.removable || this.disabled) {
      return nothing;
    }

    return html`
      <span part="remove">
        <slot
          ${ref(this._removePartRef)}
          name="remove"
          @click=${this._handleRemove}
        >
          <igc-icon
            name="remove"
            collection="default"
            tabindex="0"
            role="button"
            aria-label=${this.resourceStrings.chip_remove}
          ></igc-icon>
        </slot>
      </span>
    `;
  }

  protected override render() {
    const ariaPressed = this.selectable ? this.selected.toString() : null;

    return html`
      <div ${ref(this._baseRef)} part="base">
        <button
          ${ariaBindings({ ...hostAria(this), ...hostDisclosure(this) })}
          part="action"
          type="button"
          .ariaPressed=${ariaPressed}
          ?disabled=${this.disabled}
          @click=${this._handleSelect}
        >
          ${this._renderPrefix()}
          <span part="content">
            <slot></slot>
          </span>
          ${this._renderSuffix()}
        </button>
        ${this._renderRemove()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}
