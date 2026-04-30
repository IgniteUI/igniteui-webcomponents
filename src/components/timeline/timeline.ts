import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcTimelineItemComponent from './item.js';
import { styles } from './timeline.base.css.js';

/**
 * A container component that arranges `igc-timeline-item` elements along a
 * vertical or horizontal axis connected by a visual line.
 *
 * @element igc-timeline
 *
 * @slot - Renders `igc-timeline-item` elements.
 */
export default class IgcTimelineComponent extends LitElement {
  public static readonly tagName = 'igc-timeline';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTimelineComponent, IgcTimelineItemComponent);
  }

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._syncOrientation,
    initial: true,
  });

  @property({ reflect: true })
  public orientation: 'vertical' | 'horizontal' = 'vertical';

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('orientation')) {
      this._syncOrientation();
    }
  }

  private _syncOrientation(): void {
    const items = this._slots.getAssignedElements<IgcTimelineItemComponent>(
      '[default]',
      {
        selector: IgcTimelineItemComponent.tagName,
      }
    );

    for (const item of items) {
      item.dataset.orientation = this.orientation;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-timeline': IgcTimelineComponent;
  }
}
