import { ChildPart, html, nothing } from 'lit';
import {
  AsyncDirective,
  DirectiveParameters,
  directive,
} from 'lit/async-directive.js';

export class SlotRequestEvent extends Event {
  public readonly data: unknown;
  public readonly name: string;
  public readonly slotName!: string;
  public readonly node!: Element;
  public isReact = false;

  constructor(name: string, data: unknown, node: Element, key?: string) {
    super('slot-request', { bubbles: false, composed: false });
    this.name = name;
    this.data = data;
    this.slotName = key !== undefined ? `${name}${key}` : name;
    this.node = node;
  }
}

export const remove = Symbol('remove-slot-request');

type RendererCallback<T> = (data: T) => unknown;
type RendererKey<T> = string | number | RendererCallback<T>;

class RequestRenderer<T> extends AsyncDirective {
  private _part!: ChildPart;
  private _data!: T;
  private _key?: RendererKey<T>;
  private _name!: string;
  private _host!: HTMLElement;
  private _fallback?: RendererCallback<T>;
  private _target?: HTMLElement;

  /** Returns the parent element node. */
  private get _renderNode() {
    return this._part.parentNode as HTMLElement;
  }

  private get _eventTarget() {
    return this._target ?? this._host;
  }

  protected get resolvedKey() {
    if (this._key === undefined) {
      return undefined;
    }
    return typeof this._key === 'function'
      ? (this._key(this._data) as string)
      : `${this._key}`;
  }

  private _makeRequestEvent(data: T | typeof remove) {
    return new SlotRequestEvent(
      this._name,
      data,
      this._renderNode,
      this.resolvedKey
    );
  }

  private _renderer({ isReact }: SlotRequestEvent) {
    return html`${isReact ? nothing : this._fallback?.(this._data)}`;
  }

  // private __dispose() {
  //   Object.assign(this, {
  //     _part: null,
  //     _name: null,
  //     _data: null,
  //     _target: null,
  //     _key: null,
  //     _host: null,
  //     _fallback: null,
  //     _$parent: null,
  //     __part: null,
  //   });
  // }

  public override render(
    _name: string,
    _data: T,
    _key?: RendererKey<T>,
    _fallback?: RendererCallback<T>,
    _target?: HTMLElement
  ) {}

  public override update(
    part: ChildPart,
    [name, data, key, fallback, target]: DirectiveParameters<this>
  ) {
    this._part = part;
    this._name = name;
    this._data = data;
    this._target = target;
    this._key = key;
    this._fallback = fallback;
    this._host = part.options!.host as HTMLElement;

    const event = this._makeRequestEvent(this._data);

    this._eventTarget.dispatchEvent(event);
    return this._renderer(event);
  }

  protected override disconnected() {
    this._eventTarget.dispatchEvent(this._makeRequestEvent(remove));
    // REVIEW:
    // this.__dispose();
  }
}

export const requestRenderer = directive(RequestRenderer);
