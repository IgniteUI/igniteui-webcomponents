import { isServer } from 'lit';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { isEmpty, last } from '../common/util.js';
import { hideOnTrigger } from './tooltip-event-controller.js';
import type IgcTooltipComponent from './tooltip.js';

class TooltipEscapeCallbacks {
  private _collection: Map<IgcTooltipComponent, CallableFunction> = new Map();

  /**
   * Sets the global Escape key handler for closing any open igc-tooltip instances.
   *
   */
  private _setListeners(): void {
    if (isServer) {
      return;
    }

    if (isEmpty(this._collection)) {
      document.documentElement.addEventListener('keydown', this);
    }
  }

  /**
   * Removes the global Escape key handler for closing any open igc-tooltip instances.
   */
  private _removeListeners(): void {
    if (isServer) {
      return;
    }

    if (isEmpty(this._collection)) {
      document.documentElement.removeEventListener('keydown', this);
    }
  }

  public add(instance: IgcTooltipComponent): void {
    if (this._collection.has(instance)) {
      return;
    }

    this._setListeners();
    this._collection.set(instance, instance[hideOnTrigger]);
  }

  public remove(instance: IgcTooltipComponent): void {
    if (!this._collection.has(instance)) {
      return;
    }

    this._collection.delete(instance);
    this._removeListeners();
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent): void {
    if (event.key !== escapeKey) {
      return;
    }

    const callback = last(Array.from(this._collection.values()));
    callback?.();
  }
}

const service = new TooltipEscapeCallbacks();
export default service;
