import type { LitElement } from 'lit';

import type { AbstractConstructor, Constructor } from './constructor';

export type UnpackCustomEvent<T> = T extends CustomEvent<infer U> ? U : never;

export declare class EventEmitterInterface<E> {
  public addEventListener<K extends keyof M, M extends E & HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: M[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  public removeEventListener<
    K extends keyof M,
    M extends E & HTMLElementEventMap,
  >(
    type: K,
    listener: (this: HTMLElement, ev: M[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  public emitEvent<K extends keyof E, D extends UnpackCustomEvent<E[K]>>(
    type: K,
    eventInitDict?: CustomEventInit<D>
  ): boolean;
}

export function EventEmitterMixin<E, T extends AbstractConstructor<LitElement>>(
  superClass: T
): Constructor<EventEmitterInterface<E>> & T;
export function EventEmitterMixin<E, T extends Constructor<LitElement>>(
  superClass: T
) {
  class EventEmitterElement extends superClass {
    /**
     * @private
     */
    public override addEventListener<
      K extends keyof M,
      M extends E & HTMLElementEventMap,
    >(
      type: K,
      listener: (this: HTMLElement, ev: M[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    public override addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void {
      super.addEventListener(type, listener, options);
    }

    /**
     * @private
     */
    public override removeEventListener<
      K extends keyof M,
      M extends E & HTMLElementEventMap,
    >(
      type: K,
      listener: (this: HTMLElement, ev: M[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
    public override removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void {
      super.removeEventListener(type, listener, options);
    }

    /**
     * @private
     */
    public emitEvent<K extends keyof E, D extends UnpackCustomEvent<E[K]>>(
      type: K,
      eventInitDict?: CustomEventInit<D>
    ): boolean {
      return this.dispatchEvent(
        new CustomEvent<D>(
          type as string,
          Object.assign(
            {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {},
            },
            eventInitDict
          )
        )
      );
    }
  }
  return EventEmitterElement as Constructor<EventEmitterInterface<E>> & T;
}
