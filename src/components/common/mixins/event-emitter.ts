import { LitElement } from "lit";
import { Constructor } from "./constructor";

type UnpackCustomEvent<T> = T extends CustomEvent<infer U> ? U : never;

export declare class EventEmitterInterface<E> {
  addEventListener<K extends keyof M, M extends E & HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof M, M extends E & HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  emitEvent<K extends keyof E, D extends UnpackCustomEvent<E[K]>>(type: K, eventInitDict?: CustomEventInit<D>): boolean;
}

export const EventEmitterMixin =
  <E, T extends Constructor<LitElement>>(superClass: T) => {
    class EventEmitterElement extends superClass {

      addEventListener<K extends keyof M, M extends E & HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: M[K]) => any, options?: boolean | AddEventListenerOptions): void;
      addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        super.addEventListener(type, listener, options);
      }

      removeEventListener<K extends keyof M, M extends E & HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: M[K]) => any, options?: boolean | EventListenerOptions): void;
      removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        super.removeEventListener(type, listener, options);
      }

      emitEvent<K extends keyof E, D extends UnpackCustomEvent<E[K]>>(type: K, eventInitDict?: CustomEventInit<D>): boolean {
        return this.dispatchEvent(new CustomEvent<D>(
          type as string,
          Object.assign(
            {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {}
            },
            eventInitDict
        )));
      }
    }
    return EventEmitterElement as Constructor<EventEmitterInterface<E>> & T;
  };
