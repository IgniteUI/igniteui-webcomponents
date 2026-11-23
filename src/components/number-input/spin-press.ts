import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  isPointerPressed,
  trackPointerPress,
} from '#internals/pointer-press.js';
import { createTimer } from '#internals/timing.js';

/** The delay before a held spin button repeats, in milliseconds. */
const HOLD_DELAY = 400;
/** The interval of the repeats of a held spin button, in milliseconds. */
const REPEAT_INTERVAL = 60;

export type SpinDirection = 1 | -1;

export interface SpinPressCallbacks {
  /** Steps the value. Returns whether the value changed. */
  step(direction: SpinDirection): boolean;
  /** Runs when a mouse or pen press starts, before its first step. */
  start(): void;
  /** Runs when a press ends: on release, cancel, blur or disconnect. */
  end(): void;
}

/**
 * The presses of the two spin buttons. Bind the listener of a button to its
 * `pointerdown`, `pointerup`, `pointercancel`, `lostpointercapture`, `click`
 * and `contextmenu` events.
 *
 * - A mouse or pen press steps at once. A touch steps on release, so that a
 *   scroll that starts on the button does not step.
 * - A held press repeats the step after 400 ms, then every 60 ms.
 * - A click without a pointer press, as from assistive technology, steps one
 *   time. The buttons set `touch-action: manipulation`, so the click of a tap
 *   comes in the same press, without a double-tap delay.
 */
export class SpinPressController implements ReactiveController {
  private readonly _callbacks: SpinPressCallbacks;
  private readonly _timer = createTimer(() => this._repeat());

  private _press?: {
    button: HTMLButtonElement;
    direction: SpinDirection;
    stepped: boolean;
  };

  /** The listener of the increment button. */
  public readonly increment: EventListenerObject;
  /** The listener of the decrement button. */
  public readonly decrement: EventListenerObject;

  /** Whether a press is held. */
  public get pressed(): boolean {
    return this._press !== undefined;
  }

  constructor(host: ReactiveControllerHost, callbacks: SpinPressCallbacks) {
    this._callbacks = callbacks;
    this.increment = { handleEvent: (event) => this._handleEvent(event, 1) };
    this.decrement = { handleEvent: (event) => this._handleEvent(event, -1) };

    trackPointerPress();
    host.addController(this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this.stop();
  }

  /** Ends the press, if any. */
  public stop(): void {
    const press = this._press;

    this._timer.stop();
    this._press = undefined;

    if (press) {
      this._callbacks.end();
    }
  }

  private _handleEvent(event: Event, direction: SpinDirection): void {
    switch (event.type) {
      case 'pointerdown':
        this._start(event as PointerEvent, direction);
        break;
      case 'pointerup':
        this._release();
        break;
      case 'click':
        // The click of a pointer press does not step again.
        if (!isPointerPressed()) {
          this._callbacks.step(direction);
        }
        break;
      case 'contextmenu':
        // A long press or a right-click opens no menu.
        event.preventDefault();
        break;
      default:
        this.stop();
    }
  }

  private _start(event: PointerEvent, direction: SpinDirection): void {
    const button = event.currentTarget as HTMLButtonElement;

    // No press moves the focus to the button, also one that does not step.
    event.preventDefault();

    if (!event.isPrimary || event.button !== 0 || button.disabled) {
      return;
    }

    // A synthetic event has no active pointer to capture.
    if (event.isTrusted) {
      button.setPointerCapture(event.pointerId);
    }

    const touch = event.pointerType === 'touch';
    this._press = { button, direction, stepped: !touch };

    // A touch does not focus the input, so that no virtual keyboard opens.
    if (!touch) {
      this._callbacks.start();
      this._callbacks.step(direction);
    }

    this._timer.start(HOLD_DELAY);
  }

  private _release(): void {
    const press = this._press;

    if (press && !press.stepped) {
      this._callbacks.step(press.direction);
    }

    this.stop();
  }

  private _repeat(): void {
    const press = this._press!;

    // A render that removes the buttons ends no press on them.
    if (!press.button.isConnected) {
      this.stop();
      return;
    }

    press.stepped = true;
    if (this._callbacks.step(press.direction)) {
      this._timer.start(REPEAT_INTERVAL);
    }
  }
}

/** Adds a {@link SpinPressController} to `host`. */
export function addSpinPress(
  host: ReactiveControllerHost,
  callbacks: SpinPressCallbacks
): SpinPressController {
  return new SpinPressController(host, callbacks);
}
