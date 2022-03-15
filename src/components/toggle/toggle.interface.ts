import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { IgcPlacement, IgcToggleEventMap } from './utilities';

export interface IToggleComponent {
  open: boolean;
  placement: IgcPlacement;
  positionStrategy: 'absolute' | 'fixed';
  scrollStrategy?: 'scroll' | 'block' | 'close';
  flip?: boolean;
  offset?: { x: number; y: number };
  closeOnOutsideClick?: boolean;
  sameWidth?: boolean;

  hide(): void;
  show(): void;
  toggle(): void;
}

/** Optional base component in order to prevent duplicating properties. We should discuss if we need this at all! */
export class ToggleBaseComponent
  extends EventEmitterMixin<IgcToggleEventMap, Constructor<LitElement>>(
    LitElement
  )
  implements IToggleComponent
{
  /** Sets the open state of the component. */
  @property({ type: Boolean })
  public open = false;

  /** The preferred placement of the component around the target element.
   * @type {"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"}
   */
  @property()
  public placement: IgcPlacement = 'bottom-start';

  /** Sets the component's positioning strategy. */
  @property({ attribute: 'position-strategy' })
  public positionStrategy: 'absolute' | 'fixed' = 'absolute';

  /** Determines the behavior of the component during scrolling the container. */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: 'scroll' | 'block' | 'close' = 'scroll';

  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   */
  @property({ type: Boolean })
  public flip = false;

  /** The amount of offset in horizontal and/or vertical direction. */
  @property({
    converter: (value) => {
      const dimensions = value ? (value as string).split(',') : undefined;
      return dimensions
        ? {
            x: parseInt(dimensions[0]),
            y: parseInt(dimensions[1] ?? dimensions[0]),
          }
        : undefined;
    },
  })
  public offset!: { x: number; y: number };

  /** Whether the component should be hidden on clicking outside of it. */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = true;

  /** Whether the component's width should be the same as the target's one. */
  @property({ type: Boolean, attribute: 'same-width' })
  public sameWidth!: boolean;

  /** Hides the component. */
  public hide() {
    if (!this.open) return;
    this.open = false;
  }

  /** Shows the component. */
  public show() {
    if (this.open) return;
    this.open = true;
  }

  /** Toggles the open state of the component. */
  public toggle() {
    if (!this.open) {
      this.show();
    } else {
      this.hide();
    }
  }

  protected override render(): any {}
}
