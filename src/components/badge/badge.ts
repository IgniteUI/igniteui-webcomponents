import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { addSlotController } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
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
 * @slot - Default slot for the badge.
 *
 * @csspart base - The base wrapper of the badge.
 */
export default class IgcBadgeComponent extends LitElement {
  public static readonly tagName = 'igc-badge';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcBadgeComponent);
  }

  private _iconPart = false;

  private readonly _slots = addSlotController(this, {
    onChange: this._handleSlotChange,
  });

  protected _handleSlotChange(): void {
    const assignedNodes = this._slots.getAssignedNodes('[default]', true);
    this._iconPart = assignedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).tagName.toLowerCase() === 'igc-icon'
    );
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'status' },
  });

  /**
   * The type of badge.
   * @attr
   */
  @property({ reflect: true })
  public variant: StyleVariant = 'primary';

  /**
   * Sets whether to draw an outlined version of the badge.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The shape of the badge.
   * @attr
   */
  @property({ reflect: true })
  public shape: BadgeShape = 'rounded';

  /**
   * Sets whether to render a dot type badge.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public dot = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('variant')) {
      this._internals.setARIA({ ariaRoleDescription: `badge ${this.variant}` });
    }
  }

  protected override render() {
    return html`
      <span part=${partMap({ base: true, icon: this._iconPart })}>
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
