import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { createAbortHandle } from '../abort-handler.js';

const Events = [
  'pointerdown',
  'pointermove',
  'lostpointercapture',
  'pointercancel',
] as const;
const defaultState: GestureState = Object.freeze({ x: 0, y: 0, time: 0 });

/** @hidden */
export interface GesturesOptions {
  /**
   * The element that the controller observes. Defaults to the host element.
   */
  ref?: Ref<HTMLElement>;
  /** The maximum time in milliseconds of a recognized gesture. */
  thresholdTime?: number;
  /** The minimum pointer travel in pixels of a recognized gesture. */
  thresholdDistance?: number;
  /** Whether the controller ignores the events of a mouse device. */
  touchOnly?: boolean;
}

type ResolvedGesturesOptions = GesturesOptions &
  Required<
    Pick<GesturesOptions, 'thresholdTime' | 'thresholdDistance' | 'touchOnly'>
  >;

type GestureState = {
  x: number;
  y: number;
  time: number;
};

type GestureDirection = 'left' | 'up' | 'right' | 'down';
type SwipeEvents =
  | 'swipe'
  | 'swipe-left'
  | 'swipe-up'
  | 'swipe-right'
  | 'swipe-down';

export type GestureData = {
  direction: GestureDirection;
  type: string;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

/* blazorSuppress */
export class SwipeEvent extends Event {
  public readonly data: GestureData;

  constructor(name: string, data: GestureData, initOptions?: EventInit) {
    super(name, initOptions);
    this.data = data;
  }
}

class GesturesController extends EventTarget implements ReactiveController {
  private readonly _host: ReactiveControllerHost & HTMLElement;
  private readonly _ref?: Ref<HTMLElement>;
  private readonly _abortHandle = createAbortHandle();

  /** The options of the controller, with the defaults applied. */
  private _options: ResolvedGesturesOptions = {
    thresholdDistance: 100,
    thresholdTime: 500,
    touchOnly: false,
  };

  private _pointerState = {
    captured: false,
    start: defaultState,
    current: defaultState,
  };

  private get _element() {
    return this._ref ? this._ref.value! : this._host;
  }

  public get options(): GesturesOptions {
    return this._options;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options?: GesturesOptions
  ) {
    super();

    Object.assign(this._options, options);
    this._ref = this._options.ref;

    this._host = host;
    this._host.addController(this);
  }

  /** Adds an event listener for the given swipe event. */
  public set(
    type: SwipeEvents,
    callback: (event: SwipeEvent) => void,
    options?: AddEventListenerOptions
  ): this {
    const bound = callback.bind(this._host) as EventListener;

    this.addEventListener(type, bound, options);
    return this;
  }

  /** @internal */
  public handleEvent(event: PointerEvent): void {
    if (this._options.touchOnly && event.pointerType === 'mouse') {
      return;
    }

    switch (event.type) {
      case 'pointerdown':
        this._handlePointerDown(event);
        break;
      case 'pointermove':
        this._handlePointerMove(event);
        break;
      case 'lostpointercapture':
      case 'pointercancel':
        this._handleLostPointerCapture(event);
    }
  }

  /** @internal */
  public hostConnected(): void {
    const { signal } = this._abortHandle;

    this._host.updateComplete.then(() => {
      if (signal.aborted || !this._element) {
        return;
      }

      for (const event of Events) {
        this._element.addEventListener(event, this, { passive: true, signal });
      }
    });
  }

  /** @internal */
  public hostDisconnected(): void {
    this._abortHandle.abort();
  }

  public updateOptions(options: Omit<GesturesOptions, 'ref'>): void {
    Object.assign(this._options, options);
  }

  private _getGestureState({
    clientX: x,
    clientY: y,
  }: PointerEvent): GestureState {
    return { x, y, time: Date.now() };
  }

  private _setTouchActionState(disabled: boolean) {
    this._element.style.touchAction = disabled ? 'none' : '';
  }

  private _resetState() {
    this._pointerState.start = defaultState;
    this._pointerState.current = defaultState;
  }

  private _setPointerCaptureState(event: PointerEvent, state: boolean) {
    this._pointerState.captured = state;
    state
      ? this._element.setPointerCapture(event.pointerId)
      : this._element.releasePointerCapture(event.pointerId);
  }

  private _handlePointerDown(event: PointerEvent) {
    const state = this._getGestureState(event);

    this._setTouchActionState(true);
    // Seed both, so a press without movement gives a zero delta.
    this._pointerState.start = state;
    this._pointerState.current = state;
    this._setPointerCaptureState(event, true);
  }

  private _handlePointerMove(event: PointerEvent) {
    if (this._pointerState.captured) {
      this._pointerState.current = this._getGestureState(event);
    }
  }

  private _emit(name: SwipeEvents, data: GestureData) {
    return this.dispatchEvent(new SwipeEvent(name, data));
  }

  private _createEventArgs() {
    const { start, current } = this._pointerState;

    return {
      xStart: start.x,
      xEnd: current.x,
      yStart: start.y,
      yEnd: current.y,
    };
  }

  private _recognize(): GestureDirection | false {
    const { start, current } = this._pointerState;
    const { thresholdTime: time, thresholdDistance: distance } = this._options;

    const dt = current.time - start.time;
    const dx = current.x - start.x;
    const dy = current.y - start.y;

    if (dt > time) {
      return false;
    }

    if (dx > distance && Math.abs(dy) < distance) {
      return 'right';
    }

    if (-dx > distance && Math.abs(dy) < distance) {
      return 'left';
    }

    if (dy > distance && Math.abs(dx) < distance) {
      return 'down';
    }

    if (-dy > distance && Math.abs(dx) < distance) {
      return 'up';
    }

    return false;
  }

  private _handleLostPointerCapture(event: PointerEvent) {
    this._setPointerCaptureState(event, false);
    const state = this._recognize();

    if (state) {
      const args: GestureData = Object.assign(this._createEventArgs(), {
        type: event.pointerType,
        direction: state,
      });

      this._emit('swipe', args);
      this._emit(`swipe-${state}`, args);
    }

    this._resetState();
    this._setTouchActionState(false);
  }
}

/** Creates a {@link GesturesController} and adds it to `host`. */
export function addGesturesController(
  host: ReactiveControllerHost & HTMLElement,
  options?: GesturesOptions
) {
  return new GesturesController(host, options);
}
