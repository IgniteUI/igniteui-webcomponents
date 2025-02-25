import type { Ref } from 'lit/directives/ref.js';

export type ResizeMode = 'immediate' | 'deferred';
export type ResizeCallback = (params: ResizeCallbackParams) => unknown;
export type ResizeCancelCallback = (state: ResizeState) => unknown;
export type ResizeGhostFactory = () => HTMLElement;

export type ResizeState = {
  initial: DOMRect;
  current: DOMRect;
  deltaX: number;
  deltaY: number;
  ghost: HTMLElement | null;
  trigger: HTMLElement | null;
};

export type ResizeCallbackParams = {
  event: PointerEvent;
  state: ResizeState;
};

export type ResizeControllerConfiguration = {
  ref?: Ref<HTMLElement>[];
  mode?: ResizeMode;
  deferredFactory?: ResizeGhostFactory;
  /** Callback invoked at the start of a resize operation. */
  start?: ResizeCallback;
  /** Callback invoked on each pointer move during a resize operation. */
  resize?: ResizeCallback;
  /** Callback invoked when a resize operation completes. */
  end?: ResizeCallback;
  /** Callback invoked when a resize operation is cancelled. */
  cancel?: ResizeCancelCallback;
  /**
   * Optional callback that returns the DOM element which will be resized/resizing depending on the
   * configured mode of the controller.
   *
   * Defaults to the controller host.
   */
  resizeTarget?: () => HTMLElement;
};
