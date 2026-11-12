import {
  noChange,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import type { DirectiveResult } from 'lit/directive.js';
import { type LiveDirective, live } from 'lit/directives/live.js';

type HiddenUntilFoundOptions = {
  /**
   * Opens the host the way a user does, with its events. Returns whether the
   * host is open, or opening, when the call returns: `false` when a handler
   * of the cancelable event stopped the open.
   */
  reveal: () => boolean;
};

/**
 * Hides the content of a collapsible host with `hidden="until-found"`, so that
 * find-in-page, a text fragment or a link to an element in the content opens
 * the host.
 *
 * @remarks
 * The host binds {@link HiddenUntilFoundController.value} to the `hidden`
 * attribute of the content element and
 * {@link HiddenUntilFoundController.handleBeforeMatch} as its `beforematch`
 * listener. The element that carries `hidden` must have no
 * author `display` rule: where the browser does not know `until-found`, its
 * `[hidden]` rule hides the element.
 *
 * The browser removes the attribute of each closed ancestor, innermost first,
 * and stops when an attribute changed in a `beforematch` handler or in the
 * microtasks after it. So the host state changes at once, and the attribute
 * stays the browser's until the next task.
 */
class HiddenUntilFoundController implements ReactiveController {
  private readonly _host: ReactiveControllerHost;
  private readonly _options: HiddenUntilFoundOptions;
  private _timer?: ReturnType<typeof setTimeout>;

  constructor(host: ReactiveControllerHost, options: HiddenUntilFoundOptions) {
    this._host = host;
    this._options = options;
    host.addController(this);
  }

  /**
   * Whether a reveal of the browser runs. The host opens without its
   * animation then: the browser scrolls to the match right after the reveal.
   */
  public get revealing(): boolean {
    return this._timer !== undefined;
  }

  /**
   * The value of the `hidden` attribute of the content: `until-found` while it
   * is hidden and `findable`, an empty string (plain `hidden`) while it is
   * hidden and not findable, and no attribute while it shows.
   */
  public value(
    hidden: boolean,
    findable = true
  ): DirectiveResult<typeof LiveDirective> | typeof noChange {
    if (this.revealing) {
      return noChange;
    }

    // `live()` writes the value back after the browser removed it.
    return live(hidden ? (findable ? 'until-found' : '') : nothing);
  }

  /** The `beforematch` listener of the content element. */
  public readonly handleBeforeMatch = (event: Event): void => {
    // An element of the slotted content that the browser reveals.
    if (event.target !== event.currentTarget) {
      return;
    }

    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._end());

    if (!this._options.reveal()) {
      // Stops the reveal where the browser follows the standard. Elsewhere,
      // the next render hides the content again.
      (event.currentTarget as Element).setAttribute('hidden', '');
    }
  };

  private _end(): void {
    this._timer = undefined;
    this._host.requestUpdate();
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this.revealing) {
      clearTimeout(this._timer);
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
