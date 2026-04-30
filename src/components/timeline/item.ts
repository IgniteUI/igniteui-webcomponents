import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './item.base.css.js';

/**
 * Represents an individual event in an `igc-timeline`.
 *
 * @element igc-timeline-item
 *
 * @slot - Renders the main content of the timeline item.
 * @slot indicator - Renders custom content inside the indicator circle.
 * @slot opposite - Renders content on the side opposite to the main content.
 *
 * @csspart connector - The container holding the connector line and indicator.
 * @csspart indicator - The circular indicator element.
 * @csspart content - The wrapper of the main content slot.
 * @csspart opposite - The wrapper of the opposite-side content slot.
 *
 * @cssproperty --indicator-size - The diameter of the indicator circle.
 * @cssproperty --connector-width - The thickness of the connector line.
 * @cssproperty --connector-background - The color/gradient of the connector line.
 * @cssproperty --indicator-border-color - The border color of the indicator.
 * @cssproperty --indicator-background - The fill color of the indicator.
 * @cssproperty --indicator-shadow - The box-shadow of the indicator.
 */
export default class IgcTimelineItemComponent extends LitElement {
  public static readonly tagName = 'igc-timeline-item';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTimelineItemComponent);
  }

  /**
   * Controls which side the main content appears on relative to the connector line.
   * When omitted the layout alternates automatically based on item position.
   * @attr
   */
  @property({ reflect: true })
  public position?: 'start' | 'end';

  protected override render() {
    return html`
      <div part="opposite">
        <slot name="opposite"></slot>
      </div>
      <div part="connector">
        <div part="indicator">
          <slot name="indicator"></slot>
        </div>
      </div>
      <div part="content">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-timeline-item': IgcTimelineItemComponent;
  }
}
