import { isServer } from 'lit';
import { escapeKey, isKey } from '#internals/controllers/keys.js';
import { isEmpty, lastOf } from '#internals/utils/arrays.js';
import { toggleEventListener } from '#internals/utils/events.js';
import type IgcTooltipComponent from './tooltip.js';

type TooltipHideCallback = () => unknown;

class TooltipEscapeCallbacks {
  private _collection = new Map<IgcTooltipComponent, TooltipHideCallback>();

  /** Keeps the global `keydown` listener bound while any tooltip is shown. */
  private _syncListener(): void {
    /* c8 ignore next 3 */
    if (isServer) {
      return;
    }

    toggleEventListener(
      globalThis,
      !isEmpty(this._collection),
      'keydown',
      this
    );
  }

  public add(
    instance: IgcTooltipComponent,
    hideCallback: TooltipHideCallback
  ): void {
    if (this._collection.has(instance)) {
      return;
    }

    this._collection.set(instance, hideCallback);
    this._syncListener();
  }

  public remove(instance: IgcTooltipComponent): void {
    if (this._collection.delete(instance)) {
      this._syncListener();
    }
  }

  /** @internal */
  public async handleEvent(event: KeyboardEvent): Promise<void> {
    if (!isKey(event, escapeKey)) {
      return;
    }

    // The last registered tooltip is the last one shown.
    await lastOf(Array.from(this._collection.values()))?.();
  }
}

const service = new TooltipEscapeCallbacks();
export default service;
