import { isServer } from 'lit';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { isEmpty, last } from '../common/util.js';
import type IgcTooltipComponent from './tooltip.js';

type TooltipHideCallback = () => unknown;

class TooltipEscapeCallbacks {
  private _collection = new Map<IgcTooltipComponent, TooltipHideCallback>();

  private _setListener(state = true): void {
    /* c8 ignore next 3 */
    if (isServer) {
      return;
    }

    if (isEmpty(this._collection)) {
      state
        ? globalThis.addEventListener('keydown', this)
        : globalThis.removeEventListener('keydown', this);
    }
  }

  public add(
    instance: IgcTooltipComponent,
    hideCallback: TooltipHideCallback
  ): void {
    if (this._collection.has(instance)) {
      return;
    }

    this._setListener();
    this._collection.set(instance, hideCallback);
  }

  public remove(instance: IgcTooltipComponent): void {
    if (!this._collection.has(instance)) {
      return;
    }

    this._collection.delete(instance);
    this._setListener(false);
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent): void {
    if (event.key !== escapeKey) {
      return;
    }

    const [tooltip, callback] = last(Array.from(this._collection.entries()));
    callback?.call(tooltip);
  }
}

const service = new TooltipEscapeCallbacks();
export default service;
