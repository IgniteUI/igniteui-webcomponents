import { isServer } from 'lit';

/*
 * The `mousedown` of a press moves focus, and a control that validates on blur
 * can then show a message that moves the content below it. The browser sends
 * `click` to the common ancestor of the `mousedown` and `mouseup` targets, so a
 * press on a button that moved before `mouseup` does not click the button.
 *
 * Only trusted presses of the primary button count: they are the ones that
 * click, and synthetic events from scripts cannot leave a press open.
 */

const pending = new Set<() => void>();
/**
 * The `click` of a press goes out in the same task as its `mouseup`, so the
 * release waits for a message, which is a later task. Fake timers in tests do
 * not hold a message as they hold a timeout.
 */
let releaseChannel: MessageChannel | undefined;
/** Set while a release message is queued. A new press clears it. */
let releaseQueued = false;
let pressed = false;

function isPrimaryButton(event: Event): boolean {
  return event.isTrusted && (event as MouseEvent).button === 0;
}

function handlePressStart(event: Event): void {
  if (isPrimaryButton(event)) {
    releaseQueued = false;
    pressed = true;
    window.addEventListener('pointermove', handlePointerMove, true);
  }
}

function handlePressEnd(event: Event): void {
  if (event.type === 'pointercancel' || isPrimaryButton(event)) {
    scheduleRelease();
  }
}

/** A release outside the window can go unreported, so a move with no button down also ends the press. */
function handlePointerMove(event: PointerEvent): void {
  if (event.isTrusted && event.buttons === 0) {
    scheduleRelease();
  }
}

function scheduleRelease(): void {
  if (pressed && !releaseQueued) {
    releaseQueued = true;
    releaseChannel!.port2.postMessage(null);
  }
}

function release(): void {
  if (!releaseQueued) {
    return;
  }

  releaseQueued = false;
  pressed = false;
  window.removeEventListener('pointermove', handlePointerMove, true);

  for (const callback of pending) {
    callback();
  }

  pending.clear();
}

/**
 * Starts to track presses of the primary pointer button in the document.
 * Call it before a press can start, for example in a constructor. Later calls
 * do nothing.
 */
export function trackPointerPress(): void {
  if (isServer || releaseChannel) {
    return;
  }

  releaseChannel = new MessageChannel();
  releaseChannel.port1.onmessage = release;

  for (const type of ['pointerdown', 'mousedown']) {
    window.addEventListener(type, handlePressStart, true);
  }

  for (const type of ['pointerup', 'mouseup', 'pointercancel']) {
    window.addEventListener(type, handlePressEnd, true);
  }

  // A release that the page does not get, for example on the popup of a
  // native select, must not hold the keyboard use that follows.
  window.addEventListener('keydown', scheduleRelease, true);
  window.addEventListener('blur', scheduleRelease);
}

/** Whether a press of the primary pointer button is in progress. */
export function isPointerPressed(): boolean {
  return pressed;
}

/**
 * Queues `callback` to run when the current press of the primary pointer
 * button ends, after its `click`. A callback that is already queued runs one
 * time only.
 *
 * @returns `false` when no press is in progress. The callback is not queued.
 */
export function afterPointerPress(callback: () => void): boolean {
  if (!pressed) {
    return false;
  }

  pending.add(callback);
  return true;
}
