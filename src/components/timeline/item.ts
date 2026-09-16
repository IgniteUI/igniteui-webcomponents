import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { timelineContext } from '#internals/context.js';
import { createAsyncContext } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import type { TimelineItemPosition } from '../types.js';
import { styles } from './item.base.css.js';
import type IgcTimelineComponent from './timeline.js';

/**
 * Represents an individual event in an `igc-timeline`.
 *
 * @remarks
 * The item resolves its layout from the parent timeline: the orientation, the
 * side of the connector its content goes to and whether the preceding item is
 * `complete`. The connector segment between two items is drawn solid when the
 * earlier of the two is `complete`, so a run of complete items reads as
 * progress along the line.
 *
 * @element igc-timeline-item
 *
 * @slot - Renders the main content of the timeline item.
 * @slot indicator - Renders custom content inside the indicator. Without content the indicator collapses to a dot.
 * @slot opposite - Renders content on the side opposite to the main content.
 *
 * @csspart opposite - The wrapper of the opposite-side content slot.
 * @csspart connector - The container holding the connector line and indicator.
 * @csspart indicator - The circular indicator element.
 * @csspart content - The wrapper of the main content slot.
 * @csspart empty - Indicates that a slot has no content. Applies to `opposite` and `indicator`.
 *
 * @cssproperty --indicator-size - The diameter of the indicator. Defaults to a compact dot without indicator content.
 * @cssproperty --indicator-border-width - The border width of the indicator.
 * @cssproperty --indicator-border-color - The border color of the indicator.
 * @cssproperty --indicator-background - The fill color of the indicator.
 * @cssproperty --indicator-color - The text color inside the indicator.
 * @cssproperty --indicator-shadow - The box-shadow of the indicator.
 * @cssproperty --indicator-shadow-active - The box-shadow of the indicator of an `active` item.
 * @cssproperty --connector-width - The thickness of the connector line.
 * @cssproperty --connector-background - The color/gradient of the connector line.
 * @cssproperty --connector-background-complete - The color/gradient of the connector line next to a `complete` item.
 * @cssproperty --connector-gap - The distance between the connector and the item content.
 *
 * @example
 * ```html
 * <igc-timeline-item complete>
 *   <igc-icon slot="indicator" name="check"></igc-icon>
 *   <time slot="opposite">Mar 2026</time>
 *   <h4>v3.0.0</h4>
 *   <p>Timeline component released.</p>
 * </igc-timeline-item>
 * ```
 */
export default class IgcTimelineItemComponent extends LitElement {
  public static readonly tagName = 'igc-timeline-item';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTimelineItemComponent);
  }

  //#region Internal state

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'listitem' },
    aria: () => ({ ariaCurrent: this.active ? 'true' : null }),
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots('indicator', 'opposite'),
  });

  private _timeline?: IgcTimelineComponent;

  //#endregion

  //#region Public properties

  /**
   * The side of the connector line on which the main content renders.
   * Overrides the `position` of the parent timeline for this item only.
   *
   * @remarks
   * In a `start` or `end` timeline the side tracks are shared, so the content
   * of an overriding item sizes the narrow `opposite` track for every item.
   * Reserve the override for short content there.
   *
   * @attr
   */
  @property({ reflect: true })
  public position?: TimelineItemPosition;

  /**
   * Marks the item as the current one. The indicator is emphasized and the
   * item is exposed as `aria-current` to assistive technology.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Marks the item as complete. The indicator is filled and the connector
   * segment towards the next item is drawn solid.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public complete = false;

  //#endregion

  constructor() {
    super();

    createAsyncContext(this, timelineContext, (timeline) => {
      this._timeline = timeline;
    });
  }

  //#region Lit lifecycle

  protected override willUpdate(changed: PropertyValues<this>): void {
    const items = this._timeline?.items ?? [];
    const index = items.indexOf(this);

    // The next item draws its connector from this one's `complete`.
    if (changed.has('complete')) {
      items[index + 1]?.requestUpdate();
    }

    this._internals.setState(
      'ig-horizontal',
      this._timeline?.orientation === 'horizontal'
    );
    this._internals.setState('ig-start', this._resolveSide(index) === 'start');
    this._internals.setState(
      'ig-previous-complete',
      items[index - 1]?.complete ?? false
    );
  }

  //#endregion

  //#region Internal API

  /** The side the main content renders on, after applying the timeline layout. */
  private _resolveSide(index: number): TimelineItemPosition {
    const position = this.position ?? this._timeline?.position ?? 'end';
    return position === 'alternate' ? (index % 2 ? 'start' : 'end') : position;
  }

  //#endregion

  protected override render() {
    const hasIndicator = this._slots.hasAssignedElements('indicator');
    const hasOpposite = this._slots.hasAssignedElements('opposite');

    return html`
      <div part=${partMap({ opposite: true, empty: !hasOpposite })}>
        <slot name="opposite"></slot>
      </div>
      <div part="connector">
        <div part=${partMap({ indicator: true, empty: !hasIndicator })}>
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
