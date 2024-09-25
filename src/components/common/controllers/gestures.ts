import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref';

const Events = [
  'pointerdown',
  'pointermove',
  'lostpointercapture',
  'pointercancel',
] as const;
const defaultState: GestureState = Object.freeze({ x: 0, y: 0, time: 0 });

/**
 * Configuration object for a {@link GesturesController} instance.
 */
export interface GesturesOptions {
  /**
   * By default, the controller listens for pointer/touch events in the context of the host element.
   * If you pass a `ref`, you can limit the observation to a certain DOM part of the host scope.
   */
  ref?: Ref<HTMLElement>;
  /**
   * The maximum amount of milliseconds between the start and end of a gesture combination
   * before it is recognized as such.
   */
  thresholdTime?: number;
  /**
   * The minimum amount a "pointer" should travel in pixels, before being recognized as a
   * gesture.
   */
  thresholdDistance?: number;
  /**
   * When enabled, the controller will skip events generated by a mouse device.
   */
  touchOnly?: boolean;
}

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
  public readonly name: string;

  constructor(name: string, data: GestureData, initOptions?: EventInit) {
    super(name, initOptions);
    this.name = name;
    this.data = data;
  }
}

class GesturesController extends EventTarget implements ReactiveController {
  private readonly _host: ReactiveControllerHost & HTMLElement;
  private _ref?: Ref<HTMLElement>;
  private _options: GesturesOptions = {
    thresholdDistance: 100,
    thresholdTime: 500,
    touchOnly: false,
  };

  private _pointerState = {
    captured: false,
    start: defaultState,
    current: defaultState,
  };

  protected get _element() {
    return this._ref ? this._ref.value! : this._host;
  }

  /** Get the current configuration object */
  public get options() {
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

  /**
   * Add an event listener for a given swipe event.
   */
  public set(
    type: SwipeEvents,
    callback: (event: SwipeEvent) => void,
    options?: AddEventListenerOptions
  ) {
    const bound = callback.bind(this._host) as EventListener;

    this.addEventListener(type, bound, options);
    return this;
  }

  public handleEvent(event: PointerEvent) {
    if (this._options.touchOnly && event.pointerType === 'mouse') {
      return;
    }
    switch (event.type) {
      case 'pointerdown':
        return this._handlePointerDown(event);
      case 'pointermove':
        return this._handlePointerMove(event);
      case 'lostpointercapture':
      case 'pointercancel':
        return this._handleLostPointerCapture(event);
    }
  }

  public async hostConnected() {
    await this._host.updateComplete;

    for (const event of Events) {
      this._element.addEventListener(event, this, { passive: true });
    }
  }

  public hostDisconnected() {
    for (const event of Events) {
      this._element.removeEventListener(event, this);
    }
  }

  /** Updates the configuration of the controller */
  public updateOptions(options: Omit<GesturesOptions, 'ref'>) {
    Object.assign(this._options, options);
  }

  private _getGestureState({
    clientX: x,
    clientY: y,
  }: PointerEvent): GestureState {
    return { x, y, time: Date.now() };
  }

  private _setTouchActionState(disabled: boolean) {
    Object.assign(this._element.style, {
      touchAction: disabled ? 'none' : undefined,
    });
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
    this._setTouchActionState(true);
    this._pointerState.start = this._getGestureState(event);
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

  protected _recognize(): GestureDirection | false {
    const { start, current } = this._pointerState;

    const dt = current.time - start.time;
    const dx = current.x - start.x;
    const dy = current.y - start.y;

    const time = this._options.thresholdTime ?? 500;
    const distance = this._options.thresholdDistance ?? 100;

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

/**
 * Adds a {@link GesturesController} responsible for managing gesture behaviors
 * for the given host element.
 */
export function addGesturesController(
  host: ReactiveControllerHost & HTMLElement,
  options?: GesturesOptions
) {
  return new GesturesController(host, options);
}
