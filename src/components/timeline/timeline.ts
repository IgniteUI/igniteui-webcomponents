import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { timelineContext } from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { TimelineOrientation, TimelinePosition } from '../types.js';
import IgcTimelineItemComponent from './item.js';
import { styles } from './timeline.base.css.js';

/* blazorAdditionalDependency: IgcTimelineItemComponent */
/**
 * A container component that arranges `igc-timeline-item` elements along a
 * vertical or horizontal axis connected by a visual line.
 *
 * @remarks
 * The timeline owns the shared grid tracks and every item lays its parts out
 * on them through CSS subgrid, so the connector line stays aligned across items
 * regardless of their content and the `opposite` track sizes to its widest entry.
 *
 * @element igc-timeline
 *
 * @slot - Renders `igc-timeline-item` elements.
 *
 * @cssproperty --item-min-height - The minimum block size of a vertical timeline item.
 * @cssproperty --item-min-width - The minimum inline size of a horizontal timeline item.
 *
 * @example
 * ```html
 * <igc-timeline position="end">
 *   <igc-timeline-item complete>
 *     <span slot="opposite">09:00</span>
 *     Order placed
 *   </igc-timeline-item>
 *   <igc-timeline-item active>
 *     <span slot="opposite">10:30</span>
 *     Shipped
 *   </igc-timeline-item>
 *   <igc-timeline-item>
 *     <span slot="opposite">Tomorrow</span>
 *     Delivered
 *   </igc-timeline-item>
 * </igc-timeline>
 * ```
 */
export default class IgcTimelineComponent extends LitElement {
  public static readonly tagName = 'igc-timeline';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTimelineComponent, IgcTimelineItemComponent);
  }

  //#region Internal state

  private readonly _provider = addContextProvider(this, {
    context: timelineContext,
    watch: ['orientation', 'position'],
    value: () => this,
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: () => this._provider.publish(),
  });

  //#endregion

  //#region Public properties

  /** Returns all `igc-timeline-item` children of the timeline. */
  public get items(): IgcTimelineItemComponent[] {
    return this._slots.getAssignedElements<IgcTimelineItemComponent>(
      '[default]',
      { selector: IgcTimelineItemComponent.tagName }
    );
  }

  /**
   * The axis along which the items are laid out.
   *
   * @attr
   * @default vertical
   */
  @property({ reflect: true })
  public orientation: TimelineOrientation = 'vertical';

  /**
   * The side of the connector line on which the main content of the items is
   * rendered. The `opposite` slot content always renders on the other side.
   *
   * In vertical orientation `start` and `end` refer to the inline axis, in
   * horizontal orientation to the block axis. `alternate` switches sides on
   * every item. An item with its own `position` set ignores this value.
   *
   * @attr
   * @default alternate
   */
  @property({ reflect: true })
  public position: TimelinePosition = 'alternate';

  //#endregion

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: { role: 'list' },
    });
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
