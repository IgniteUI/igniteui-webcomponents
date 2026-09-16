import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { isElement } from '#internals/utils/dom.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { BadgeShape, StyleVariant } from '../types.js';
import { styles } from './themes/badge.base.css.js';
import { styles as shared } from './themes/shared/badge.common.css.js';
import { all } from './themes/themes.js';

/**
 * The badge is a component indicating a status on a related item or an area
 * where some active indication is required.
 *
 * @element igc-badge
 *
 * @slot - Default slot for the badge content.
 *
 * @csspart base - The base wrapper of the badge.
 * @csspart icon - The icon container, present when an `igc-icon` is the only slotted element.
 *
 * @example
 * ```html
 * <igc-badge variant="success">New</igc-badge>
 * <igc-badge variant="danger" shape="square">5</igc-badge>
 * <igc-badge dot></igc-badge>
 * ```
 */
export default class IgcBadgeComponent extends LitElement {
  public static readonly tagName = 'igc-badge';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBadgeComponent);
  }

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._handleSlotChange,
  });

  private _hasIcon = false;

  /**
   * The type (style variant) of the badge.
   *
   * @attr variant
   * @default 'primary'
   */
  @property({ reflect: true })
  public variant: StyleVariant = 'primary';

  /**
   * Sets whether to draw an outlined version of the badge.
   *
   * @attr outlined
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The shape of the badge.
   *
   * @attr shape
   * @default 'rounded'
   */
  @property({ reflect: true })
  public shape: BadgeShape = 'rounded';

  /**
   * Sets whether to render a dot type badge.
   * When enabled, the badge appears as a small dot without any content.
   *
   * @attr dot
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public dot = false;

  constructor() {
    super();

    addThemingController(this, all);

    addInternalsController(this, {
      initialARIA: { role: 'status', ariaRoleDescription: 'badge' },
    });
  }

  /**
   * The `icon` part is reserved for a badge whose only content is a single
   * `igc-icon`, which renders as a circle rather than a padded pill. The filter
   * discards the whitespace text nodes that formatted markup leaves around it.
   */
  protected _handleSlotChange(): void {
    const [content, ...rest] = this._slots
      .getAssignedNodes('[default]')
      .filter((node) => isElement(node) || node.textContent?.trim());

    this._hasIcon =
      isEmpty(rest) && isElement(content) && content.matches('igc-icon');
  }

  protected override render() {
    return html`
      <span part=${partMap({ base: true, icon: this._hasIcon })}>
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-badge': IgcBadgeComponent;
  }
}
