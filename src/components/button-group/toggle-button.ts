import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { buttonGroupContext } from '#internals/context.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addKeyboardFocusRing } from '#internals/controllers/focus-ring.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { partMap } from '#internals/part-map.js';
import { setOrRemoveAttribute } from '#internals/utils/dom.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './themes/button.base.css.js';
import { all } from './themes/button.js';
import { styles as shared } from './themes/shared/button/button.common.css.js';

/**
 * The toggle button wraps a native button element and exposes additional `value` and `selected` properties.
 * It is used in the context of a button group to facilitate the creation of group/toolbar like UX behaviors.
 *
 * @element igc-toggle-button
 *
 * @slot - Renders the label/content of the button.
 *
 * @csspart toggle - The native button element.
 * @csspart focused - The native button element when focused through a keyboard interaction.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcToggleButtonComponent extends HostAriaMixin(
  LitElement
) {
  public static override styles = [componentBase, styles, shared];
  public static readonly tagName = 'igc-toggle-button';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcToggleButtonComponent);
  }

  private readonly _focusRingManager = addKeyboardFocusRing(this);
  private readonly _context = addAsyncContextConsumer(this, buttonGroupContext);

  private _ownTabIndex?: string | null;

  @query('[part~="toggle"]', true)
  private readonly _nativeButton?: HTMLButtonElement;

  /**
   * The value of the control.
   * @attr
   */
  @property()
  public value!: string;

  /**
   * Whether the button is selected.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Whether the button is disabled.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  public override disconnectedCallback(): void {
    this._releaseTabIndex();
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    const group = this._context.value;

    if (!group || group.instance !== this.parentElement) {
      return;
    }

    if (this._ownTabIndex === undefined) {
      this._ownTabIndex = this.getAttribute('tabindex');
    }

    setOrRemoveAttribute(this, 'tabindex', group.isTabStop(this) ? null : '-1');
  }

  /** Restores the `tabindex` that the group took over. */
  private _releaseTabIndex(): void {
    if (this._ownTabIndex === undefined) {
      return;
    }

    setOrRemoveAttribute(this, 'tabindex', this._ownTabIndex);

    this._ownTabIndex = undefined;
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has('selected') ||
      changedProperties.has('disabled')
    ) {
      this._context.value?.syncState(this);
    }
  }

  /* alternateName: focusComponent */
  /** Sets focus on the button. */
  public override focus(options?: FocusOptions): void {
    this._nativeButton?.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the button. */
  public override blur(): void {
    this._nativeButton?.blur();
  }

  /** Simulates a mouse click on the element. */
  public override click(): void {
    this._nativeButton?.click();
  }

  protected override render(): TemplateResult {
    const group = this._context.value?.instance;

    // In a single selection group the button is a radio. The group can also disable it.
    const isRadio = group != null && group.selection !== 'multiple';
    const disabled = this.disabled || Boolean(group?.disabled);
    const selectedState = this.selected ? 'true' : 'false';

    return html`
      <button
        part=${partMap({
          toggle: true,
          focused: this._focusRingManager.focused,
        })}
        type="button"
        role=${ifDefined(isRadio ? 'radio' : undefined)}
        ?disabled=${disabled}
        ${ariaBindings(hostAria(this))}
        aria-checked=${ifDefined(isRadio ? selectedState : undefined)}
        aria-pressed=${ifDefined(isRadio ? undefined : selectedState)}
        aria-disabled=${disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toggle-button': IgcToggleButtonComponent;
  }
}
