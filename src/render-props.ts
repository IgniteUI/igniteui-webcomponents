import { type ChildPart, html, noChange } from 'lit';
import {
  AsyncDirective,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';

export class SlotRequestEvent extends Event {
  public readonly data: unknown;
  public readonly name: string;
  public readonly slotName!: string;
  public readonly node!: Element;

  constructor(name: string, data: unknown, node: Element, key?: string) {
    super('slot-request', { bubbles: false, composed: false });
    this.name = name;
    this.data = data;
    this.slotName = key !== undefined ? `${name}${key}` : name;
    this.node = node;
  }
}

export const remove = Symbol('remove-slot-request');

class RequestRenderer<T> extends AsyncDirective {
  private readonly _key = crypto.randomUUID();
  private _part!: ChildPart;
  private _previousData!: T;
  private _data!: T;
  private _name!: string;
  private _host!: HTMLElement;
  private _target?: HTMLElement;

  /** Returns the parent element node. */
  private get _renderNode() {
    return this._part.parentNode as HTMLElement;
  }

  private get _eventTarget() {
    return this._target ?? this._host;
  }

  private _makeRequestEvent(data: T | typeof remove) {
    return new SlotRequestEvent(this._name, data, this._renderNode, this._key);
  }

  private _shouldUpdate() {
    const data: T & { $implicit: unknown } = this._data as T & {
      $implicit: unknown;
    };
    const isNgContext = Object.hasOwn(data, '$implicit');

    if (isNgContext && data.$implicit === this._previousData) {
      return false;
    }
    if (isNgContext) {
      this._previousData = data.$implicit as T;
    } else if (data === this._previousData) {
      return false;
    } else {
      this._previousData = data;
    }
    return true;
  }

  public override render(_name: string, _data: T, _target?: HTMLElement) {
    return noChange;
  }

  public override update(
    part: ChildPart,
    [name, data, target]: DirectiveParameters<this>
  ) {
    this._part = part;
    this._name = name;
    this._data = data;
    this._target = target;
    this._host = part.options!.host as HTMLElement;

    if (this._shouldUpdate() && this._eventTarget) {
      this._eventTarget.dispatchEvent(this._makeRequestEvent(this._data));
      return html``;
    }
    return noChange;
  }

  protected override disconnected() {
    this._eventTarget.dispatchEvent(this._makeRequestEvent(remove));
  }
}

export const requestRenderer = directive(RequestRenderer);
