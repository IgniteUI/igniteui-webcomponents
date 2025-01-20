import type { Ref } from 'lit/directives/ref.js';

export type ResizeMode = 'immediate' | 'deferred';
export type ResizeCallback = (params: ResizeCallbackParams) => unknown;
export type ResizeGhostFactory = () => HTMLElement;
export type ResizeElementResolver = () => HTMLElement;

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

export type ResizeControllerConfig = {
  ref?: Ref<HTMLElement> | Ref<HTMLElement>[];
  mode?: ResizeMode;
  deferredFactory?: ResizeGhostFactory;
  start?: ResizeCallback;
  resize?: ResizeCallback;
  end?: ResizeCallback;
  resizeTarget?: ResizeElementResolver;
};
