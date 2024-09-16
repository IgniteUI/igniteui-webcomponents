import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref';

const Events = ['pointerdown', 'pointermove', 'lostpointercapture'];
const defaultState: GestureState = Object.freeze({ x: 0, y: 0, time: 0 });

/**
 * Gesture options
 */
export interface GesturesOptions {
  ref?: Ref;
  thresholdTime?: number;
  thresholdDistance?: number;
  touchOnly?: boolean;
}

type GestureState = {
  x: number;
  y: number;
  time: number;
};

type GestureDirection = 'left' | 'up' | 'right' | 'down';

export type GestureData = {
  direction: GestureDirection;
  type: string;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

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
  private _ref?: Ref;
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
        return this._handleLostPointerCapture(event);
    }
  }

  public hostConnected() {
    for (const event of Events) {
      this._element.addEventListener(event, this, { passive: true });
    }
  }

  public hostDisconnected() {
    for (const event of Events) {
      this._element.removeEventListener(event, this);
    }
  }

  public updateOptions(options: Omit<GesturesOptions, 'ref'>) {
    Object.assign(this._options, options);
  }

  private _getGestureState({
    clientX: x,
    clientY: y,
  }: PointerEvent): GestureState {
    return { x, y, time: Date.now() };
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
    this._pointerState.start = this._getGestureState(event);
    this._setPointerCaptureState(event, true);
  }

  private _handlePointerMove(event: PointerEvent) {
    if (this._pointerState.captured) {
      this._pointerState.current = this._getGestureState(event);
    }
  }

  private _emit(name: string, data: GestureData) {
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

  // REVIEW: Maybe add diagonal deltas?
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
  }
}

export function addGesturesController(
  host: ReactiveControllerHost & HTMLElement,
  options?: GesturesOptions
) {
  return new GesturesController(host, options);
}
