import {
  noChange,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import type { DirectiveResult } from 'lit/directive.js';
import { type LiveDirective, live } from 'lit/directives/live.js';
import type { Ref } from 'lit/directives/ref.js';
import { createTimer } from '../timing.js';

type HiddenUntilFoundOptions = {
  /** Opens the host as a user does; returns `false` when the open is canceled. */
  reveal: () => boolean;
  /** The content element, which shows before an open animation measures it. */
  content?: Ref<HTMLElement>;
};

/** The controllers in which a reveal of the browser runs. */
const revealing = new Set<HiddenUntilFoundController>();

/**
 * Whether a reveal of the browser runs in any host. Hosts open and close
 * without animation then: the browser scrolls to the match right after the
 * reveal, and an animated height above the match would move it away.
 */
export function isRevealing(): boolean {
  return revealing.size > 0;
}

/**
 * Hides the content of a collapsible host with `hidden="until-found"`, so that
 * find-in-page, a text fragment or a link to an element in the content opens
 * the host.
 *
 * @remarks
 * The host binds {@link HiddenUntilFoundController.value} to the `hidden`
 * attribute of the content element and
 * {@link HiddenUntilFoundController.handleBeforeMatch} as its `beforematch`
 * listener. The element that carries `hidden` must have no author `display`
 * rule: where the browser does not know `until-found`, its `[hidden]` rule
 * hides the element.
 *
 * The browser removes the attribute of each closed ancestor, innermost first,
 * and stops when an attribute changed in a `beforematch` handler or in the
 * microtasks after it. So the host state changes at once, and the attribute
 * stays the browser's until the next task.
 */
class HiddenUntilFoundController implements ReactiveController {
  private readonly _host: ReactiveControllerHost;
  private readonly _options: HiddenUntilFoundOptions;
  private readonly _timer = createTimer(() => this._end());
  private _closing = false;

  constructor(host: ReactiveControllerHost, options: HiddenUntilFoundOptions) {
    this._host = host;
    this._options = options;
    host.addController(this);
  }

  /** Whether a reveal of the browser runs in this host. */
  public get revealing(): boolean {
    return this._timer.active;
  }

  /** Whether the close animation runs. The content shows until it ends. */
  public get closing(): boolean {
    return this._closing;
  }

  /** The `hidden` binding of the content; `noChange` while a reveal runs. */
  public value(
    hidden: boolean,
    findable = true
  ): DirectiveResult<typeof LiveDirective> | typeof noChange {
    if (this.revealing) {
      return noChange;
    }

    // `live()` writes the value back after the browser removed it.
    return live(
      hidden && !this._closing ? (findable ? 'until-found' : '') : nothing
    );
  }

  /**
   * Plays the open or close animation of the content with `play`. While a
   * reveal runs in any host, it skips the animation and returns `true`.
   */
  public animate(
    open: boolean,
    play: () => Promise<boolean>
  ): Promise<boolean> | boolean {
    if (isRevealing()) {
      return true;
    }

    if (open) {
      this._options.content?.value?.removeAttribute('hidden');
      return play();
    }

    this._setClosing(true);
    return play().finally(() => this._setClosing(false));
  }

  /** The `beforematch` listener of the content element. */
  public readonly handleBeforeMatch = (event: Event): void => {
    // An element of the slotted content that the browser reveals.
    if (event.target !== event.currentTarget) {
      return;
    }

    revealing.add(this);
    this._timer.start();

    if (!this._options.reveal()) {
      // Stops the reveal where the browser follows the standard. Elsewhere,
      // the next render hides the content again.
      (event.currentTarget as Element).setAttribute('hidden', '');
    }
  };

  private _setClosing(closing: boolean): void {
    this._closing = closing;
    this._host.requestUpdate();
  }

  private _end(): void {
    revealing.delete(this);
    this._host.requestUpdate();
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this.revealing) {
      this._timer.stop();
      this._end();
    }
  }
}

/** Creates a {@link HiddenUntilFoundController} for the given host. */
export function addHiddenUntilFoundController(
  host: ReactiveControllerHost,
  options: HiddenUntilFoundOptions
): HiddenUntilFoundController {
  return new HiddenUntilFoundController(host, options);
}

export type { HiddenUntilFoundController };
